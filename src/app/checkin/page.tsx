import { prisma } from "@/lib/prisma";
import CheckinScanner from "@/components/CheckinScanner";

export const metadata = {
  title: "Fast Check-in | SportsVilla",
};

export default async function CheckinPage() {
  const sports = await prisma.sport.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white">Entry & Check-in</h1>
        <p className="text-gray-400 mt-2">Scan QR codes or enter mobile numbers to verify entry.</p>
      </div>

      <CheckinScanner sports={sports} />
    </div>
  );
}
