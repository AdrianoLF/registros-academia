import { PlanType, QualityLevel, ProviderKind } from '@prisma/client';
import { providerFromKind } from '../provider/providers';

export type PlanProps = {
  id?: number;
  name: string;
  type: PlanType;
  qualityLevel: QualityLevel;
  priceCents: number;
  providerKind: ProviderKind;
  enabled: boolean;
};

export type PlanSlot = Pick<PlanProps, 'qualityLevel' | 'providerKind' | 'type' | 'enabled'>;

export function assertProviderAcceptsPlanType(providerKind: ProviderKind, type: PlanType): void {
  if (!providerFromKind(providerKind).accepts(type)) {
    throw new Error('Provider does not accept this plan type');
  }
}

export function assertNoActiveSlotConflict(existing: PlanSlot[], candidate: PlanSlot): void {
  if (!candidate.enabled) {
    return;
  }
  const conflict = existing.find(
    (plan) =>
      plan.enabled &&
      plan.qualityLevel === candidate.qualityLevel &&
      plan.providerKind === candidate.providerKind &&
      plan.type === candidate.type
  );
  if (conflict) {
    throw new Error('An active plan already exists for this slot');
  }
}

export abstract class Plan {
  id!: number;
  name!: string;
  type!: PlanType;
  qualityLevel!: QualityLevel;
  priceCents!: number;
  providerKind!: ProviderKind;
  enabled!: boolean;

  constructor(props: PlanProps) {
    assertProviderAcceptsPlanType(props.providerKind, props.type);
    Object.assign(this, props);
  }

  abstract validUntil(start: Date): Date;

  abstract dailyAccrualCents(day: Date): number;

  abstract get isRecurring(): boolean;

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      qualityLevel: this.qualityLevel,
      priceCents: this.priceCents,
      providerKind: this.providerKind,
      enabled: this.enabled,
      isRecurring: this.isRecurring,
    };
  }
}
