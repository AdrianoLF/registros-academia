import { PlanType } from '@prisma/client';
import { startOfUtcDay } from '../shared/dates';
import { Plan, PlanProps } from './Plan';

const DAY_MS = 24 * 60 * 60 * 1000;

export class DailyPlan extends Plan {
  constructor(props: PlanProps) {
    super({ ...props, type: PlanType.DAILY });
  }

  validUntil(start: Date): Date {
    return new Date(startOfUtcDay(start).getTime() + DAY_MS);
  }

  dailyAccrualCents(_day: Date): number {
    return this.priceCents;
  }

  get isRecurring(): boolean {
    return false;
  }
}
