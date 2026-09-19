export function calculateMembershipStats(
  startDate: Date,
  endDate: Date,
  attendedCount: number
) {
  const now = new Date();
  const end = new Date(endDate);
  const start = new Date(startDate);

  const msLeft = end.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  const msElapsed = now.getTime() - start.getTime();
  const daysElapsed = Math.max(0, Math.floor(msElapsed / (1000 * 60 * 60 * 24)));
  const missedCount = Math.max(0, daysElapsed - attendedCount);

  return {
    attended: attendedCount,
    missed: missedCount,
    daysLeft: daysLeft,
  };
}

export function validateAllowedDay(allowedDaysStr?: string | null): void {
  if (!allowedDaysStr) return;

  const todayDay = new Date().getDay(); // 0 = Sun, 1 = Mon...
  const allowedDaysArray = allowedDaysStr.split(",").map(Number);
  if (!allowedDaysArray.includes(todayDay)) {
    const daysMap = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    throw new Error(`Membership is not valid on ${daysMap[todayDay]}.`);
  }
}
