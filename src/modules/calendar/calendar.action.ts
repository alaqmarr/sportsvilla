"use server";

import { fetchCalendarDataCore } from "./calendar.lib";

export async function fetchCalendarData(dateStr: string) {
  return await fetchCalendarDataCore(dateStr);
}
