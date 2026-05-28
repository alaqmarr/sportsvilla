import { prisma } from "@/lib/prisma";
import AttendanceReportClient from "./AttendanceReportClient";

export const dynamic = "force-dynamic";

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
