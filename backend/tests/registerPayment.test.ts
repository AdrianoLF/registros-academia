import { describe, it, expect } from 'vitest';
import { Payment } from '../src/domain/payment/Payment';
import {
  assertCanRegisterPayment,
  assertCanRegisterOneOffDailyPayment,
  findActivePaymentForPlan,
  hasAccessToday,
} from '../src/domain/payment/registerPayment';

const junePayment = new Payment({
  id: 1,
  personId: 1,
  planId: 3,
  priceCents: 8990,
  periodStart: new Date('2026-06-01T00:00:00.000Z'),
  periodEnd: new Date('2026-07-01T00:00:00.000Z'),
});

describe('assertCanRegisterPayment', () => {
  it('rejects payment for a different plan than the person current plan', () => {
    expect(() =>
      assertCanRegisterPayment(3, 5, 8990, 8990, new Date('2026-07-01T00:00:00.000Z'), [])
    ).toThrow('Payment must be for the person current plan');
  });

  it('rejects price that does not match the plan', () => {
    expect(() =>
      assertCanRegisterPayment(3, 3, 100, 8990, new Date('2026-07-01T00:00:00.000Z'), [])
    ).toThrow('Invalid price');
  });

  it('rejects when the period is already paid', () => {
    expect(() =>
      assertCanRegisterPayment(
        3,
        3,
        8990,
        8990,
        new Date('2026-06-15T00:00:00.000Z'),
        [junePayment]
      )
    ).toThrow('Period already paid');
  });

  it('allows payment for the next period', () => {
    expect(() =>
      assertCanRegisterPayment(
        3,
        3,
        8990,
        8990,
        new Date('2026-07-01T00:00:00.000Z'),
        [junePayment]
      )
    ).not.toThrow();
  });
});

describe('assertCanRegisterOneOffDailyPayment', () => {
  it('rejects when the day is already covered', () => {
    expect(() =>
      assertCanRegisterOneOffDailyPayment(
        new Date('2026-06-15T00:00:00.000Z'),
        [junePayment]
      )
    ).toThrow('Day already paid');
  });

  it('allows when the day is not covered', () => {
    expect(() =>
      assertCanRegisterOneOffDailyPayment(
        new Date('2026-07-15T00:00:00.000Z'),
        [junePayment]
      )
    ).not.toThrow();
  });
});

describe('hasAccessToday', () => {
  it('returns true when any payment covers today', () => {
    expect(hasAccessToday([junePayment], new Date('2026-06-15T12:00:00.000Z'))).toBe(true);
  });

  it('returns false when no payment covers today', () => {
    expect(hasAccessToday([junePayment], new Date('2026-07-15T12:00:00.000Z'))).toBe(false);
  });
});

describe('findActivePaymentForPlan', () => {
  it('returns the payment covering today for the plan', () => {
    const found = findActivePaymentForPlan(
      [junePayment],
      3,
      new Date('2026-06-15T12:00:00.000Z')
    );
    expect(found).toBe(junePayment);
  });

  it('returns undefined when there is no active payment', () => {
    const found = findActivePaymentForPlan(
      [junePayment],
      3,
      new Date('2026-07-02T00:00:00.000Z')
    );
    expect(found).toBeUndefined();
  });
});
