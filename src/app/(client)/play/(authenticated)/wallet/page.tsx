import { prisma } from '@/lib/prisma';
import { requireServerMember } from '@/lib/serverAuth';
import { WalletClient } from './WalletClient';

export default async function WalletPage() {
  const member = await requireServerMember();

  const profile = await prisma.member.findUnique({
    where: { id: member.id },
    select: { walletBalance: true },
  });

  const transactions = await prisma.walletTransaction.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <WalletClient profile={profile} transactions={transactions} />
  );
}
