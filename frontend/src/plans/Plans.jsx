import { useEffect, useState } from 'react';
import { getPlans, createPlan, formatCents } from './api';
import { getProviders } from '../providers/api';
import { useError } from '../shared/ErrorContext';
import Form from '../shared/Form';
import List from '../shared/List';

const typeLabels = { DAILY: 'Diária', MONTHLY: 'Mensalista', ANNUAL: 'Anual' };
const levelLabels = { BASIC: 'Básico', ADVANCED: 'Avançado', PRO: 'Pro' };
const providerLabels = { CASH: 'Dinheiro', TOTALPASS: 'TotalPass', WELLHUB: 'Wellhub' };

const empty = {
  name: '',
  price: '',
  type: '',
  qualityLevel: '',
  providerKind: 'CASH',
  enabled: true,
};

const input =
  'border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

function acceptedTypes(provider) {
  if (!provider) {
    return ['DAILY', 'MONTHLY', 'ANNUAL'];
  }
  const types = [];
  if (provider.acceptsDaily) types.push('DAILY');
  if (provider.acceptsMonthly) types.push('MONTHLY');
  if (provider.acceptsAnnual) types.push('ANNUAL');
  return types;
}

function Plans() {
  const [plans, setPlans] = useState([]);
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState(empty);
  const showError = useError();

  const selectedProvider = providers.find((p) => p.kind === form.providerKind);
  const typesForProvider = acceptedTypes(selectedProvider);

  function load() {
    Promise.all([getPlans(), getProviders()])
      .then(([planList, providerList]) => {
        setPlans(planList);
        setProviders(providerList);
      })
      .catch((e) => showError(e.message));
  }

  useEffect(load, []);

  function update(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'providerKind') {
        const provider = providers.find((p) => p.kind === value);
        const allowed = acceptedTypes(provider);
        if (next.type && !allowed.includes(next.type)) {
          next.type = '';
        }
      }
      return next;
    });
  }

  function reset() {
    setForm(empty);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createPlan({
        name: form.name,
        type: form.type,
        qualityLevel: form.qualityLevel,
        priceCents: Math.round(parseFloat(form.price) * 100),
        providerKind: form.providerKind,
        enabled: form.enabled,
      });
      reset();
      load();
    } catch (err) {
      showError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Planos e provedores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,1fr)_minmax(0,2fr)] gap-6 items-start">
        <section>
          <h2 className="text-lg font-semibold mb-4">Provedores</h2>
          <List
            items={providers}
            empty="Nenhum provedor disponível."
            renderItem={(provider) => (
              <li key={provider.kind} className="px-4 py-3">
                <div className="font-medium">{providerLabels[provider.kind] || provider.kind}</div>
                <div className="text-sm text-slate-400 mt-1 flex flex-wrap gap-3">
                  {provider.acceptsDaily && <span>Diária</span>}
                  {provider.acceptsMonthly && <span>Mensalista</span>}
                  {provider.acceptsAnnual && <span>Anual</span>}
                </div>
              </li>
            )}
          />
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Novo plano</h2>
            <Form onSubmit={handleSubmit} submitLabel="Adicionar" className="mb-0">
              <input
                placeholder="Nome do plano"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
                className={input}
              />
              <input
                type="number"
                placeholder="Preço (R$)"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                required
                min="0"
                step="0.01"
                className={input}
              />
              <select
                value={form.providerKind}
                onChange={(e) => update('providerKind', e.target.value)}
                required
                className={input}
              >
                {providers.map((provider) => (
                  <option key={provider.kind} value={provider.kind}>
                    {providerLabels[provider.kind] || provider.kind}
                  </option>
                ))}
              </select>
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                required
                className={input}
              >
                <option value="">Tipo do plano</option>
                {typesForProvider.map((type) => (
                  <option key={type} value={type}>
                    {typeLabels[type]}
                  </option>
                ))}
              </select>
              <select
                value={form.qualityLevel}
                onChange={(e) => update('qualityLevel', e.target.value)}
                required
                className={input}
              >
                <option value="">Nível do plano</option>
                <option value="BASIC">Básico</option>
                <option value="ADVANCED">Avançado</option>
                <option value="PRO">Pro</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => update('enabled', e.target.checked)}
                />
                Ativo
              </label>
            </Form>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Planos cadastrados</h2>
            <List
              items={plans}
              empty="Nenhum plano cadastrado."
              renderItem={(plan) => (
                <li key={plan.id} className="px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-slate-500">R$ {formatCents(plan.priceCents)}</span>
                        {!plan.enabled && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Inativo</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 mt-1 flex flex-wrap gap-4">
                        <span>{typeLabels[plan.type]}</span>
                        <span>{levelLabels[plan.qualityLevel]}</span>
                        <span>{providerLabels[plan.providerKind] || plan.providerKind}</span>
                      </div>
                    </div>
                  </div>
                </li>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default Plans;
