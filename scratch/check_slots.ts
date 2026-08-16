import { formatInTimeZone } from 'date-fns-tz';

const dateStr = '2026-08-20';
const OPEN_HOUR = 6;
const CLOSE_HOUR = 23;
let currentHour = OPEN_HOUR;
let currentMin = 0;
const duration = 60;
const slots = [];

const formatIST = (date: Date | string | number, formatStr: string): string => {
  if (!date) return '';
  return formatInTimeZone(new Date(date), 'Asia/Kolkata', formatStr);
};

while (currentHour < CLOSE_HOUR) {
  const slotStart = new Date(
    `${dateStr}T${currentHour.toString().padStart(2, '0')}:${currentMin
      .toString()
      .padStart(2, '0')}:00+05:30`
  );
  
  if (slotStart.getTime() > Date.now()) {
    slots.push(formatIST(slotStart, 'hh:mm a'));
  }
  
  currentMin += duration;
  if (currentMin >= 60) {
    currentHour += Math.floor(currentMin / 60);
    currentMin = currentMin % 60;
  }
}

console.log("Date.now()", new Date(Date.now()).toISOString());
console.log(slots);
