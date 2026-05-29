import { prisma } from "@/lib/prisma";
import AttendanceClient from "./AttendanceClient";

export default async function AttendancePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recentAttendance = await prisma.attendance.findMany({
    where: {
      date: { gte: today }
    },
    include: { member: true, sport: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return <AttendanceClient initialRecords={recentAttendance} />;
}
