import { Gender, PlanType, ProviderKind, QualityLevel, Role } from '@prisma/client';
import { prisma } from '../infra/prisma';
import { addUtcMonths, startOfUtcDay } from '../domain/shared/dates';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

async function main() {
  await prisma.checkIn.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.person.deleteMany();
  await prisma.plan.deleteMany();

  const monthlyBasic = await prisma.plan.create({
    data: {
      name: 'Mensal Basic',
      type: PlanType.MONTHLY,
      qualityLevel: QualityLevel.BASIC,
      priceCents: 8990,
      providerKind: ProviderKind.CASH,
      enabled: true,
    },
  });

  const monthlyAdvanced = await prisma.plan.create({
    data: {
      name: 'Mensal Advanced',
      type: PlanType.MONTHLY,
      qualityLevel: QualityLevel.ADVANCED,
      priceCents: 12990,
      providerKind: ProviderKind.CASH,
      enabled: true,
    },
  });

  const annualBasic = await prisma.plan.create({
    data: {
      name: 'Anual Basic',
      type: PlanType.ANNUAL,
      qualityLevel: QualityLevel.BASIC,
      priceCents: 89900,
      providerKind: ProviderKind.CASH,
      enabled: true,
    },
  });

  const dailyCash = await prisma.plan.create({
    data: {
      name: 'Entrada diária',
      type: PlanType.DAILY,
      qualityLevel: QualityLevel.BASIC,
      priceCents: 2500,
      providerKind: ProviderKind.CASH,
      enabled: true,
    },
  });

  const dailyWellhub = await prisma.plan.create({
    data: {
      name: 'Wellhub Avulso',
      type: PlanType.DAILY,
      qualityLevel: QualityLevel.BASIC,
      priceCents: 0,
      providerKind: ProviderKind.WELLHUB,
      enabled: true,
    },
  });

  const dailyTotalPass = await prisma.plan.create({
    data: {
      name: 'Total Pass Avulso',
      type: PlanType.DAILY,
      qualityLevel: QualityLevel.BASIC,
      priceCents: 0,
      providerKind: ProviderKind.TOTALPASS,
      enabled: true,
    },
  });

  const joao = await prisma.person.create({
    data: {
      name: 'João Silva',
      email: 'joao@email.com',
      birthDate: new Date('2000-03-15'),
      gender: Gender.MALE,
      cpf: '52998224725',
      role: Role.STUDENT,
      planId: monthlyBasic.id,
      enabled: true,
    },
  });

  const maria = await prisma.person.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@email.com',
      birthDate: new Date('1998-07-22'),
      gender: Gender.FEMALE,
      cpf: '11144477735',
      role: Role.STUDENT,
      planId: monthlyBasic.id,
      enabled: true,
    },
  });

  const pedro = await prisma.person.create({
    data: {
      name: 'Pedro Oliveira',
      email: 'pedro@email.com',
      birthDate: new Date('1995-11-08'),
      gender: Gender.MALE,
      cpf: '39053344705',
      role: Role.STUDENT,
      planId: monthlyAdvanced.id,
      enabled: true,
    },
  });

  const ana = await prisma.person.create({
    data: {
      name: 'Ana Costa',
      email: 'ana@email.com',
      birthDate: new Date('2002-01-30'),
      gender: Gender.FEMALE,
      cpf: '28625587887',
      role: Role.STUDENT,
      planId: dailyWellhub.id,
      enabled: true,
    },
  });

  const carlos = await prisma.person.create({
    data: {
      name: 'Carlos Lima',
      email: 'carlos@email.com',
      birthDate: new Date('1990-05-12'),
      gender: Gender.MALE,
      cpf: '74645663904',
      role: Role.STUDENT,
      planId: annualBasic.id,
      enabled: true,
    },
  });

  const lucia = await prisma.person.create({
    data: {
      name: 'Lúcia Ferreira',
      email: 'lucia@email.com',
      birthDate: new Date('2001-09-03'),
      gender: Gender.FEMALE,
      cpf: '86853298042',
      role: Role.STUDENT,
      planId: dailyTotalPass.id,
      enabled: true,
    },
  });

  await prisma.person.create({
    data: {
      name: 'Ricardo Mendes',
      email: 'ricardo@email.com',
      birthDate: new Date('1985-12-01'),
      gender: Gender.MALE,
      cpf: '15350946056',
      role: Role.TEACHER,
      enabled: true,
    },
  });

  const now = new Date();
  const monthStart = startOfUtcDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const monthEnd = addUtcMonths(monthStart, 1);
  const lastMonthStart = addUtcMonths(monthStart, -1);
  const lastMonthEnd = monthStart;
  const yearStart = startOfUtcDay(new Date(Date.UTC(now.getUTCFullYear(), 0, 1)));
  const yearEnd = addUtcMonths(yearStart, 12);

  await prisma.payment.create({
    data: {
      personId: joao.id,
      planId: monthlyBasic.id,
      priceCents: monthlyBasic.priceCents,
      periodStart: monthStart,
      periodEnd: monthEnd,
    },
  });

  await prisma.payment.create({
    data: {
      personId: joao.id,
      planId: monthlyBasic.id,
      priceCents: monthlyBasic.priceCents,
      periodStart: lastMonthStart,
      periodEnd: lastMonthEnd,
    },
  });

  await prisma.payment.create({
    data: {
      personId: carlos.id,
      planId: annualBasic.id,
      priceCents: annualBasic.priceCents,
      periodStart: yearStart,
      periodEnd: yearEnd,
    },
  });

  for (const days of [1, 2, 3, 5, 8, 12]) {
    await prisma.checkIn.create({
      data: {
        personId: joao.id,
        planId: monthlyBasic.id,
        createdAt: daysAgo(days),
      },
    });
  }

  for (const days of [2, 4, 10]) {
    await prisma.checkIn.create({
      data: {
        personId: ana.id,
        planId: dailyWellhub.id,
        createdAt: daysAgo(days),
      },
    });
  }

  console.log('Seed ok');
  console.log('- João: mensal pago (pode check-in)');
  console.log('- Maria: mensal atrasada (pode pagar mensalidade ou entrada avulsa)');
  console.log('- Pedro: mensal atrasada (mesmo caso da Maria)');
  console.log('- Ana: Wellhub (sempre pode)');
  console.log('- Carlos: anual pago');
  console.log('- Lúcia: Total Pass (sempre pode)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
