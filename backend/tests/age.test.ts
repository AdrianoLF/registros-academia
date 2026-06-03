import { describe, it, expect } from 'vitest';
import { assertMinAge } from '../src/domain/age';

function yearsAgo(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

describe('assertMinAge', () => {
  it('accepts someone exactly at the minimum age', () => {
    expect(() => assertMinAge(yearsAgo(18), 18)).not.toThrow();
  });

  it('rejects someone below the minimum age', () => {
    expect(() => assertMinAge(yearsAgo(17), 18)).toThrow('Minimum age is 18');
  });
});
