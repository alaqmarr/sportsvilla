import LoyaltyClient from "./LoyaltyClient";
import { fetchLeaderboard } from "./actions";

export default async function LoyaltyPage() {
  const members = await fetchLeaderboard();
  return <LoyaltyClient initialMembers={members} />;
}
