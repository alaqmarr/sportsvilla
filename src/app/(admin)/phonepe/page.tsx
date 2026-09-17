import { prisma } from '@/lib/prisma';
import PhonePeClient from './PhonePeClient';

interface PageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function PhonePeDashboard({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1);
  const pageSize = 100;
  const skip = (currentPage - 1) * pageSize;

  const [totalCount, transactions, successSummary] = await Promise.all([
    prisma.transaction.count({ where: { gateway: 'PHONEPE' } }),
    prisma.transaction.findMany({
      where: { gateway: 'PHONEPE' },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip,
      include: {
        booking: {
          include: { turf: true }
        },
        member: true
      }
    }),
    prisma.transaction.aggregate({
      where: { gateway: 'PHONEPE', status: 'SUCCESS' },
      _sum: { amount: true },
      _count: { id: true }
    })
  ]);

  const totalSuccessValue = successSummary._sum.amount || 0;
  const totalSuccessCount = successSummary._count.id || 0;
  const successRate = totalCount > 0 ? Math.round((totalSuccessCount / totalCount) * 100) : 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const serializedTransactions = transactions.map((tx) => ({
    id: tx.id,
    gatewayOrderId: tx.gatewayOrderId,
    gatewayPaymentId: tx.gatewayPaymentId,
    amount: tx.amount,
    status: tx.status,
    createdAt: tx.createdAt.toISOString(),
    errorMessage: tx.errorMessage,
    member: tx.member ? {
      id: tx.member.id,
      name: tx.member.name,
      mobile: tx.member.mobile,
    } : null,
  }));

  return (
    <PhonePeClient
      transactions={serializedTransactions}
      totalCount={totalCount}
      totalSuccessValue={totalSuccessValue}
      successRate={successRate}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
