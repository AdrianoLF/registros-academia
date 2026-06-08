import { Role, Gender as GenderEnum, Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { buildPageResult, PageResult, ParsedPageQuery, skip } from '../domain/shared/pagination';
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

export type PersonPageFilter = ParsedPageQuery & {
  role?: Role;
  enabled?: boolean;
};

function buildPersonWhere(filter: PersonPageFilter): Prisma.PersonWhereInput {
  const where: Prisma.PersonWhereInput = {};
  if (filter.role) {
    where.role = filter.role;
  }
  if (filter.enabled !== undefined) {
    where.enabled = filter.enabled;
  }
  if (filter.search) {
    const digits = filter.search.replace(/\D/g, '');
    const or: Prisma.PersonWhereInput[] = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { email: { contains: filter.search, mode: 'insensitive' } },
    ];
    if (digits) {
      or.push({ cpf: { contains: digits } });
    }
    where.OR = or;
  }
  return where;
}

export class PersonRepository {
  async findPage(filter: PersonPageFilter): Promise<PageResult<Person>> {
    const where = buildPersonWhere(filter);
    const total = await prisma.person.count({ where });
    const rows = await prisma.person.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: skip(filter.page, filter.limit),
      take: filter.limit,
    });
    return buildPageResult(rows.map(toDomain), total, filter.page, filter.limit);
  }

  async findById(id: number): Promise<Person | null> {
    const row = await prisma.person.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
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
