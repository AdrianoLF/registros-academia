const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function daysBetween(from: Date, to: Date): number {
  return Math.floor((startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime()) / DAY_MS);
}

export function daysInMonth(date: Date): number {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
}

export function daysInYear(date: Date): number {
  const year = date.getUTCFullYear();
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return leap ? 366 : 365;
}

export function addUtcMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetLength = new Date(Date.UTC(year, month + months + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, targetLength);
  return new Date(
    Date.UTC(year, month + months, clampedDay, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
  );
}

export function eachUtcDay(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  let current = startOfUtcDay(from);
  const end = startOfUtcDay(to);
  while (current < end) {
    days.push(current);
    current = new Date(current.getTime() + DAY_MS);
  }
  return days;
}
