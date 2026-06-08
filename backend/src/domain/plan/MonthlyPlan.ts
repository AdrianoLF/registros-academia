import { PlanType } from '@prisma/client';
import { addUtcMonths, daysInMonth } from '../shared/dates';
import { Plan, PlanProps } from './Plan';

export class MonthlyPlan extends Plan {
  constructor(props: PlanProps) {
    super({ ...props, type: PlanType.MONTHLY });
  }

  validUntil(start: Date): Date {
    return addUtcMonths(start, 1);
  }

  dailyAccrualCents(day: Date): number {
    return Math.round(this.priceCents / daysInMonth(day));
  }

  get isRecurring(): boolean {
    return true;
  }
}
