import { prisma } from "../src/lib/prisma";

async function testNfcM1() {
  console.log("=== Testing Milestone 1: NFC Database, Relations & Operations ===");

  // 1. Verify schema tables exist
  console.log("1. Verifying models in Prisma client...");
  if (!prisma.nfcCard || !prisma.nfcTransaction) {
    throw new Error("NfcCard or NfcTransaction model missing from Prisma Client!");
  }
  console.log("✓ NfcCard and NfcTransaction models exist in Prisma Client.");

  // 2. Find or create a test member
  console.log("2. Ensuring test member exists...");
  let member = await prisma.member.findFirst({
    where: { mobile: "9999988888" },
  });

  if (!member) {
    member = await prisma.member.create({
      data: {
        name: "Test NFC Player",
        mobile: "9999988888",
        email: "nfc.test@sportsvilla.com",
        walletBalance: 50000, // 500 INR in paise
      },
    });
    console.log("Created test member:", member.id);
  } else {
    console.log("Found test member:", member.id);
  }

  // 3. Test card creation and assignment
  console.log("3. Testing NfcCard creation...");
  const testCardUid = "04TEST" + Date.now().toString(16).toUpperCase();
  const card = await prisma.nfcCard.create({
    data: {
      cardUid: testCardUid,
      cardId: "SV-TEST-01",
      memberId: member.id,
      status: "ACTIVE",
      notes: "M1 Verification Test Card",
      assignedBy: "admin@sportsvilla.com",
    },
  });
  console.log("✓ Created NfcCard:", card.cardUid, "ID:", card.id);

  // 4. Test relation from Member to NfcCard
  const memberWithCards = await prisma.member.findUnique({
    where: { id: member.id },
    include: { nfcCards: true },
  });
  const foundCard = memberWithCards?.nfcCards.find((c) => c.cardUid === testCardUid);
  if (!foundCard) {
    throw new Error("Card relation to Member not found!");
  }
  console.log("✓ Member -> NfcCard relation verified.");

  // 5. Test NfcTransaction logging
  console.log("5. Testing NfcTransaction logging...");
  const tx = await prisma.nfcTransaction.create({
    data: {
      cardId: card.id,
      cardUid: card.cardUid,
      memberId: member.id,
      type: "CHECKIN",
      status: "SUCCESS",
      amount: 0,
      deviceType: "KEYBOARD_WEDGE",
      readerLocation: "FRONT_DESK_KIOSK",
      metadata: JSON.stringify({ test: true, slot: "06:00 PM" }),
    },
  });
  console.log("✓ Created NfcTransaction:", tx.id, "Type:", tx.type);

  // 6. Test Card -> Transactions relation
  const cardWithTx = await prisma.nfcCard.findUnique({
    where: { id: card.id },
    include: { transactions: true },
  });
  if (!cardWithTx?.transactions.length) {
    throw new Error("Card -> Transactions relation failed!");
  }
  console.log("✓ NfcCard -> NfcTransaction relation verified.");

  // 7. Test Card Status Updates (Block / Unblock)
  console.log("7. Testing Card Status transitions...");
  const blockedCard = await prisma.nfcCard.update({
    where: { id: card.id },
    data: { status: "BLOCKED" },
  });
  if (blockedCard.status !== "BLOCKED") throw new Error("Failed to block card");
  console.log("✓ Block status verified.");

  const unblockedCard = await prisma.nfcCard.update({
    where: { id: card.id },
    data: { status: "ACTIVE" },
  });
  if (unblockedCard.status !== "ACTIVE") throw new Error("Failed to unblock card");
  console.log("✓ Unblock status verified.");

  // 8. Test cleanup of test transaction and card
  console.log("8. Cleaning up test artifacts...");
  await prisma.nfcTransaction.deleteMany({ where: { cardUid: testCardUid } });
  await prisma.nfcCard.deleteMany({ where: { cardUid: testCardUid } });
  await prisma.member.deleteMany({ where: { mobile: "9999988888" } });
  console.log("✓ Cleaned up test card, transaction, and test member.");

  console.log("=== All M1 Database & Model Tests Passed Successfully! ===");
}

testNfcM1()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
