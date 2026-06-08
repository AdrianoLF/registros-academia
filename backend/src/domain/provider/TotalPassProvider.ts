import { ProviderKind, PlanType } from '@prisma/client';
import { Provider } from './Provider';

export class TotalPassProvider extends Provider {
  get kind(): ProviderKind {
    return ProviderKind.TOTALPASS;
  }

  accepts(type: PlanType): boolean {
    return type === PlanType.DAILY;
  }
}
