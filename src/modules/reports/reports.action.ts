"use server";

import {
  fetchAdvancedAttendanceCore,
  fetchAttendanceReportCore,
  fetchMembershipDetailCore,
  fetchMembershipReportsCore,
  fetchRevenueDataCore,
} from "./reports.lib";

export async function fetchAdvancedAttendance(
  startDateStr: string,
  endDateStr: string,
  startTimeStr: string = "00:00",
  endTimeStr: string = "23:59",
  planId?: string
) {
  return await fetchAdvancedAttendanceCore(
    startDateStr,
    endDateStr,
    startTimeStr,
    endTimeStr,
    planId
  );
}

export async function fetchAttendanceReport(mobile: string) {
  return await fetchAttendanceReportCore(mobile);
}

export async function fetchMembershipDetail(id: string) {
  return await fetchMembershipDetailCore(id);
}

export async function fetchMembershipReports(
  startDateStr: string,
  endDateStr: string
) {
  return await fetchMembershipReportsCore(startDateStr, endDateStr);
}

export async function fetchRevenueData() {
  return await fetchRevenueDataCore();
}
