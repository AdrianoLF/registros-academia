import { Router } from 'express';
import { Role } from '@prisma/client';
import { CheckInRepository } from '../infra/CheckInRepository';
import { PaymentRepository } from '../infra/PaymentRepository';
import { PersonRepository } from '../infra/PersonRepository';
import { PlanRepository } from '../infra/PlanRepository';
import { checkEligibility } from '../domain/services/EligibilityService';
import { parsePageQuery } from '../domain/shared/pagination';

const router = Router();
const checkIns = new CheckInRepository();
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

router.get('/', async (req, res) => {
  try {
    const personId = parsePersonId(req.query.personId);
    const page = parsePageQuery(req.query);
    const now = new Date();
    const [result, total, thisMonth] = await Promise.all([
      checkIns.findPageByPerson(personId, page),
      checkIns.countByPerson(personId),
      checkIns.countByPersonInMonth(personId, now),
    ]);
    res.json({
      ...result,
      items: result.items.map((checkIn) => checkIn.toJSON()),
      total,
      thisMonth,
    });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const personId = parsePersonId(req.body.personId);
    const now = new Date();

    const person = await persons.findById(personId);
    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }
    if (person.role !== Role.STUDENT) {
      res.status(400).json({ error: 'Only students can check in' });
      return;
    }

    const plan = person.planId != null ? await plans.findById(person.planId) : null;
    const covering = await payments.findCovering(personId, now);
    const eligibility = checkEligibility(person, plan, covering, now);

    if (!eligibility.allowed) {
      res.status(409).json({ reason: eligibility.reason });
      return;
    }

    if (!person.planId) {
      res.status(409).json({ reason: 'no_plan' });
      return;
    }

    const checkIn = await checkIns.create({ personId, planId: person.planId });
    res.status(201).json(checkIn);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
