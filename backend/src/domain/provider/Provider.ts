import { ProviderKind, PlanType } from '@prisma/client';

export abstract class Provider {
  abstract get kind(): ProviderKind;

  abstract accepts(type: PlanType): boolean;

  approveCheckIn(): boolean {
    return true;
  }

  toJSON() {
    return {
      kind: this.kind,
      acceptsDaily: this.accepts(PlanType.DAILY),
      acceptsMonthly: this.accepts(PlanType.MONTHLY),
      acceptsAnnual: this.accepts(PlanType.ANNUAL),
    };
  }
}
