import { prisma } from '@/lib/prisma';
import { formatIST } from '@/lib/dateUtils';
import Link from 'next/link';

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
  
  return (
    <div className="p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">PhonePe Transactions</h1>
        <p className="text-gray-400 mt-2">Monitor PhonePe payment logs, verification status, and gateway identifiers.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#2a2d3e]">
          <p className="text-gray-400 text-sm font-medium">Total Transactions</p>
          <p className="text-3xl font-bold text-white mt-1">{totalCount}</p>
        </div>
        <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#2a2d3e]">
          <p className="text-gray-400 text-sm font-medium">Total Value (Success)</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">₹{totalSuccessValue.toFixed(2)}</p>
        </div>
        <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#2a2d3e]">
          <p className="text-gray-400 text-sm font-medium">Success Rate</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{successRate}%</p>
        </div>
      </div>

      <div className="bg-[#161923] rounded-xl border border-[#2a2d3e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c1f2e] border-b border-[#2a2d3e]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date (IST)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Error Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1c1f2e] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatIST(tx.createdAt, 'dd MMM yyyy, hh:mm a')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                    {tx.gatewayOrderId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                    {tx.gatewayPaymentId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                    ₹{tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${
                      tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      tx.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tx.member?.name || 'Guest'} {tx.member?.mobile ? `(${tx.member.mobile})` : ''}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-400 max-w-xs truncate" title={tx.errorMessage || ''}>
                    {tx.errorMessage ? (tx.errorMessage.length > 35 ? `${tx.errorMessage.slice(0, 35)}...` : tx.errorMessage) : '-'}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-[#1c1f2e] border-t border-[#2a2d3e]">
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/phonepe?page=${currentPage - 1}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161923] text-gray-300 border border-[#2a2d3e] hover:bg-[#202434]"
                >
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/phonepe?page=${currentPage + 1}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161923] text-gray-300 border border-[#2a2d3e] hover:bg-[#202434]"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
