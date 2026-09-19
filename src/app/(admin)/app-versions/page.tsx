export const dynamic = "force-dynamic";

import AppVersionsClient from "./AppVersionsClient";
import { getAppVersions } from "@/modules/system/system.action";

export default async function AppVersionsPage() {
  const versions = await getAppVersions();

  return <AppVersionsClient initialVersions={versions} />;
}
