import { PlanType } from '@prisma/client';
import { prisma } from './prisma';
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

export class PlanRepository {
  async findAll(): Promise<Plan[]> {
    const rows = await prisma.plan.findMany();
    return rows.map(toDomain);
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
}
