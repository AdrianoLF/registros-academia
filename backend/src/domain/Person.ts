import { Gender } from './Gender';

export type PersonProps = {
  id?: number;
  name: string;
  email: string;
  birthDate: Date;
  gender: Gender;
  cpf: string;
};

export abstract class Person {
  id!: number;
  name!: string;
  email!: string;
  birthDate!: Date;
  gender!: Gender;
  cpf!: string;

  constructor(props: PersonProps) {
    Object.assign(this, props);
  }

  abstract get role(): string;

  toJSON() {
    return { ...this, gender: this.gender.name, role: this.role };
  }
}
