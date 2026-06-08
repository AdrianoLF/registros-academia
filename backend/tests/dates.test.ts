import { describe, it, expect } from 'vitest';
import {
  startOfUtcDay,
  daysBetween,
  daysInMonth,
  daysInYear,
  addUtcMonths,
  eachUtcDay,
} from '../src/domain/shared/dates';

describe('startOfUtcDay', () => {
  it('zeroes the time in UTC', () => {
    expect(startOfUtcDay(new Date('2026-01-15T18:30:00Z')).toISOString()).toBe('2026-01-15T00:00:00.000Z');
  });
});

describe('daysBetween', () => {
  it('counts whole UTC calendar days', () => {
    expect(daysBetween(new Date('2026-01-01T23:00:00Z'), new Date('2026-01-02T01:00:00Z'))).toBe(1);
    expect(daysBetween(new Date('2026-01-01T00:00:00Z'), new Date('2026-01-01T23:59:59Z'))).toBe(0);
  });
});

describe('daysInMonth / daysInYear', () => {
  it('respects the calendar', () => {
    expect(daysInMonth(new Date('2026-01-15T00:00:00Z'))).toBe(31);

    expect(daysInMonth(new Date('2026-02-15T00:00:00Z'))).toBe(28);
    expect(daysInYear(new Date('2026-06-01T00:00:00Z'))).toBe(365);
    // ANO BISSEXTO
    expect(daysInMonth(new Date('2024-02-15T00:00:00Z'))).toBe(29);
    expect(daysInYear(new Date('2024-06-01T00:00:00Z'))).toBe(366);
  });
});

describe('addUtcMonths', () => {
  it('clamps to the end of the target month', () => {
    expect(addUtcMonths(new Date('2026-01-31T00:00:00Z'), 1).toISOString()).toBe('2026-02-28T00:00:00.000Z');
  });

  it('adds whole months keeping the day when it fits', () => {
    expect(addUtcMonths(new Date('2026-01-15T00:00:00Z'), 12).toISOString()).toBe('2027-01-15T00:00:00.000Z');
  });
});

describe('eachUtcDay', () => {
  it('yields start-of-day for each day in [from, to)', () => {
    const days = eachUtcDay(new Date('2026-01-01T12:00:00Z'), new Date('2026-01-04T00:00:00Z'));
    expect(days.map((d) => d.toISOString())).toEqual([
      '2026-01-01T00:00:00.000Z',
      '2026-01-02T00:00:00.000Z',
      '2026-01-03T00:00:00.000Z',
    ]);
  });

  it('is empty when from >= to', () => {
    expect(eachUtcDay(new Date('2026-01-05T00:00:00Z'), new Date('2026-01-05T00:00:00Z'))).toEqual([]);
  });
});
