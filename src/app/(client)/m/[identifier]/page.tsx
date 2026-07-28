export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PortalClient from "./PortalClient";

export default async function MemberPortal({ params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;
  const isMobile = /^\d{10}$/.test(identifier);

  const members = await prisma.member.findMany({
    where: isMobile ? { mobile: identifier } : { id: identifier },
    include: {
      memberships: {
        include: {
          membershipPlan: {
            include: { sport: true }
          }
        }
      },
      attendances: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { sport: true, membershipPlan: true }
      },
      bookings: {
        where: { 
          startTime: { gt: new Date() },
          status: { not: "CANCELLED" }
        },
        orderBy: { startTime: "asc" },
        take: 5,
        include: { turf: true, sport: true }
      },
      tournamentRegistrations: {
        include: { tournament: true }
      },
      couponAssignments: {
        where: {
          coupon: {
            isActive: true,
            OR: [
              { expiryDate: null },
              { expiryDate: { gt: new Date() } }
            ]
          }
        },
        include: { coupon: true }
      }
    }
  });

  if (members.length === 0) {
    redirect("/m?error=notfound");
  }

  // If mobile number maps to multiple members, show Netflix-style Profile Selector!
  if (isMobile && members.length > 1) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6 selection:bg-orange-500/30">
        <h1 className="text-3xl md:text-5xl font-['Outfit'] font-medium text-white mb-10 md:mb-16 tracking-wide text-center">
          Who's playing?
        </h1>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 max-w-4xl">
          {members.map(m => (
            <a 
              key={m.id} 
              href={`/m/${m.id}`}
              className="group flex flex-col items-center gap-4 transition-transform hover:scale-105"
            >
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl bg-[#222] border-2 border-transparent group-hover:border-white transition-all overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="text-4xl md:text-6xl font-['Outfit'] font-bold text-gray-400 group-hover:text-white transition-colors">
                  {m.name.charAt(0)}
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium text-lg md:text-xl transition-colors tracking-wide">
                {m.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, it's either an ID or a mobile with only 1 member. Render the dashboard for that member.
  const member = members[0];

  // Filter active and expired plans
  const now = new Date();
  const activePlans = member.memberships.filter(m => new Date(m.endDate) >= now && m.status === "ACTIVE");
  const expiredPlans = member.memberships.filter(m => new Date(m.endDate) < now || m.status !== "ACTIVE");
  return (
    <PortalClient 
      member={member} 
      activePlans={activePlans} 
      expiredPlans={expiredPlans} 
      attendances={member.attendances}
      upcomingBookings={member.bookings}
      tournaments={member.tournamentRegistrations}
      coupons={member.couponAssignments}
    />
  );
}
