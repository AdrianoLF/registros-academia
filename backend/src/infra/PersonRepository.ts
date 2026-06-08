import { Role, Gender as GenderEnum } from '@prisma/client';
import { prisma } from './prisma';
import { Person, PersonProps } from '../domain/Person';
import { Gender } from '../domain/Gender';
import { Student } from '../domain/Student';
import { Teacher } from '../domain/Teacher';

const subclasses: Record<Role, new (props: PersonProps) => Person> = {
  STUDENT: Student,
  TEACHER: Teacher,
};

export type PersonData = {
  name: string;
  email: string;
  birthDate: Date;
  gender: GenderEnum;
  cpf: string;
  role: Role;
  planId: number | null;
  enabled: boolean;
};

type Row = PersonData & { id: number };

export function toDomain({ role, gender, enabled, ...rest }: Row): Person {
  return new subclasses[role]({
    ...rest,
    gender: new Gender(gender),
    enabled: enabled ?? true,
  });
}

export class PersonRepository {
  async findAll(): Promise<Person[]> {
    const rows = await prisma.person.findMany();
    return rows.map(toDomain);
  }

  async create(data: PersonData): Promise<Person> {
    const person = toDomain({ ...data, id: 0 });
    const saved = await prisma.person.create({ data });
    person.id = saved.id;
    return person;
  }

  async update(id: number, data: PersonData): Promise<Person> {
    const person = toDomain({ ...data, id });
    await prisma.person.update({ where: { id }, data });
    return person;
  }

}
