export const dynamic = "force-dynamic";

import BookingsClient from "./BookingsClient";
import { fetchBookableTurfs } from "./actions";
import { getSettings } from "../settings/actions";

export default async function BookingsPage() {
  const turfs = await fetchBookableTurfs();
  const settings = await getSettings();
  
  const facilityHours = {
    openTime: settings.openTime || "06:00",
    closeTime: settings.closeTime || "23:00"
  };

  const pointsPerRupee = Number(settings.pointsPerRupee || 100);

  return <BookingsClient turfs={turfs} facilityHours={facilityHours} pointsPerRupee={pointsPerRupee} />;
}
