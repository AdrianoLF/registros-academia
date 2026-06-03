import { Router } from 'express';
import { Role, Gender } from '@prisma/client';
import { PersonRepository } from '../infra/PersonRepository';
import { assertEmail, assertBirthDate, assertCpf } from './fieldValidators';

const router = Router();
const repository = new PersonRepository();

function toEnum<T extends object>(values: T, value: unknown): T[keyof T] {
  if (typeof value === 'string' && value in values) {
    return value as T[keyof T];
  }
  throw new Error('Invalid enum value');
}

function parseInput(body: Record<string, unknown>) {
  const email = String(body.email);
  const birthDate = new Date(String(body.birthDate));
  const cpf = String(body.cpf);
  assertEmail(email);
  assertBirthDate(birthDate);
  assertCpf(cpf);
  return {
    name: String(body.name),
    email,
    birthDate,
    gender: toEnum(Gender, body.gender),
    cpf,
    role: toEnum(Role, body.role),
  };
}

router.get('/', async (_req, res) => {
  res.json(await repository.findAll());
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

router.delete('/:id', async (req, res) => {
  try {
    await repository.delete(Number(req.params.id));
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
