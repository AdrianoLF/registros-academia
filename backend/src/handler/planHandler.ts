import { Router } from 'express';
import { PlanType, QualityLevel, ProviderKind } from '@prisma/client';
import { PlanRepository } from '../infra/PlanRepository';

const router = Router();
const repository = new PlanRepository();

function toEnum<T extends object>(values: T, value: unknown): T[keyof T] {
  if (typeof value === 'string' && value in values) {
    return value as T[keyof T];
  }
  throw new Error('Invalid enum value');
}

function assertPriceCents(value: unknown): number {
  const cents = Number(value);
  if (!Number.isInteger(cents) || cents < 0) {
    throw new Error('Invalid price');
  }
  return cents;
}

function parseEnabled(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  throw new Error('Invalid enabled value');
}

function parseInput(body: Record<string, unknown>) {
  const type = toEnum(PlanType, body.type);
  const providerKind = body.providerKind !== undefined
    ? toEnum(ProviderKind, body.providerKind)
    : ProviderKind.CASH;
  return {
    name: String(body.name),
    type,
    qualityLevel: toEnum(QualityLevel, body.qualityLevel),
    priceCents: assertPriceCents(body.priceCents),
    providerKind,
    enabled: parseEnabled(body.enabled),
  };
}

router.get('/', async (_req, res) => {
  res.json(await repository.findAll());
});

router.post('/', async (req, res) => {
  try {
    const plan = await repository.create(parseInput(req.body));
    res.status(201).json(plan);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const plan = await repository.update(Number(req.params.id), parseInput(req.body));
    res.json(plan);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
