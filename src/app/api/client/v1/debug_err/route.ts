import { whatsappDb } from '@/lib/whatsappDb';
export const dynamic = 'force-dynamic';
export async function GET() {
  const msgs = await whatsappDb.whatsAppMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  return Response.json(msgs);
}
