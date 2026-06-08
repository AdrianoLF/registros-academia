import { ProviderKind } from '@prisma/client';
import { Person } from '../Person';
import { Plan } from '../plan/Plan';
import { Payment } from '../payment/Payment';
import { startOfUtcDay } from '../shared/dates';

export type EligibilityReason =
  | 'person_disabled'
  | 'no_plan'
  | 'no_valid_payment';

export type EligibilityResult =
  | { allowed: true }
  | { allowed: false; reason: EligibilityReason };

export function checkEligibility(
  person: Person,
  plan: Plan | null,
  payments: Payment[],
  now: Date
): EligibilityResult {
  if (!person.enabled) {
    return { allowed: false, reason: 'person_disabled' };
  }
  if (!plan || person.planId == null) {
    return { allowed: false, reason: 'no_plan' };
  }
  if (plan.providerKind !== ProviderKind.CASH) {
    return { allowed: true };
  }
  const day = startOfUtcDay(now);
  const hasValidPayment = payments.some((payment) => payment.covers(day));
  if (!hasValidPayment) {
    return { allowed: false, reason: 'no_valid_payment' };
  }
  return { allowed: true };
}
