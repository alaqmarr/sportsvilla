export const dynamic = 'force-dynamic';

import { fetchServerStats } from "@/modules/system/system.action";
import ServerUsageClient from "./ServerUsageClient";

export default async function ServerUsagePage() {
  const initialStats = await fetchServerStats();
  
  return <ServerUsageClient initialStats={initialStats} />;
}
