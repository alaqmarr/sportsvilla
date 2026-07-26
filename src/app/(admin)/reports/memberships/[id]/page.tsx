export const dynamic = 'force-dynamic';
import MembershipDetailClient from "./MembershipDetailClient";


export default async function MembershipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MembershipDetailClient id={id} />;
}
