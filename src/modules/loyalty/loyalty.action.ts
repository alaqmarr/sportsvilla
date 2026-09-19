"use server";

import { fetchLeaderboardCore } from "./loyalty.lib";

export async function fetchLeaderboard() {
  return await fetchLeaderboardCore();
}
