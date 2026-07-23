import { formatInTimeZone } from 'date-fns-tz';

/**
 * Formats a date strictly in Indian Standard Time (IST - Asia/Kolkata).
 * Works correctly for both Date objects and string timestamps.
 */
export function formatIST(date: Date | string | number, formatStr: string): string {
  if (!date) return '';
  try {
    return formatInTimeZone(new Date(date), 'Asia/Kolkata', formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Returns today's date in IST as a YYYY-MM-DD string.
 * Use this instead of `new Date().toISOString().split('T')[0]` which uses UTC
 * and can return yesterday's date when it's early morning in IST.
 */
export function todayIST(): string {
  return formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
}

/**
 * Returns the start and end of a given IST date string (YYYY-MM-DD) as UTC Date objects.
 */
export function getISTDateBounds(dateStr: string = todayIST()): { start: Date, end: Date } {
  const start = new Date(`${dateStr}T00:00:00+05:30`);
  const end = new Date(`${dateStr}T23:59:59.999+05:30`);
  return { start, end };
}

/**
 * Returns the start of the current month in IST as a UTC Date object.
 */
export function getISTStartOfMonth(): Date {
  const today = todayIST();
  const yearMonth = today.substring(0, 8); // 'YYYY-MM-'
  return new Date(`${yearMonth}01T00:00:00+05:30`);
}

/**
 * Returns the start of N days ago and the end of today in IST.
 */
export function getISTDateRange(daysAgo: number): { start: Date, end: Date } {
  const { start: todayStart, end: todayEnd } = getISTDateBounds();
  const start = new Date(todayStart.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return { start, end: todayEnd };
}
