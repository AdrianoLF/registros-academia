import { describe, it, expect } from 'vitest';
import { ProviderKind, PlanType } from '@prisma/client';
import { allProviders, providerFromKind } from '../src/domain/provider/providers';
import { CashProvider } from '../src/domain/provider/CashProvider';
import { TotalPassProvider } from '../src/domain/provider/TotalPassProvider';
import { WellhubProvider } from '../src/domain/provider/WellhubProvider';

describe('Provider subclasses', () => {
  it('lists the three fixed providers', () => {
    const kinds = allProviders().map((provider) => provider.kind);
    expect(kinds).toEqual([ProviderKind.CASH, ProviderKind.TOTALPASS, ProviderKind.WELLHUB]);
  });

  it('resolves the correct subclass per kind', () => {
    expect(providerFromKind(ProviderKind.CASH)).toBeInstanceOf(CashProvider);
    expect(providerFromKind(ProviderKind.TOTALPASS)).toBeInstanceOf(TotalPassProvider);
    expect(providerFromKind(ProviderKind.WELLHUB)).toBeInstanceOf(WellhubProvider);
  });

  it('cash accepts daily, monthly and annual', () => {
    const cash = providerFromKind(ProviderKind.CASH);
    expect(cash.accepts(PlanType.DAILY)).toBe(true);
    expect(cash.accepts(PlanType.MONTHLY)).toBe(true);
    expect(cash.accepts(PlanType.ANNUAL)).toBe(true);
  });

  it('totalpass and wellhub accept only daily', () => {
    for (const kind of [ProviderKind.TOTALPASS, ProviderKind.WELLHUB] as const) {
      const provider = providerFromKind(kind);
      expect(provider.accepts(PlanType.DAILY)).toBe(true);
      expect(provider.accepts(PlanType.MONTHLY)).toBe(false);
      expect(provider.accepts(PlanType.ANNUAL)).toBe(false);
    }
  });

  it('approves check-in', () => {
    expect(providerFromKind(ProviderKind.CASH).approveCheckIn()).toBe(true);
  });

  it('serializes accepted types as flat fields', () => {
    const json = providerFromKind(ProviderKind.WELLHUB).toJSON();
    expect(json.kind).toBe(ProviderKind.WELLHUB);
    expect(json.acceptsDaily).toBe(true);
    expect(json.acceptsMonthly).toBe(false);
    expect(json.acceptsAnnual).toBe(false);
  });
});
