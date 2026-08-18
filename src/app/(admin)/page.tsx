export const dynamic = 'force-dynamic';
import { formatIST } from "@/lib/dateUtils";
import { prisma } from "@/lib/prisma";
import { FiUsers, FiActivity, FiCheckCircle, FiPlus, FiMessageCircle, FiCalendar } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import CheckinScanner from "@/components/CheckinScanner";
import Link from "next/link";

export default async function Dashboard() {
  const nowUtc = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(nowUtc.getTime() + istOffsetMs);
  const todayStart = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()) - istOffsetMs);
  
  const nextWeek = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalMembers, activePlans, todaysAttendance, expiringMemberships, sports, todayBookings] = await Promise.all([
    prisma.member.count(),
    prisma.memberMembership.count({
      where: { status: "ACTIVE", endDate: { gte: new Date() } }
    }),
    prisma.attendance.count({
      where: { date: { gte: todayStart } }
    }),
    prisma.memberMembership.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
          lte: nextWeek
        }
      },
      include: { member: true, membershipPlan: { include: { sport: true } } },
      orderBy: { endDate: "asc" }
    }),
    prisma.sport.findMany({ orderBy: { name: 'asc' } }),
    prisma.booking.count({
      where: { 
        startTime: { gte: todayStart },
        status: 'CONFIRMED'
      }
    })
  ]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 mt-2">Welcome back to the Sportsvilla management portal.</p>
        </div>
        
        {/* Quick Actions Row */}
        <div className="flex items-center gap-3">
          <Link href="/bookings?new=true" className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors">
            <FiPlus /> New Booking
          </Link>
          <Link href="/members" className="flex items-center gap-2 px-4 py-2 bg-[#1c1f2e] border border-[#2a2d3e] hover:bg-[#2a2d3e] text-white rounded-lg font-medium transition-colors">
            <FiUsers /> Members
          </Link>
        </div>
      </div>

      {/* KPI Grid (Bento Box Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-xl mb-4 border border-orange-500/20">
            <FiUsers />
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-white">{totalMembers}</div>
          <div className="text-sm text-gray-400 mt-1">Total Members</div>
        </div>
        
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4 border border-emerald-500/20">
            <FiActivity />
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-white">{activePlans}</div>
          <div className="text-sm text-gray-400 mt-1">Active Plans</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl mb-4 border border-blue-500/20">
            <FiCheckCircle />
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-white">{todaysAttendance}</div>
          <div className="text-sm text-gray-400 mt-1">Check-ins Today</div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl mb-4 border border-purple-500/20">
            <FiCalendar />
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-white">{todayBookings}</div>
          <div className="text-sm text-gray-400 mt-1">Bookings Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area: Quick Check-in */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-['Outfit'] text-white">Quick Check-in Kiosk</h3>
              <div className="text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Scanner Active
              </div>
            </div>
            <CheckinScanner sports={sports} />
          </div>
        </div>

        {/* Sidebar: Expiring Soon */}
        <div className="space-y-8">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-['Outfit'] text-white">Expiring Soon</h3>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-lg font-medium border border-red-500/20">Next 7 Days</span>
            </div>
            
            {expiringMemberships.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-[#0f1117] rounded-xl border border-dashed border-[#2a2d3e] flex flex-col items-center justify-center">
                <FiCheckCircle className="text-3xl mb-3 text-emerald-500/50" />
                <p>No plans expiring soon.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {expiringMemberships.map(m => {
                  const phone = m.member?.mobile.replace(/\D/g, '');
                  const waLink = `https://wa.me/${phone?.length === 10 ? '91'+phone : phone}?text=${encodeURIComponent(`Hi ${m.member?.name}, your ${m.membershipPlan?.sport?.name} plan at Sportsvilla is expiring on ${formatIST(new Date(m.endDate), 'MMM d')}. Please renew to continue playing!`)}`;
                  
                  return (
                    <div key={m.id} className="flex flex-col p-4 rounded-xl bg-[#1c1f2e] border border-[#2a2d3e] hover:border-gray-600 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 text-red-400 flex items-center justify-center text-sm font-bold shadow-inner">
                            {m.member?.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm group-hover:text-orange-400 transition-colors">{m.member?.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{m.member?.mobile}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-400">{formatIST(new Date(m.endDate), 'MMM d')}</div>
                          <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{m.membershipPlan?.sport?.name}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-medium py-2 rounded-lg border border-[#25D366]/20 transition-colors">
                          <FaWhatsapp size={14} /> Send Reminder
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
