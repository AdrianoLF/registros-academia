import { Payment } from './Payment';
import { startOfUtcDay } from '../shared/dates';

export function hasAccessToday(payments: Payment[], now: Date): boolean {
  const day = startOfUtcDay(now);
  return payments.some((payment) => payment.covers(day));
}

export function assertCanRegisterOneOffDailyPayment(
  periodStart: Date,
  existingPayments: Payment[]
): void {
  const alreadyCovered = existingPayments.some((payment) => payment.covers(periodStart));
  if (alreadyCovered) {
    throw new Error('Day already paid');
  }
}

export function assertCanRegisterPayment(
  personPlanId: number | null,
  planId: number,
  priceCents: number,
  planPriceCents: number,
  periodStart: Date,
  existingPayments: Payment[]
): void {
  if (personPlanId !== planId) {
    throw new Error('Payment must be for the person current plan');
  }
  if (priceCents !== planPriceCents) {
    throw new Error('Invalid price');
  }
  const alreadyPaid = existingPayments.some(
    (payment) => payment.planId === planId && payment.covers(periodStart)
  );
  if (alreadyPaid) {
    throw new Error('Period already paid');
  }
}

export function findActivePaymentForPlan(
  payments: Payment[],
  planId: number,
  now: Date
): Payment | undefined {
  return payments.find((payment) => payment.planId === planId && payment.covers(now));
}
