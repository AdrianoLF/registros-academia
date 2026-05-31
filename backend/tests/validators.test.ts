import { describe, it, expect } from 'vitest';
import { assertEmail, assertBirthDate, assertCpf } from '../src/domain/validators';

describe('assertEmail', () => {
  it('accepts a valid email', () => {
    expect(() => assertEmail('john@gym.com')).not.toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() => assertEmail('john@')).toThrow('Invalid email');
  });
});

describe('assertBirthDate', () => {
  it('accepts a valid date', () => {
    expect(() => assertBirthDate(new Date('1990-05-20'))).not.toThrow();
  });

  it('rejects a date before 1900', () => {
    expect(() => assertBirthDate(new Date('1899-12-31'))).toThrow('Invalid birth date');
  });

  it('rejects a future date', () => {
    expect(() => assertBirthDate(new Date('3000-01-01'))).toThrow('Invalid birth date');
  });
});

describe('assertCpf', () => {
  it('accepts a valid cpf', () => {
    expect(() => assertCpf('529.982.247-25')).not.toThrow();
  });

  it('rejects an invalid cpf', () => {
    expect(() => assertCpf('12345678901')).toThrow('Invalid CPF');
  });
});
