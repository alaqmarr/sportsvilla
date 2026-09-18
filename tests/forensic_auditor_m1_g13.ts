import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";

interface ForensicCheck {
  id: string;
  name: string;
  status: "PASS" | "FAIL";
  details: string;
  rawOutput?: any;
}

const checks: ForensicCheck[] = [];

function recordCheck(id: string, name: string, status: "PASS" | "FAIL", details: string, rawOutput?: any) {
  checks.push({ id, name, status, details, rawOutput });
  console.log(`[${status}] ${id}: ${name} - ${details}`);
}

async function runAudit() {
  console.log("Starting Forensic Audit for Milestone R1 (Database Schema)...");

  // Check 1: Schema text inspection
  try {
    const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf8");

    const hasMemberTokens = /deviceTokens\s+DeviceToken\[\]/.test(schemaContent);
    const hasMemberNotifs = /notifications\s+Notification\[\]/.test(schemaContent);
    const hasDeviceTokenModel = /model\s+DeviceToken\s*\{/.test(schemaContent);
    const hasNotificationModel = /model\s+Notification\s*\{/.test(schemaContent);
    const hasDeviceTokenCascade = /member\s+Member\s+@relation\(fields:\s*\[memberId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)/.test(schemaContent);
    const hasNotificationCascade = /member\s+Member\s+@relation\(fields:\s*\[memberId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)/.test(schemaContent);
    const hasDeviceTokenIndex = /@@index\(\[memberId\]\)/.test(schemaContent);
    const hasNotificationIndexes = /@@index\(\[memberId,\s*isRead\]\)/.test(schemaContent) && /@@index\(\[memberId,\s*createdAt\]\)/.test(schemaContent);

    if (
      hasMemberTokens &&
      hasMemberNotifs &&
      hasDeviceTokenModel &&
      hasNotificationModel &&
      hasDeviceTokenCascade &&
      hasNotificationCascade &&
      hasDeviceTokenIndex &&
      hasNotificationIndexes
    ) {
      recordCheck(
        "CHECK-1-SCHEMA-MODELS",
        "Prisma Schema Models & Relations",
        "PASS",
        "DeviceToken and Notification models are present with bidirectional relations, CASCADE delete, and indexes."
      );
    } else {
      recordCheck(
        "CHECK-1-SCHEMA-MODELS",
        "Prisma Schema Models & Relations",
        "FAIL",
        `Missing schema definitions: tokens=${hasMemberTokens}, notifs=${hasMemberNotifs}, dtModel=${hasDeviceTokenModel}, notifModel=${hasNotificationModel}, dtCascade=${hasDeviceTokenCascade}, notifCascade=${hasNotificationCascade}`
      );
    }
  } catch (err: any) {
    recordCheck("CHECK-1-SCHEMA-MODELS", "Prisma Schema Models & Relations", "FAIL", err.message);
  }

  // Check 2: Generated client files and delegates
  try {
    const generatedDir = path.resolve(__dirname, "../src/generated/client");
    const dtsPath = path.join(generatedDir, "index.d.ts");
    const clientSchemaPath = path.join(generatedDir, "schema.prisma");

    const dtsContent = fs.readFileSync(dtsPath, "utf8");
    const clientSchemaContent = fs.readFileSync(clientSchemaPath, "utf8");

    const hasDtDelegate = dtsContent.includes("DeviceTokenDelegate");
    const hasNotifDelegate = dtsContent.includes("NotificationDelegate");
    const hasDtInClientSchema = clientSchemaContent.includes("model DeviceToken");
    const hasNotifInClientSchema = clientSchemaContent.includes("model Notification");

    const dtDelegateType = typeof (prisma as any).deviceToken;
    const notifDelegateType = typeof (prisma as any).notification;

    if (
      hasDtDelegate &&
      hasNotifDelegate &&
      hasDtInClientSchema &&
      hasNotifInClientSchema &&
      dtDelegateType === "object" &&
      notifDelegateType === "object"
    ) {
      recordCheck(
        "CHECK-2-CLIENT-AUTHENTICITY",
        "Generated Client Authenticity",
        "PASS",
        "Client genuinely generated with DeviceToken and Notification delegates on prisma client instance."
      );
    } else {
      recordCheck(
        "CHECK-2-CLIENT-AUTHENTICITY",
        "Generated Client Authenticity",
        "FAIL",
        `Missing client artifacts: hasDtDelegate=${hasDtDelegate}, hasNotifDelegate=${hasNotifDelegate}, dtDelegateType=${dtDelegateType}, notifDelegateType=${notifDelegateType}`
      );
    }
  } catch (err: any) {
    recordCheck("CHECK-2-CLIENT-AUTHENTICITY", "Generated Client Authenticity", "FAIL", err.message);
  }

  // Check 3: SQLite table schema & foreign key definitions
  try {
    const tableSqlResults: any = await prisma.$queryRawUnsafe(
      `SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN ('DeviceToken', 'Notification') ORDER BY name`
    );

    const fkDtResults: any = await prisma.$queryRawUnsafe(`PRAGMA foreign_key_list('DeviceToken')`);
    const fkNotifResults: any = await prisma.$queryRawUnsafe(`PRAGMA foreign_key_list('Notification')`);

    const dtFkValid = fkDtResults.some(
      (fk: any) => fk.table === "Member" && fk.from === "memberId" && fk.to === "id" && fk.on_delete === "CASCADE"
    );
    const notifFkValid = fkNotifResults.some(
      (fk: any) => fk.table === "Member" && fk.from === "memberId" && fk.to === "id" && fk.on_delete === "CASCADE"
    );

    if (tableSqlResults.length === 2 && dtFkValid && notifFkValid) {
      recordCheck(
        "CHECK-3-SQLITE-FOREIGN-KEYS",
        "SQLite Foreign Key Constraints",
        "PASS",
        "DeviceToken and Notification SQLite tables define real FOREIGN KEY (memberId) REFERENCES Member(id) ON DELETE CASCADE",
        { tables: tableSqlResults, fkDeviceToken: fkDtResults, fkNotification: fkNotifResults }
      );
    } else {
      recordCheck(
        "CHECK-3-SQLITE-FOREIGN-KEYS",
        "SQLite Foreign Key Constraints",
        "FAIL",
        `Tables count=${tableSqlResults.length}, dtFkValid=${dtFkValid}, notifFkValid=${notifFkValid}`,
        { tables: tableSqlResults, fkDeviceToken: fkDtResults, fkNotification: fkNotifResults }
      );
    }
  } catch (err: any) {
    recordCheck("CHECK-3-SQLITE-FOREIGN-KEYS", "SQLite Foreign Key Constraints", "FAIL", err.message);
  }

  // Check 4: Empirical SQLite Foreign Key Enforcement (Non-existent memberId rejection)
  try {
    let dtFkRejected = false;
    let notifFkRejected = false;
    const fakeMemberId = "non_existent_member_123456789";

    // Enable PRAGMA foreign_keys explicitly on connection
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "DeviceToken" ("id", "memberId", "token", "createdAt", "updatedAt") VALUES ('dt_bad', '${fakeMemberId}', 'tok_bad', datetime('now'), datetime('now'))`
      );
    } catch (e: any) {
      if (e.message.includes("FOREIGN KEY constraint failed") || e.code === "P2003") {
        dtFkRejected = true;
      }
    }

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Notification" ("id", "memberId", "title", "body", "isRead", "createdAt") VALUES ('notif_bad', '${fakeMemberId}', 'title', 'body', 0, datetime('now'))`
      );
    } catch (e: any) {
      if (e.message.includes("FOREIGN KEY constraint failed") || e.code === "P2003") {
        notifFkRejected = true;
      }
    }

    if (dtFkRejected && notifFkRejected) {
      recordCheck(
        "CHECK-4-SQLITE-FK-ENFORCEMENT",
        "SQLite FK Integrity Enforcement",
        "PASS",
        "SQLite actively rejects orphan inserts into DeviceToken and Notification when member does not exist."
      );
    } else {
      recordCheck(
        "CHECK-4-SQLITE-FK-ENFORCEMENT",
        "SQLite FK Integrity Enforcement",
        "FAIL",
        `Orphan rejection failed: dtFkRejected=${dtFkRejected}, notifFkRejected=${notifFkRejected}`
      );
    }
  } catch (err: any) {
    recordCheck("CHECK-4-SQLITE-FK-ENFORCEMENT", "SQLite FK Integrity Enforcement", "FAIL", err.message);
  }

  // Check 5: Empirical Cascade Delete Behavior
  try {
    const testId = `audit_member_${Date.now()}`;
    const testMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const testToken = `fcm_audit_token_${Date.now()}`;

    // 1. Create member with deviceToken and notification
    await prisma.member.create({
      data: {
        id: testId,
        name: "Forensic Audit Member",
        mobile: testMobile,
        deviceTokens: {
          create: {
            token: testToken,
            platform: "android"
          }
        },
        notifications: {
          create: {
            title: "Test Push Notification",
            body: "Forensic test body payload",
            data: { event: "AUDIT_TEST" }
          }
        }
      }
    });

    const dtFoundBefore = await prisma.deviceToken.findFirst({ where: { memberId: testId } });
    const notifFoundBefore = await prisma.notification.findFirst({ where: { memberId: testId } });

    if (!dtFoundBefore || !notifFoundBefore) {
      throw new Error("Failed to insert or query test records prior to deletion.");
    }

    // 2. Delete member via raw SQL or Prisma with foreign_keys ON
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
    await prisma.member.delete({
      where: { id: testId }
    });

    // 3. Verify child records were cascade-deleted
    const dtFoundAfter = await prisma.deviceToken.findFirst({ where: { memberId: testId } });
    const notifFoundAfter = await prisma.notification.findFirst({ where: { memberId: testId } });

    // Also check via direct raw SQL in case Prisma delegates hide anything
    const rawDtRemaining: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "DeviceToken" WHERE "memberId" = '${testId}'`);
    const rawNotifRemaining: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "Notification" WHERE "memberId" = '${testId}'`);

    const dtCount = Number(rawDtRemaining[0]?.count ?? 0);
    const notifCount = Number(rawNotifRemaining[0]?.count ?? 0);

    if (!dtFoundAfter && !notifFoundAfter && dtCount === 0 && notifCount === 0) {
      recordCheck(
        "CHECK-5-CASCADE-DELETE",
        "Empirical SQLite Cascade Delete",
        "PASS",
        `Deleting Member (${testId}) automatically cascaded deletion of DeviceToken and Notification rows without leaving orphans.`
      );
    } else {
      recordCheck(
        "CHECK-5-CASCADE-DELETE",
        "Empirical SQLite Cascade Delete",
        "FAIL",
        `Orphans remained after delete! dtAfter=${!!dtFoundAfter} (count=${dtCount}), notifAfter=${!!notifFoundAfter} (count=${notifCount})`
      );
    }
  } catch (err: any) {
    recordCheck("CHECK-5-CASCADE-DELETE", "Empirical SQLite Cascade Delete", "FAIL", err.message);
  }

  // Check 6: Facade and Mock Detection
  try {
    const isMock =
      (prisma.deviceToken as any).isMock ||
      (prisma.notification as any).isMock ||
      typeof prisma.deviceToken.findMany !== "function" ||
      typeof prisma.notification.findMany !== "function";

    // Verify dynamic behavior
    const dtCountBefore = await prisma.deviceToken.count();
    const notifCountBefore = await prisma.notification.count();

    if (!isMock && typeof dtCountBefore === "number" && typeof notifCountBefore === "number") {
      recordCheck(
        "CHECK-6-FACADE-DETECTION",
        "Facade and Mock Detection",
        "PASS",
        `Prisma client delegates are genuine runtime query builder delegates (dtCount=${dtCountBefore}, notifCount=${notifCountBefore}).`
      );
    } else {
      recordCheck(
        "CHECK-6-FACADE-DETECTION",
        "Facade and Mock Detection",
        "FAIL",
        "Potential facade or mock detected in Prisma client delegates."
      );
    }
  } catch (err: any) {
    recordCheck("CHECK-6-FACADE-DETECTION", "Facade and Mock Detection", "FAIL", err.message);
  }

  console.log("\n================ AUDIT SUMMARY ================");
  const allPass = checks.every((c) => c.status === "PASS");
  console.log(`FINAL VERDICT: ${allPass ? "CLEAN" : "INTEGRITY VIOLATION"}`);
  console.log("Checks summary:", JSON.stringify(checks, (key, value) => (typeof value === "bigint" ? value.toString() : value), 2));

  if (!allPass) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error("Fatal audit runner error:", err);
  process.exit(1);
});
