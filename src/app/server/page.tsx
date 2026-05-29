
import { fetchServerStats } from "./actions";
import ServerUsageClient from "./ServerUsageClient";

export default async function ServerUsagePage() {
  const initialStats = await fetchServerStats();
  
  return <ServerUsageClient initialStats={initialStats} />;
}
