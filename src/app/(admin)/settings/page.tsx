export const dynamic = "force-dynamic";

import SettingsClient from "./SettingsClient";
import { getSettings } from "@/modules/settings/settings.action";

export default async function SettingsPage() {
  const initialSettings = await getSettings();

  return <SettingsClient initialSettings={initialSettings} />;
}
