import { Router } from 'express';
import { ProviderKind } from '@prisma/client';
import { PaymentRepository } from '../infra/PaymentRepository';
import { PersonRepository } from '../infra/PersonRepository';
import { PlanRepository } from '../infra/PlanRepository';
import {
  assertCanRegisterPayment,
  assertCanRegisterOneOffDailyPayment,
  findActivePaymentForPlan,
  hasAccessToday,
} from '../domain/payment/registerPayment';
import { startOfUtcDay } from '../domain/shared/dates';
import { parsePageQuery } from '../domain/shared/pagination';

const router = Router();
const payments = new PaymentRepository();
const persons = new PersonRepository();
const plans = new PlanRepository();

function parsePersonId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('Invalid person');
  }
  return id;
}

function parsePlanId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('Invalid plan');
  }
  return id;
}

function parsePriceCents(value: unknown): number {
  const cents = Number(value);
  if (!Number.isInteger(cents) || cents < 0) {
    throw new Error('Invalid price');
  }
  return cents;
}

function parsePeriodStart(value: unknown): Date {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid period start');
  }
  return startOfUtcDay(date);
}

function parseOneOffDaily(value: unknown): boolean {
  return value === true;
}

router.get('/', async (req, res) => {
  try {
    const personId = parsePersonId(req.query.personId);
    const page = parsePageQuery(req.query);
    const now = new Date();
    const [result, allPayments, person] = await Promise.all([
      payments.findPageByPerson(personId, page),
      payments.listByPerson(personId),
      persons.findById(personId),
    ]);
    const activeSubscriptionPayment =
      person?.planId != null
        ? findActivePaymentForPlan(allPayments, person.planId, now)
        : undefined;
    res.json({
      ...result,
      items: result.items.map((payment) => payment.toJSON()),
      accessToday: hasAccessToday(allPayments, now),
      activeSubscriptionPayment: activeSubscriptionPayment?.toJSON() ?? null,
    });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const personId = parsePersonId(req.body.personId);
    const oneOffDaily = parseOneOffDaily(req.body.oneOffDaily);

    const person = await persons.findById(personId);
    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    const existing = await payments.listByPerson(personId);

    if (oneOffDaily) {
      const personPlan = person.planId != null ? await plans.findById(person.planId) : null;
      if (!personPlan?.isRecurring || personPlan.providerKind !== ProviderKind.CASH) {
        res.status(400).json({ error: 'One-off entry is only for overdue recurring cash plans' });
        return;
      }
      const dailyPlan = await plans.findActiveDailyCash();
      if (!dailyPlan) {
        res.status(400).json({ error: 'No daily cash rate configured' });
        return;
      }
      const periodStart = startOfUtcDay(new Date());
      try {
        assertCanRegisterOneOffDailyPayment(periodStart, existing);
      } catch (e) {
        res.status(409).json({ error: (e as Error).message });
        return;
      }
      const payment = await payments.create({
        personId,
        planId: dailyPlan.id,
        priceCents: dailyPlan.priceCents,
        periodStart,
        periodEnd: dailyPlan.validUntil(periodStart),
      });
      res.status(201).json(payment);
      return;
    }

    const planId = parsePlanId(req.body.planId);
    const priceCents = parsePriceCents(req.body.priceCents);
    const periodStart = parsePeriodStart(req.body.periodStart);

    const plan = await plans.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    if (!plan.isRecurring) {
      res.status(400).json({ error: 'Daily rate is registered as one-off entry' });
      return;
    }

    try {
      assertCanRegisterPayment(person.planId, planId, priceCents, plan.priceCents, periodStart, existing);
    } catch (e) {
      res.status(409).json({ error: (e as Error).message });
      return;
    }

    const periodEnd = plan.validUntil(periodStart);
    const payment = await payments.create({
      personId,
      planId,
      priceCents,
      periodStart,
      periodEnd,
    });
    res.status(201).json(payment);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
