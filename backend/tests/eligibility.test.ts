import { describe, it, expect } from 'vitest';
import { PlanType, QualityLevel, ProviderKind, Gender, Role } from '@prisma/client';
import { checkEligibility } from '../src/domain/services/EligibilityService';
import { Student } from '../src/domain/Student';
import { Gender as GenderVo } from '../src/domain/Gender';
import { DailyPlan } from '../src/domain/plan/DailyPlan';
import { MonthlyPlan } from '../src/domain/plan/MonthlyPlan';
import { Payment } from '../src/domain/payment/Payment';
import { startOfUtcDay } from '../src/domain/shared/dates';

const basePlan = {
  id: 1,
  name: 'Basic Monthly',
  qualityLevel: QualityLevel.BASIC,
  priceCents: 30000,
  enabled: true,
};

function student(overrides: { planId?: number | null; enabled?: boolean } = {}) {
  return new Student({
    id: 1,
    name: 'João',
    email: 'joao@test.com',
    birthDate: new Date('2000-01-01'),
    gender: new GenderVo(Gender.MALE),
    cpf: '52998224725',
    planId: overrides.planId ?? 1,
    enabled: overrides.enabled ?? true,
  });
}

const now = new Date('2025-06-15T14:00:00Z');

describe('checkEligibility', () => {
  it('rejects disabled person', () => {
    const plan = new MonthlyPlan({ ...basePlan, type: PlanType.MONTHLY, providerKind: ProviderKind.CASH });
    const result = checkEligibility(student({ enabled: false }), plan, [], now);
    expect(result).toEqual({ allowed: false, reason: 'person_disabled' });
  });

  it('rejects person without plan', () => {
    const result = checkEligibility(student({ planId: null }), null, [], now);
    expect(result).toEqual({ allowed: false, reason: 'no_plan' });
  });

  it('allows wellhub without payment', () => {
    const plan = new DailyPlan({ ...basePlan, type: PlanType.DAILY, providerKind: ProviderKind.WELLHUB });
    const result = checkEligibility(student(), plan, [], now);
    expect(result).toEqual({ allowed: true });
  });

  it('allows totalpass without payment', () => {
    const plan = new DailyPlan({ ...basePlan, type: PlanType.DAILY, providerKind: ProviderKind.TOTALPASS });
    const result = checkEligibility(student(), plan, [], now);
    expect(result).toEqual({ allowed: true });
  });

  it('rejects cash without any payment covering today', () => {
    const plan = new MonthlyPlan({ ...basePlan, type: PlanType.MONTHLY, providerKind: ProviderKind.CASH });
    const result = checkEligibility(student(), plan, [], now);
    expect(result).toEqual({ allowed: false, reason: 'no_valid_payment' });
  });

  it('allows cash monthly with subscription payment covering today', () => {
    const plan = new MonthlyPlan({ ...basePlan, type: PlanType.MONTHLY, providerKind: ProviderKind.CASH });
    const day = startOfUtcDay(now);
    const payment = new Payment({
      id: 1,
      personId: 1,
      planId: 1,
      priceCents: 30000,
      periodStart: new Date('2025-06-01T00:00:00Z'),
      periodEnd: new Date('2025-07-01T00:00:00Z'),
      createdAt: day,
    });
    const result = checkEligibility(student(), plan, [payment], now);
    expect(result).toEqual({ allowed: true });
  });

  it('allows cash monthly with one-off daily payment covering today', () => {
    const plan = new MonthlyPlan({ ...basePlan, type: PlanType.MONTHLY, providerKind: ProviderKind.CASH });
    const day = startOfUtcDay(now);
    const oneOff = new Payment({
      id: 2,
      personId: 1,
      planId: 99,
      priceCents: 2500,
      periodStart: day,
      periodEnd: new Date(day.getTime() + 24 * 60 * 60 * 1000),
      createdAt: day,
    });
    const result = checkEligibility(student(), plan, [oneOff], now);
    expect(result).toEqual({ allowed: true });
  });
});

describe('Payment.covers', () => {
  it('covers days inside the period', () => {
    const payment = new Payment({
      id: 1,
      personId: 1,
      planId: 1,
      priceCents: 30000,
      periodStart: new Date('2025-06-01T00:00:00Z'),
      periodEnd: new Date('2025-07-01T00:00:00Z'),
    });
    expect(payment.covers(new Date('2025-06-15T12:00:00Z'))).toBe(true);
    expect(payment.covers(new Date('2025-07-01T00:00:00Z'))).toBe(false);
    expect(payment.covers(new Date('2025-05-31T23:59:59Z'))).toBe(false);
  });
});
