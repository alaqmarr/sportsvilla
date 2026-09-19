import { prisma } from "@/core/database/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import si from "systeminformation";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/core/storage/s3";

export interface AppLog {
  timestamp: string;
  level: string;
  message: string;
  meta: any;
}

export interface ServerStats {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: string | number;
    cores: number;
    currentLoad: number;
  };
  mem: {
    total: number;
    active: number;
    free: number;
    usedPercent: number;
  };
  os: {
    platform: string;
    distro: string;
    uptime: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  }[];
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

export interface SaveAppVersionInput {
  platform: string;
  version: string;
  forceUpdate: boolean;
  downloadUrl: string;
  fileKey?: string;
  releaseNotes?: string;
}

export async function createAdminCore(data: CreateAdminInput) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await prisma.admin.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });
}

export async function deleteAdminCore(id: string, currentAdminEmail: string) {
  const currentAdmin = await prisma.admin.findFirst({
    where: { email: currentAdminEmail },
  });
  if (currentAdmin?.id === id) {
    throw new Error("Cannot delete your own admin account");
  }

  return await prisma.admin.delete({ where: { id } });
}

export async function fetchLogsCore(): Promise<AppLog[]> {
  try {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      return [];
    }

    const files = fs
      .readdirSync(logDir)
      .filter((f) => (f.startsWith("app-") && f.endsWith(".log")) || f === "app.log")
      .sort()
      .reverse();

    if (files.length === 0) return [];

    let allLines: string[] = [];

    // Read from the newest file(s) until we have at least 200 lines
    for (const file of files) {
      const filePath = path.join(logDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim() !== "");
      allLines = [...lines, ...allLines]; // older files go before newer files
      if (allLines.length >= 200) break;
    }

    const logs: AppLog[] = [];
    const startIdx = Math.max(0, allLines.length - 200);

    for (let i = allLines.length - 1; i >= startIdx; i--) {
      try {
        logs.push(JSON.parse(allLines[i]));
      } catch (e) {
        // Skip invalid JSON
      }
    }
    return logs;
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return [];
  }
}

export async function getAppVersionsCore() {
  return await prisma.appVersion.findMany();
}

export async function saveAppVersionCore(data: SaveAppVersionInput) {
  const bucketName = process.env.R2_BUCKET_NAME || "";

  const existing = await prisma.appVersion.findUnique({
    where: { platform: data.platform },
  });

  if (
    existing &&
    existing.fileKey &&
    data.fileKey &&
    existing.fileKey !== data.fileKey
  ) {
    // New APK uploaded, delete the old one from R2
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: existing.fileKey,
      });
      await s3Client.send(command);
    } catch (e) {
      console.error("Failed to delete old APK from R2", e);
    }
  }

  return await prisma.appVersion.upsert({
    where: { platform: data.platform },
    update: {
      version: data.version,
      forceUpdate: data.forceUpdate,
      downloadUrl: data.downloadUrl,
      fileKey: data.fileKey,
      releaseNotes: data.releaseNotes,
    },
    create: {
      platform: data.platform,
      version: data.version,
      forceUpdate: data.forceUpdate,
      downloadUrl: data.downloadUrl,
      fileKey: data.fileKey,
      releaseNotes: data.releaseNotes,
    },
  });
}

export async function fetchAuditLogsCore(limit: number = 100) {
  return await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function fetchServerStatsCore(): Promise<ServerStats> {
  try {
    const [cpu, currentLoad, mem, os, disk] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.mem(),
      si.osInfo(),
      si.fsSize(),
    ]);

    return {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpu.speed,
        cores: cpu.cores,
        currentLoad: currentLoad.currentLoad,
      },
      mem: {
        total: mem.total,
        active: mem.active,
        free: mem.free,
        usedPercent: (mem.active / mem.total) * 100,
      },
      os: {
        platform: os.platform,
        distro: os.distro,
        uptime: si.time().uptime,
      },
      disk: disk.map((d) => ({
        total: d.size,
        used: d.used,
        free: d.available,
        usedPercent: d.use,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch server stats:", error);
    throw new Error("Failed to fetch server stats");
  }
}
