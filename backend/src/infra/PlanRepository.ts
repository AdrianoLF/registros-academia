import { PlanType, ProviderKind, Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { buildPageResult, PageResult, ParsedPageQuery, skip } from '../domain/shared/pagination';
import { Plan, PlanProps, assertNoActiveSlotConflict } from '../domain/plan/Plan';
import { DailyPlan } from '../domain/plan/DailyPlan';
import { MonthlyPlan } from '../domain/plan/MonthlyPlan';
import { AnnualPlan } from '../domain/plan/AnnualPlan';

const subclasses: Record<PlanType, new (props: PlanProps) => Plan> = {
  [PlanType.DAILY]: DailyPlan,
  [PlanType.MONTHLY]: MonthlyPlan,
  [PlanType.ANNUAL]: AnnualPlan,
};

export type PlanData = Omit<PlanProps, 'id'>;

type Row = PlanData & { id: number };

export function toDomain(row: Row): Plan {
  return new subclasses[row.type](row);
}

export type PlanPageFilter = ParsedPageQuery & {
  enabled?: boolean;
};

export class PlanRepository {
  async findPage(filter: PlanPageFilter): Promise<PageResult<Plan>> {
    const where: Prisma.PlanWhereInput = {};
    if (filter.enabled !== undefined) {
      where.enabled = filter.enabled;
    }
    if (filter.search) {
      where.name = { contains: filter.search, mode: 'insensitive' };
    }
    const total = await prisma.plan.count({ where });
    const rows = await prisma.plan.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: skip(filter.page, filter.limit),
      take: filter.limit,
    });
    return buildPageResult(rows.map(toDomain), total, filter.page, filter.limit);
  }

  async findById(id: number): Promise<Plan | null> {
    const row = await prisma.plan.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findActiveDailyCash(): Promise<Plan | null> {
    const row = await prisma.plan.findFirst({
      where: {
        type: PlanType.DAILY,
        providerKind: ProviderKind.CASH,
        enabled: true,
      },
    });
    return row ? toDomain(row) : null;
  }

  async findActiveBySlot(
    qualityLevel: PlanData['qualityLevel'],
    providerKind: PlanData['providerKind'],
    type: PlanData['type']
  ): Promise<Plan[]> {
    const rows = await prisma.plan.findMany({
      where: { qualityLevel, providerKind, type, enabled: true },
    });
    return rows.map(toDomain);
  }

  async create(data: PlanData): Promise<Plan> {
    const activeInSlot = await this.findActiveBySlot(data.qualityLevel, data.providerKind, data.type);
    assertNoActiveSlotConflict(
      activeInSlot.map((plan) => ({
        qualityLevel: plan.qualityLevel,
        providerKind: plan.providerKind,
        type: plan.type,
        enabled: plan.enabled,
      })),
      data
    );
    const plan = toDomain({ ...data, id: 0 });
    try {
      const saved = await prisma.plan.create({ data });
      plan.id = saved.id;
      return plan;
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'P2002') {
        throw new Error('An active plan already exists for this slot');
      }
      throw e;
    }
  }

  async update(id: number, data: PlanData): Promise<Plan> {
    if (data.enabled) {
      const activeInSlot = await this.findActiveBySlot(data.qualityLevel, data.providerKind, data.type);
      assertNoActiveSlotConflict(
        activeInSlot
          .filter((plan) => plan.id !== id)
          .map((plan) => ({
            qualityLevel: plan.qualityLevel,
            providerKind: plan.providerKind,
            type: plan.type,
            enabled: plan.enabled,
          })),
        data
      );
    }
    const plan = toDomain({ ...data, id });
    try {
      await prisma.plan.update({ where: { id }, data });
      return plan;
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'P2002') {
        throw new Error('An active plan already exists for this slot');
      }
      throw e;
    }
  }
}
