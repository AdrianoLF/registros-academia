import { prisma } from './prisma';
import { Person, PersonProps, Roles, Genders, codeOf, nameOf } from '../domain/Person';
import { Student } from '../domain/Student';
import { Teacher } from '../domain/Teacher';

const subclasses: Record<number, new (props: PersonProps) => Person> = {
  [Roles.STUDENT]: Student,
  [Roles.TEACHER]: Teacher,
};

type Row = {
  id?: number;
  name: string;
  email: string;
  birthDate: Date;
  gender: number;
  cpf: string;
  role: number;
};

function toDomain({ role, gender, ...props }: Row): Person {
  return new subclasses[role]({
    ...props,
    gender: nameOf(Genders, gender)
  });
}

type CreateInput = {
  name: string;
  email: string;
  birthDate: Date;
  gender: string;
  cpf: string;
  role: string;
};

export class PersonRepository {
  async findAll(): Promise<Person[]> {
    const rows = await prisma.person.findMany();
    return rows.map(toDomain);
  }

  async create({ role, gender, ...data }: CreateInput): Promise<Person> {
    const enums = { role: codeOf(Roles, role), gender: codeOf(Genders, gender) };
    const person = toDomain({ ...data, ...enums });
    const saved = await prisma.person.create({ data: { ...data, ...enums } });
    person.id = saved.id;
    return person;
  }
}
