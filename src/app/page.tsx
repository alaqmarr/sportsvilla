export const dynamic = 'force-dynamic';
import { formatIST } from "../lib/dateUtils";
import { prisma } from "@/lib/prisma";
import { FiUsers, FiActivity, FiCheckCircle } from "react-icons/fi";


export default async function Dashboard() {
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [totalMembers, activePlans, todaysAttendance, expiringMemberships] = await Promise.all([
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
    })
  ]);

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back to the Sportsvilla management portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-xl">
            <FiUsers />
          </div>
          <div>
            <div className="text-3xl font-bold font-['Outfit'] text-white">{totalMembers}</div>
            <div className="text-sm text-gray-500 mt-1">Total Members</div>
          </div>
        </div>
        
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
            <FiActivity />
          </div>
          <div>
            <div className="text-3xl font-bold font-['Outfit'] text-white">{activePlans}</div>
            <div className="text-sm text-gray-500 mt-1">Active Plans</div>
          </div>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
            <FiCheckCircle />
          </div>
          <div>
            <div className="text-3xl font-bold font-['Outfit'] text-white">{todaysAttendance}</div>
            <div className="text-sm text-gray-500 mt-1">Check-ins Today</div>
          </div>
        </div>
      </div>

      <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
        <h3 className="text-lg font-semibold font-['Outfit'] text-white mb-5">Expiring Soon (Next 7 Days)</h3>
        {expiringMemberships.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-[#0f1117] rounded-lg border border-dashed border-[#2a2d3e]">
            No plans expiring in the next 7 days.
          </div>
        ) : (
          <div className="flex flex-col">
            {expiringMemberships.map(m => (
              <div key={m.id} className="flex justify-between items-center p-4 rounded-lg bg-[#1c1f2e] border border-[#2a2d3e] mb-3 last:mb-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-sm font-bold">
                    {m.member?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{m.member?.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.member?.mobile}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-400">{formatIST(new Date(m.endDate), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.membershipPlan?.sport?.name} Plan</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
