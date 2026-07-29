import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import EventsClient from "../EventsClient";
import { whatsappDb } from "@/lib/whatsappDb";
import Link from "next/link";
import { FiCornerUpLeft } from "react-icons/fi";

export const metadata = {
  title: "WhatsApp Event Triggers | SportsVilla Admin",
};

export default async function WhatsAppEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
  if (!admin || (!hasPermission(admin, "view:whatsapp") && !hasPermission(admin, "manage:whatsapp"))) {
    redirect("/admin");
  }

  // 1. Fetch DB Events
  let initialEvents: any[] = [];
  try {
    initialEvents = await whatsappDb.whatsAppEventTrigger.findMany({
      orderBy: { eventName: "asc" }
    });
  } catch (error) {
    console.error("Error fetching initial WhatsApp events", error);
  }

  // 2. Fetch Templates
  let initialTemplates: any[] = [];
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "4575637675998391";
  
  if (accessToken) {
    try {
      const url = `https://graph.facebook.com/v21.0/${wabaId}/message_templates?limit=100`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        initialTemplates = data.data;
      }
    } catch (error) {
      console.error("Error fetching initial WhatsApp templates", error);
    }
  }

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#0b141a] overflow-hidden text-gray-200">
      {/* Header */}
      <div className="h-16 shrink-0 bg-[#202c33] border-b border-[#2a3942] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/whatsapp-admin" className="p-2 hover:bg-[#2a3942] rounded-full transition-colors text-gray-300">
            <FiCornerUpLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">WhatsApp Event Triggers</h1>
            <p className="text-xs text-gray-400">Manage Meta API templates linked to internal events</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto space-y-6 w-full">
        <EventsClient initialEvents={initialEvents} initialTemplates={initialTemplates} />
      </div>
    </div>
  );
}
