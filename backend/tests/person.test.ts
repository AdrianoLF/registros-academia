import { describe, it, expect } from 'vitest';
import { Roles, Genders, codeOf, nameOf } from '../src/domain/Person';
import { Student } from '../src/domain/Student';
import { Teacher } from '../src/domain/Teacher';

const props = {
  id: 1,
  name: 'John',
  email: 'john@gym.com',
  birthDate: new Date('1990-05-20'),
  gender: 'MALE',
  cpf: '529.982.247-25',
};

describe('enums', () => {
  it('maps names to codes', () => {
    expect(codeOf(Roles, 'STUDENT')).toBe(0);
    expect(codeOf(Roles, 'TEACHER')).toBe(1);
    expect(codeOf(Genders, 'FEMALE')).toBe(1);
  });

  it('maps codes to names', () => {
    expect(nameOf(Roles, 1)).toBe('TEACHER');
    expect(nameOf(Genders, 2)).toBe('OTHER');
  });

  it('throws on unknown value', () => {
    expect(() => codeOf(Roles, 'ADMIN')).toThrow('Invalid enum value');
    expect(() => nameOf(Genders, 9)).toThrow('Invalid enum value');
  });
});

describe('Person polymorphism', () => {
  it('Student has its own role', () => {
    expect(new Student(props).role).toBe('STUDENT');
  });

  it('Teacher has its own role', () => {
    expect(new Teacher(props).role).toBe('TEACHER');
  });

  it('validates on construction', () => {
    expect(() => new Student({ ...props, cpf: '111.111.111-11' })).toThrow('Invalid CPF');
  });
});
