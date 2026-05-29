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
