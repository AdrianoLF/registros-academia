import { eachUtcDay, startOfUtcDay } from '../shared/dates';

const DAY_MS = 24 * 60 * 60 * 1000;

export type DailyCheckInPoint = {
  date: string;
  count: number;
};

export function lastWeekRange(now: Date): { from: Date; to: Date } {
  const today = startOfUtcDay(now);
  const from = new Date(today.getTime() - 6 * DAY_MS);
  const to = new Date(today.getTime() + DAY_MS);
  return { from, to };
}

export function buildDailyCheckInCounts(
  timestamps: Date[],
  from: Date,
  to: Date
): DailyCheckInPoint[] {
  const days = eachUtcDay(from, to);
  const counts = new Map(days.map((day) => [day.getTime(), 0]));
  for (const at of timestamps) {
    const key = startOfUtcDay(at).getTime();
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return days.map((day) => ({
    date: day.toISOString().slice(0, 10),
    count: counts.get(day.getTime()) ?? 0,
  }));
}
