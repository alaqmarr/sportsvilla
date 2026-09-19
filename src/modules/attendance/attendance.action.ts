"use server";

import { revalidatePath } from "next/cache";
import { fetchMembersCore, markAttendanceCore, MarkAttendanceInput } from "./attendance.lib";
import { eventBus } from "@/core/events";
import { bumpSyncTimestamp } from "@/core/database/sync";

export async function fetchMembers(identifier: string) {
  return await fetchMembersCore(identifier);
}

export async function markAttendance(data: MarkAttendanceInput) {
  const attendance = await markAttendanceCore(data);

  eventBus.emit("attendance.marked", {
    attendanceId: attendance.id,
    memberId: attendance.memberId,
    memberName: attendance.member?.name || "",
    sportName: attendance.sport?.name || "Sportsvilla",
    mobile: attendance.member?.mobile || null,
    date: attendance.date,
  });

  await bumpSyncTimestamp("attendance");
  revalidatePath("/", "layout");
  return attendance;
}
