import { bumpSyncTimestamp } from "@/core/database/sync";

export async function bumpAttendanceSync() {
  await bumpSyncTimestamp("attendance");
}
