import { prisma } from "@/lib/prisma";
import CheckinScanner from "@/components/CheckinScanner";
import { PageHeader, Card, CardContent, Badge } from "@/components/admin/ui";

export const metadata = {
  title: "Fast Check-in | SportsVilla",
};

export default async function CheckinPage() {
  const sports = await prisma.sport.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 pb-12 font-sans text-sv-text max-w-5xl mx-auto">
      <PageHeader
        title="Entry & Fast Check-in"
        subtitle="Dedicated kiosk terminal for gate and turnstile entry verification via QR ticket or NFC card"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Check-in" },
        ]}
        statusBadge={
          <Badge variant="success" size="md" dot pulseDot>
            Terminal Ready
          </Badge>
        }
      />

      <Card variant="default">
        <CardContent className="p-6">
          <CheckinScanner sports={sports} />
        </CardContent>
      </Card>
    </div>
  );
}
