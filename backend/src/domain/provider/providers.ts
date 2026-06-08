import { ProviderKind } from '@prisma/client';
import { Provider } from './Provider';
import { CashProvider } from './CashProvider';
import { TotalPassProvider } from './TotalPassProvider';
import { WellhubProvider } from './WellhubProvider';

const subclasses: Record<ProviderKind, Provider> = {
  CASH: new CashProvider(),
  TOTALPASS: new TotalPassProvider(),
  WELLHUB: new WellhubProvider(),
};

const allKinds: ProviderKind[] = [ProviderKind.CASH, ProviderKind.TOTALPASS, ProviderKind.WELLHUB];

export function providerFromKind(kind: ProviderKind): Provider {
  return subclasses[kind];
}

export function allProviders(): Provider[] {
  return allKinds.map(providerFromKind);
}
