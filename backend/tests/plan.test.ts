import { describe, it, expect } from 'vitest';
import { PlanType, QualityLevel, ProviderKind } from '@prisma/client';
import {
  assertProviderAcceptsPlanType,
  assertNoActiveSlotConflict,
  PlanSlot,
} from '../src/domain/plan/Plan';
import { DailyPlan } from '../src/domain/plan/DailyPlan';
import { MonthlyPlan } from '../src/domain/plan/MonthlyPlan';
import { AnnualPlan } from '../src/domain/plan/AnnualPlan';
import { toDomain } from '../src/infra/PlanRepository';
import { addUtcMonths, daysInMonth, daysInYear, startOfUtcDay } from '../src/domain/shared/dates';

const base = {
  id: 1,
  name: 'Basic Monthly',
  qualityLevel: QualityLevel.BASIC,
  priceCents: 30000,
  providerKind: ProviderKind.CASH,
  enabled: true,
};

describe('assertProviderAcceptsPlanType', () => {
  it('rejects recurring plans for totalpass and wellhub', () => {
    expect(() => assertProviderAcceptsPlanType(ProviderKind.TOTALPASS, PlanType.MONTHLY)).toThrow(
      'Provider does not accept this plan type'
    );
    expect(() => assertProviderAcceptsPlanType(ProviderKind.WELLHUB, PlanType.ANNUAL)).toThrow(
      'Provider does not accept this plan type'
    );
  });

  it('accepts daily for all providers', () => {
    for (const kind of [ProviderKind.CASH, ProviderKind.TOTALPASS, ProviderKind.WELLHUB] as const) {
      expect(() => assertProviderAcceptsPlanType(kind, PlanType.DAILY)).not.toThrow();
    }
  });
});

describe('assertNoActiveSlotConflict', () => {
  const slot: PlanSlot = {
    qualityLevel: QualityLevel.BASIC,
    providerKind: ProviderKind.CASH,
    type: PlanType.DAILY,
    enabled: true,
  };

  it('rejects a second active plan in the same slot', () => {
    expect(() => assertNoActiveSlotConflict([slot], slot)).toThrow('An active plan already exists for this slot');
  });

  it('allows active and inactive plans in the same slot', () => {
    const inactive: PlanSlot = { ...slot, enabled: false };
    expect(() => assertNoActiveSlotConflict([inactive], slot)).not.toThrow();
  });

  it('allows multiple inactive plans in the same slot', () => {
    const inactive: PlanSlot = { ...slot, enabled: false };
    expect(() => assertNoActiveSlotConflict([inactive], inactive)).not.toThrow();
  });

  it('allows creating a disabled plan when an active one exists', () => {
    expect(() => assertNoActiveSlotConflict([slot], { ...slot, enabled: false })).not.toThrow();
  });
});

describe('DailyPlan', () => {
  const plan = new DailyPlan({ ...base, type: PlanType.DAILY, priceCents: 1500 });

  it('is not recurring', () => {
    expect(plan.isRecurring).toBe(false);
  });

  it('valid until end of day', () => {
    const start = new Date('2025-01-15T12:00:00Z');
    expect(plan.validUntil(start)).toEqual(new Date(startOfUtcDay(start).getTime() + 24 * 60 * 60 * 1000));
  });

  it('accrues the full check-in price', () => {
    const day = new Date('2025-02-10T00:00:00Z');
    expect(plan.dailyAccrualCents(day)).toBe(1500);
  });
});

describe('MonthlyPlan', () => {
  const plan = new MonthlyPlan({ ...base, type: PlanType.MONTHLY });

  it('is recurring', () => {
    expect(plan.isRecurring).toBe(true);
  });

  it('valid until one month after start', () => {
    const start = new Date('2025-01-15T12:00:00Z');
    expect(plan.validUntil(start)).toEqual(addUtcMonths(start, 1));
  });

  it('accrues daily by days in month', () => {
    const day = new Date('2025-02-10T00:00:00Z');
    expect(plan.dailyAccrualCents(day)).toBe(Math.round(30000 / daysInMonth(day)));
  });
});

describe('AnnualPlan', () => {
  const plan = new AnnualPlan({ ...base, id: 2, name: 'Pro Annual', type: PlanType.ANNUAL, priceCents: 120000 });

  it('valid until twelve months after start', () => {
    const start = new Date('2025-03-01T00:00:00Z');
    expect(plan.validUntil(start)).toEqual(addUtcMonths(start, 12));
  });

  it('accrues daily by days in year', () => {
    const day = new Date('2025-06-01T00:00:00Z');
    expect(plan.dailyAccrualCents(day)).toBe(Math.round(120000 / daysInYear(day)));
  });
});

describe('toDomain mapping for Plan', () => {
  it('maps DAILY row to DailyPlan', () => {
    const domain = toDomain({ ...base, type: PlanType.DAILY });
    expect(domain).toBeInstanceOf(DailyPlan);
    expect(domain.type).toBe(PlanType.DAILY);
  });

  it('maps MONTHLY row to MonthlyPlan', () => {
    const domain = toDomain({ ...base, type: PlanType.MONTHLY });
    expect(domain).toBeInstanceOf(MonthlyPlan);
    expect(domain.type).toBe(PlanType.MONTHLY);
  });

  it('maps ANNUAL row to AnnualPlan', () => {
    const domain = toDomain({ ...base, type: PlanType.ANNUAL });
    expect(domain).toBeInstanceOf(AnnualPlan);
  });
});
