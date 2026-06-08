import { PlanType } from '@prisma/client';
import { addUtcMonths, daysInYear } from '../shared/dates';
import { Plan, PlanProps } from './Plan';

export class AnnualPlan extends Plan {
  constructor(props: PlanProps) {
    super({ ...props, type: PlanType.ANNUAL });
  }

  validUntil(start: Date): Date {
    return addUtcMonths(start, 12);
  }

  dailyAccrualCents(day: Date): number {
    return Math.round(this.priceCents / daysInYear(day));
  }

  get isRecurring(): boolean {
    return true;
  }
}
