import { Router } from 'express';
import { Role, Gender } from '@prisma/client';
import { PersonRepository } from '../infra/PersonRepository';
import { assertEmail, assertBirthDate, assertCpf } from './fieldValidators';
import { parseEnabledFilter, parsePageQuery } from '../domain/shared/pagination';

const router = Router();
const repository = new PersonRepository();

function toEnum<T extends object>(values: T, value: unknown): T[keyof T] {
  if (typeof value === 'string' && value in values) {
    return value as T[keyof T];
  }
  throw new Error('Invalid enum value');
}

function parsePlanId(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('Invalid plan');
  }
  return id;
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
  const email = String(body.email);
  const birthDate = new Date(String(body.birthDate));
  const cpf = String(body.cpf);
  const role = toEnum(Role, body.role);
  assertEmail(email);
  assertBirthDate(birthDate);
  assertCpf(cpf);
  const planId = role === Role.STUDENT ? parsePlanId(body.planId) : null;
  return {
    name: String(body.name),
    email,
    birthDate,
    gender: toEnum(Gender, body.gender),
    cpf,
    role,
    planId,
    enabled: parseEnabled(body.enabled),
  };
}

router.get('/', async (req, res) => {
  try {
    const page = parsePageQuery(req.query);
    const role = req.query.role ? toEnum(Role, req.query.role) : undefined;
    const enabled = parseEnabledFilter(req.query.enabled);
    const result = await repository.findPage({ ...page, role, enabled });
    res.json({
      ...result,
      items: result.items.map((person) => person.toJSON()),
    });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const person = await repository.create(parseInput(req.body));
    res.status(201).json(person);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const person = await repository.update(Number(req.params.id), parseInput(req.body));
    res.json(person);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
