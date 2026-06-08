import { Gender } from './Gender';

export type PersonProps = {
  id?: number;
  name: string;
  email: string;
  birthDate: Date;
  gender: Gender;
  cpf: string;
  planId?: number | null;
};

export abstract class Person {
  id!: number;
  name!: string;
  email!: string;
  birthDate!: Date;
  gender!: Gender;
  cpf!: string;
  planId!: number | null;

  constructor(props: PersonProps) {
    Object.assign(this, props);
  }

  abstract get role(): string;

  toJSON() {
    return { ...this, gender: this.gender.name, role: this.role };
  }
}
