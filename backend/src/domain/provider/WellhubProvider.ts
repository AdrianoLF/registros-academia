import { ProviderKind, PlanType } from '@prisma/client';
import { Provider } from './Provider';

export class WellhubProvider extends Provider {
  get kind(): ProviderKind {
    return ProviderKind.WELLHUB;
  }

  accepts(type: PlanType): boolean {
    return type === PlanType.DAILY;
  }
}
