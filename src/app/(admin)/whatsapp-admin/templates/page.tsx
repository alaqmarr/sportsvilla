import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { whatsappDb } from "@/lib/whatsappDb";
import { hasPermission } from "@/lib/rbac";
import TemplatesClient from "./TemplatesClient";

export const metadata = {
  title: "WhatsApp Templates | SportsVilla Admin",
};

export default async function WhatsAppTemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
  if (!admin || (!hasPermission(admin, "view:whatsapp") && !hasPermission(admin, "manage:whatsapp"))) {
    redirect("/admin");
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "4575637675998391";
  
  let initialTemplates: any[] = [];
  
  if (accessToken) {
    try {
      const url = `https://graph.facebook.com/v21.0/${wabaId}/message_templates?limit=100`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      });

      const data = await res.json();
      if (res.ok && data.data) {
        // Fetch local configs to merge headerImageUrl
        const localConfigs = await whatsappDb.whatsAppTemplate.findMany();
        const configMap = new Map(localConfigs.map((c: any) => [c.name, c]));

        initialTemplates = data.data.map((t: any) => ({
          ...t,
          headerImageUrl: configMap.get(t.name)?.headerImageUrl || null
        }));
      } else {
        console.error("[META TEMPLATES PAGE ERROR]", data.error);
      }
    } catch (err) {
      console.error("[META TEMPLATES FETCH ERROR]", err);
    }
  }

  return <TemplatesClient initialTemplates={initialTemplates} />;
}
