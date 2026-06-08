import { describe, it, expect, vi, beforeEach } from 'vitest';

const person = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock('../src/infra/prisma', () => ({ prisma: { person } }));

import { Role, Gender } from '@prisma/client';
import { PersonRepository } from '../src/infra/PersonRepository';
import { Student } from '../src/domain/Student';

const repo = new PersonRepository();

const input = {
  name: 'Ana',
  email: 'ana@gym.com',
  birthDate: new Date('1998-03-15'),
  gender: Gender.FEMALE,
  cpf: '529.982.247-25',
  role: Role.STUDENT,
  planId: 1,
  enabled: true,
};

function yearsAgo(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PersonRepository.create', () => {
  it('persists enum names and returns the saved id', async () => {
    person.create.mockResolvedValue({ id: 42 });
    const result = await repo.create(input);
    expect(person.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ gender: 'FEMALE', role: 'STUDENT' }),
    });
    expect(result).toBeInstanceOf(Student);
    expect(result.id).toBe(42);
  });

  it('rejects business rule violations before touching the database', async () => {
    await expect(repo.create({ ...input, birthDate: yearsAgo(13) })).rejects.toThrow(
      'Minimum age is 14'
    );
    expect(person.create).not.toHaveBeenCalled();
  });

  it('persists students without a plan', async () => {
    person.create.mockResolvedValue({ id: 43 });
    const result = await repo.create({ ...input, planId: null });
    expect(person.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ planId: null }),
    });
    expect(result).toBeInstanceOf(Student);
    expect(result.planId).toBeNull();
  });
});

describe('PersonRepository.update', () => {
  it('updates by id with enum names', async () => {
    person.update.mockResolvedValue({ id: 7 });
    const result = await repo.update(7, input);
    expect(person.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: expect.objectContaining({ gender: 'FEMALE', role: 'STUDENT' }),
    });
    expect(result.id).toBe(7);
  });

  it('rejects business rule violations before touching the database', async () => {
    await expect(
      repo.update(7, { ...input, role: Role.TEACHER, planId: null, birthDate: yearsAgo(20) })
    ).rejects.toThrow('Minimum age is 23');
    expect(person.update).not.toHaveBeenCalled();
  });
});

