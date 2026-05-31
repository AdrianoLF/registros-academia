import { assertEmail, assertBirthDate, assertCpf } from './validators';

export const Roles: Record<string, number> = { STUDENT: 0, TEACHER: 1 };
export const Genders: Record<string, number> = { MALE: 0, FEMALE: 1, OTHER: 2 };

export function codeOf(map: Record<string, number>, name: string): number {
  const code = map[name];
  if (code === undefined) {
    throw new Error('Invalid enum value');
  }
  return code;
}

export function nameOf(map: Record<string, number>, code: number): string {
  const name = Object.keys(map).find((key) => map[key] === code);
  if (name === undefined) {
    throw new Error('Invalid enum value');
  }
  return name;
}

export type PersonProps = {
  id?: number;
  name: string;
  email: string;
  birthDate: Date;
  gender: string;
  cpf: string;
};

export abstract class Person {
  id!: number;
  name!: string;
  email!: string;
  birthDate!: Date;
  gender!: string;
  cpf!: string;

  constructor(props: PersonProps) {
    assertEmail(props.email);
    assertBirthDate(props.birthDate);
    assertCpf(props.cpf);
    Object.assign(this, props);
  }

  abstract get role(): string;

  toJSON() {
    return { ...this, role: this.role };
  }
}
