import { Gender } from './Gender';

export type PersonProps = {
  id?: number;
  name: string;
  email: string;
  birthDate: Date;
  gender: Gender;
  cpf: string;
  planId?: number | null;
  enabled?: boolean;
};

export abstract class Person {
  id!: number;
  name!: string;
  email!: string;
  birthDate!: Date;
  gender!: Gender;
  cpf!: string;
  enabled!: boolean;
  planId!: number | null;

  constructor(props: PersonProps) {
    Object.assign(this, props);
  }

  abstract get role(): string;

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      birthDate: this.birthDate,
      gender: this.gender.name,
      cpf: this.cpf,
      planId: this.planId,
      enabled: this.enabled ?? true,
      role: this.role,
    };
  }
}
