import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getPlans, createPlan, updatePlan, formatCents } from './api';
import { getProviders } from '../providers/api';
import { useError } from '../shared/ErrorContext';
import PlanForm from './PlanForm';
import List from '../shared/List';
import Modal from '../shared/Modal';
import Tabs from '../shared/Tabs';
import LoadingPanel from '../shared/LoadingPanel';
import IconButton, { PencilIcon } from '../shared/IconButton';
import Toggle from '../shared/Toggle';
import ConfirmModal from '../shared/ConfirmModal';

const typeLabels = { DAILY: 'Diária', MONTHLY: 'Mensalista', ANNUAL: 'Anual' };
const levelLabels = { BASIC: 'Básico', ADVANCED: 'Avançado', PRO: 'Pro' };
const providerLabels = { CASH: 'Dinheiro', TOTALPASS: 'TotalPass', WELLHUB: 'Wellhub' };
const tabs = [
  { key: 'ativos', label: 'Ativos' },
  { key: 'inativos', label: 'Inativos' },
];

const empty = {
  name: '',
  price: '',
  type: '',
  qualityLevel: '',
  providerKind: 'CASH',
};

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

function toPlanPayload(form, enabled) {
  return {
    name: form.name,
    type: form.type,
    qualityLevel: form.qualityLevel,
    priceCents: Math.round(parseFloat(form.price) * 100),
    providerKind: form.providerKind,
    enabled,
  };
}

function toForm(plan) {
  return {
    name: plan.name,
    price: String(plan.priceCents / 100),
    type: plan.type,
    qualityLevel: plan.qualityLevel,
    providerKind: plan.providerKind,
  };
}

function Plans() {
  const { tab: listTab } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState(empty);
  const [editForm, setEditForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const showError = useError();

  if (listTab !== 'ativos' && listTab !== 'inativos') {
    return <Navigate to="/planos/ativos" replace />;
  }

  const showActive = listTab === 'ativos';
  const selectedProvider = providers.find((p) => p.kind === form.providerKind);
  const typesForProvider = acceptedTypes(selectedProvider);
  const editProvider = providers.find((p) => p.kind === editForm.providerKind);
  const editTypesForProvider = acceptedTypes(editProvider);

  async function load() {
    setLoading(true);
    try {
      const [planList, providerList] = await Promise.all([getPlans(), getProviders()]);
      setPlans(planList);
      setProviders(providerList);
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(setter, field, value) {
    setter((prev) => {
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

  const filtered = plans.filter((p) => (showActive ? p.enabled : !p.enabled));

  function openEdit(plan) {
    setEditing(plan);
    setEditForm(toForm(plan));
  }

  function closeEdit() {
    setEditing(null);
    setEditForm(empty);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoadingCreate(true);
    try {
      await createPlan(toPlanPayload(form, true));
      setForm(empty);
      await load();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setLoadingEdit(true);
    try {
      await updatePlan(editing.id, toPlanPayload(editForm, editing.enabled));
      closeEdit();
      await load();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingEdit(false);
    }
  }

  function requestToggle(plan, nextEnabled) {
    setConfirmToggle({ plan, nextEnabled });
  }

  async function confirmTogglePlan() {
    const { plan, nextEnabled } = confirmToggle;
    setTogglingId(plan.id);
    try {
      await updatePlan(plan.id, toPlanPayload(toForm(plan), nextEnabled));
      setConfirmToggle(null);
      await load();
    } catch (err) {
      showError(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Planos e provedores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,1fr)_minmax(0,2fr)] gap-6 items-start">
        <section>
          <h2 className="text-lg font-semibold mb-4">Provedores</h2>
          {loading ? (
            <LoadingPanel label="Carregando provedores..." />
          ) : (
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
          )}
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Novo plano</h2>
            <PlanForm
              form={form}
              onChange={(field, value) => updateForm(setForm, field, value)}
              onSubmit={handleCreate}
              providers={providers}
              typesForProvider={typesForProvider}
              typeLabels={typeLabels}
              providerLabels={providerLabels}
              submitLabel="Adicionar"
              loading={loadingCreate}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Planos cadastrados</h2>
            <Tabs tabs={tabs} active={listTab} onChange={(key) => navigate(`/planos/${key}`)} />

            {loading ? (
              <LoadingPanel />
            ) : (
              <List
                items={filtered}
                empty={showActive ? 'Nenhum plano ativo.' : 'Nenhum plano inativo.'}
                renderItem={(plan) => (
                  <li key={plan.id} className="px-4 py-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex flex-wrap gap-3 items-center">
                          <span className="font-medium">{plan.name}</span>
                          <span className="text-slate-500">R$ {formatCents(plan.priceCents)}</span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1 flex flex-wrap gap-4">
                          <span>{typeLabels[plan.type]}</span>
                          <span>{levelLabels[plan.qualityLevel]}</span>
                          <span>{providerLabels[plan.providerKind] || plan.providerKind}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Toggle
                          enabled={plan.enabled}
                          loading={togglingId === plan.id}
                          onChange={(next) => requestToggle(plan, next)}
                        />
                        <IconButton label="Editar" onClick={() => openEdit(plan)}>
                          <PencilIcon />
                        </IconButton>
                      </div>
                    </div>
                  </li>
                )}
              />
            )}
          </div>
        </section>
      </div>

      <Modal open={editing !== null} title="Editar plano" onClose={closeEdit}>
        <PlanForm
          form={editForm}
          onChange={(field, value) => updateForm(setEditForm, field, value)}
          onSubmit={handleEdit}
          onCancel={closeEdit}
          providers={providers}
          typesForProvider={editTypesForProvider}
          typeLabels={typeLabels}
          providerLabels={providerLabels}
          submitLabel="Salvar"
          loading={loadingEdit}
          plain
        />
      </Modal>

      <ConfirmModal
        open={confirmToggle !== null}
        title={confirmToggle?.nextEnabled ? 'Ativar plano' : 'Desativar plano'}
        message={
          confirmToggle
            ? `Tem certeza que deseja ${confirmToggle.nextEnabled ? 'ativar' : 'desativar'} o plano ${confirmToggle.plan.name}?`
            : ''
        }
        confirmLabel={confirmToggle?.nextEnabled ? 'Ativar' : 'Desativar'}
        danger={confirmToggle ? !confirmToggle.nextEnabled : false}
        loading={togglingId !== null}
        onConfirm={confirmTogglePlan}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
}

export default Plans;
