import { ProviderKind, PlanType } from '@prisma/client';
import { Provider } from './Provider';

export class CashProvider extends Provider {
  get kind(): ProviderKind {
    return ProviderKind.CASH;
  }

  accepts(type: PlanType): boolean {
    return type === PlanType.DAILY || type === PlanType.MONTHLY || type === PlanType.ANNUAL;
  }
}
