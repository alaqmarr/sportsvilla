import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { whatsappDb } from "@/lib/whatsappDb";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "WhatsApp Dashboard | SportsVilla Admin",
};

export default async function WhatsAppDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.admin.findUnique({ where: { email: session.user.email } });
  if (!admin || (!hasPermission(admin, "view:whatsapp") && !hasPermission(admin, "manage:whatsapp"))) {
    redirect("/admin");
  }

  // 1. Account Metrics
  const accountMetrics = await whatsappDb.whatsAppAccountMetric.findUnique({
    where: { id: "singleton" }
  }) || { qualityRating: "GREEN", messagingLimit: "UNKNOWN" };

  // 2. Templates
  const templates = await whatsappDb.whatsAppTemplate.findMany();

  // 3. Funnel Metrics
  const totalSent = await whatsappDb.whatsAppMessage.count({
    where: { direction: "OUTGOING" }
  });
  
  const totalDelivered = await whatsappDb.whatsAppMessage.count({
    where: { direction: "OUTGOING", status: { in: ["DELIVERED", "READ"] } }
  });
  
  const totalRead = await whatsappDb.whatsAppMessage.count({
    where: { direction: "OUTGOING", status: "READ" }
  });
  
  const totalReplied = await whatsappDb.whatsAppMessage.count({
    where: { direction: "INCOMING" }
  });

  const totalOptOuts = await whatsappDb.whatsAppMessage.count({
    where: { isOptOut: true }
  });

  // 4. Financial & Billing
  const now = new Date();
  
  const activeWindows = await whatsappDb.whatsAppConversation.count({
    where: { expiresAt: { gt: now } }
  });

  // Aggregate cost by category
  const conversationGroups = await whatsappDb.whatsAppConversation.groupBy({
    by: ["category"],
    _count: { wacId: true },
    _sum: { cost: true }
  });

  let totalCost = 0;
  let totalConversations = 0;
  const categories = conversationGroups.map(g => {
    totalCost += (g._sum.cost || 0);
    totalConversations += g._count.wacId;
    return {
      category: g.category,
      count: g._count.wacId,
      cost: g._sum.cost || 0
    };
  });

  const cpc = totalConversations > 0 ? (totalCost / totalConversations) : 0;

  return (
    <DashboardClient 
      accountMetrics={accountMetrics}
      templates={templates}
      funnel={{
        sent: totalSent,
        delivered: totalDelivered,
        read: totalRead,
        replied: totalReplied,
        optOuts: totalOptOuts
      }}
      financials={{
        activeWindows,
        categories,
        totalCost,
        totalConversations,
        cpc
      }}
    />
  );
}
