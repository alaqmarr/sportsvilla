import { prisma } from './src/lib/prisma';

async function check() {
  const member = await prisma.member.findFirst({ where: { walletBalance: { gt: 0 } } });
  
  const txs = await prisma.walletTransaction.findMany({ 
    where: { memberId: member?.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Wallet Transactions for member:", member?.name);
  txs.forEach(t => console.log(t.type, t.amount, t.description));
}

check().catch(console.error).finally(() => prisma.$disconnect());
