import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import WhatsAppClient from "./WhatsAppClient";
import { whatsappDb } from "@/lib/whatsappDb";

export const metadata = {
  title: "WhatsApp CRM | SportsVilla Admin",
};

export default async function WhatsAppAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.admin.findUnique({ where: { email: session.user.email } });
  if (!admin || (!hasPermission(admin, "view:whatsapp") && !hasPermission(admin, "manage:whatsapp"))) {
    redirect("/admin");
  }

  // Fetch initial conversations on the server
  let initialConversations: any[] = [];
  try {
    const rawConvs = await whatsappDb.whatsAppMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    const convMap = new Map();
    rawConvs.forEach((msg) => {
      if (!convMap.has(msg.phoneNumber)) {
        convMap.set(msg.phoneNumber, {
          phoneNumber: msg.phoneNumber,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
      if (msg.direction === "INCOMING" && msg.status !== "READ") {
        convMap.get(msg.phoneNumber).unreadCount += 1;
      }
    });

    initialConversations = Array.from(convMap.values()).sort(
      (a: any, b: any) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    // Also fetch member data for names
    const phoneNumbers = initialConversations.map((c) => c.phoneNumber);
    const members = await prisma.member.findMany({
      where: { mobile: { in: phoneNumbers } },
      select: { mobile: true, name: true },
    });
    const memberMap = new Map(members.map((m) => [m.mobile, m.name]));

    initialConversations = initialConversations.map((c) => ({
      ...c,
      memberName: memberMap.get(c.phoneNumber) || c.name || null,
    }));
  } catch (err) {
    console.error("Error fetching initial conversations:", err);
  }

  // Pre-fetch messages for the first conversation so the chat pane loads instantly
  let initialMessages: any[] = [];
  try {
    if (initialConversations.length > 0) {
      initialMessages = await whatsappDb.whatsAppMessage.findMany({
        where: { phoneNumber: initialConversations[0].phoneNumber },
        orderBy: { createdAt: "asc" },
      });
    }
  } catch (err) {
    console.error("Error fetching initial messages:", err);
  }

  return <WhatsAppClient initialConversations={initialConversations} initialMessages={initialMessages} />;
}
