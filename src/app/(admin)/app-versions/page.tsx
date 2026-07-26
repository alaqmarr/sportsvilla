export const dynamic = "force-dynamic";

import AppVersionsClient from "./AppVersionsClient";
import { getAppVersions } from "./actions";

export default async function AppVersionsPage() {
  const versions = await getAppVersions();

  return <AppVersionsClient initialVersions={versions} />;
}
