import { describe, it, expect } from 'vitest';
import { Role, Gender as GenderEnum } from '@prisma/client';
import { Gender, GenderName } from '../src/domain/Gender';
import { Student } from '../src/domain/Student';
import { Teacher } from '../src/domain/Teacher';
import { toDomain } from '../src/infra/PersonRepository';

const props = {
  id: 1,
  name: 'John',
  email: 'john@gym.com',
  birthDate: new Date('1990-05-20'),
  gender: new Gender('MALE'),
  cpf: '529.982.247-25',
  planId: 1,
};

function yearsAgo(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

describe('Gender', () => {
  it('exposes a human label', () => {
    expect(new Gender('FEMALE').label).toBe('Feminino');
  });

  it('serializes to its name', () => {
    expect(new Gender('OTHER').toJSON()).toBe('OTHER');
  });

  it('rejects an unknown gender', () => {
    const invalid = 'ALIEN' as unknown as GenderName;
    expect(() => new Gender(invalid)).toThrow('Invalid gender');
  });
});

describe('Person polymorphism', () => {
  it('Student has its own role', () => {
    expect(new Student(props).role).toBe('STUDENT');
  });

  it('Teacher has its own role', () => {
    expect(new Teacher(props).role).toBe('TEACHER');
  });

  it('Student may have no plan', () => {
    expect(() => new Student({ ...props, planId: null })).not.toThrow();
  });

  it('Student requires at least 14 years', () => {
    const tooYoung = yearsAgo(13);
    expect(() => new Student({ ...props, birthDate: tooYoung })).toThrow('Minimum age is 14');
    expect(() => new Student({ ...props, birthDate: yearsAgo(14) })).not.toThrow();
  });

  it('Teacher requires at least 23 years', () => {
    const tooYoung = yearsAgo(20);
    expect(() => new Teacher({ ...props, planId: null, birthDate: tooYoung })).toThrow('Minimum age is 23');
    expect(() => new Teacher({ ...props, planId: null, birthDate: yearsAgo(23) })).not.toThrow();
  });

  it('serializes gender and role as plain values', () => {
    const json = new Student(props).toJSON();
    expect(json.gender).toBe('MALE');
    expect(json.role).toBe('STUDENT');
  });
});

describe('toDomain mapping', () => {
  const row = {
    id: 5,
    name: 'Mary',
    email: 'mary@gym.com',
    birthDate: new Date('1995-01-10'),
    gender: GenderEnum.FEMALE,
    cpf: '529.982.247-25',
    role: Role.TEACHER,
    planId: null,
  };

  it('maps a TEACHER row to a Teacher instance', () => {
    const person = toDomain(row);
    expect(person).toBeInstanceOf(Teacher);
    expect(person.role).toBe('TEACHER');
  });

  it('maps a STUDENT row to a Student instance', () => {
    const person = toDomain({ ...row, role: Role.STUDENT, planId: 2 });
    expect(person).toBeInstanceOf(Student);
  });

  it('rebuilds the Gender object from the enum name', () => {
    const person = toDomain(row);
    expect(person.gender).toBeInstanceOf(Gender);
    expect(person.gender.label).toBe('Feminino');
  });
});
