import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireServerMember } from "@/lib/serverAuth";
import { BookingDetailClient } from "./BookingDetailClient";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const member = await requireServerMember();
  const { id } = await params;

  const familyMembers = await prisma.member.findMany({
    where: { mobile: member.mobile },
    select: { id: true }
  });
  const familyIds = familyMembers.map(m => m.id);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      turf: true,
      sport: true,
      tickets: true,
      member: { select: { id: true, name: true } },
      participants: {
        include: {
          member: { select: { id: true, name: true, mobile: true } },
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // Security check: Must be owner or a participant
  const isOwner = familyIds.includes(booking.memberId);
  const isParticipant = booking.participants.some(p => familyIds.includes(p.memberId));

  if (!isOwner && !isParticipant) {
    notFound();
  }

  // Get global settings
  const globalSettings = await prisma.setting.findMany();
  const settingsMap = globalSettings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  const cancellationLimitHours = parseInt(settingsMap.CLIENT_CANCELLATION_LIMIT_HOURS || "3", 10);
  const allowCancellation = settingsMap.ALLOW_CANCELLATION !== "false";

  return <BookingDetailClient
    initialBooking={booking}
    cancellationLimitHours={cancellationLimitHours}
    allowCancellation={allowCancellation}
  />;
}
