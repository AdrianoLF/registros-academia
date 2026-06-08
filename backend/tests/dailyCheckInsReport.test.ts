import { describe, it, expect } from 'vitest';
import { buildDailyCheckInCounts, lastWeekRange } from '../src/domain/services/DailyCheckInsReport';

describe('lastWeekRange', () => {
  it('covers seven calendar days ending today', () => {
    const now = new Date('2026-06-08T15:00:00.000Z');
    const { from, to } = lastWeekRange(now);
    expect(from.toISOString()).toBe('2026-06-02T00:00:00.000Z');
    expect(to.toISOString()).toBe('2026-06-09T00:00:00.000Z');
  });
});

describe('buildDailyCheckInCounts', () => {
  it('groups check-ins by utc day inside the range', () => {
    const from = new Date('2026-06-01T00:00:00.000Z');
    const to = new Date('2026-06-04T00:00:00.000Z');
    const points = buildDailyCheckInCounts(
      [
        new Date('2026-06-01T10:00:00.000Z'),
        new Date('2026-06-01T18:00:00.000Z'),
        new Date('2026-06-03T08:00:00.000Z'),
        new Date('2026-06-10T08:00:00.000Z'),
      ],
      from,
      to
    );
    expect(points).toEqual([
      { date: '2026-06-01', count: 2 },
      { date: '2026-06-02', count: 0 },
      { date: '2026-06-03', count: 1 },
    ]);
  });
});
