export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import AttendanceReportClient from "./AttendanceReportClient";


export default async function AttendanceReportPage() {
  const plans = await prisma.membershipPlan.findMany({
    include: {
      sport: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return <AttendanceReportClient plans={plans} />;
}
