import LoyaltyClient from "./LoyaltyClient";
import { fetchLeaderboard } from "@/modules/loyalty/loyalty.action";

export default async function LoyaltyPage() {
  const members = await fetchLeaderboard();
  return <LoyaltyClient initialMembers={members} />;
}
