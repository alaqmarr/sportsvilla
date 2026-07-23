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
