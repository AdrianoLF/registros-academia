import { useCallback, useEffect, useState } from 'react';
import { formatCents } from '../plans/api';
import { useError } from '../shared/ErrorContext';
import Modal from '../shared/Modal';
import Tabs from '../shared/Tabs';
import PaginatedList from '../shared/PaginatedList';
import { usePaginatedList } from '../shared/usePaginatedList';
import { getCheckIns } from './checkinApi';
import { getPayments, createPayment, createOneOffDailyPayment } from './paymentApi';

const genderLabels = { MALE: 'Masculino', FEMALE: 'Feminino', OTHER: 'Outro' };
const planTypeLabels = { MONTHLY: 'Mensal', ANNUAL: 'Anual' };
const detailTabs = [
  { key: 'checkins', label: 'Check-ins' },
  { key: 'payments', label: 'Pagamentos' },
];

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function lastValidDay(periodEndIso) {
  const d = new Date(periodEndIso);
  d.setUTCDate(d.getUTCDate() - 1);
  return formatDate(d);
}

function paymentCovers(payment, at = new Date()) {
  const time = at.getTime();
  return new Date(payment.periodStart).getTime() <= time && new Date(payment.periodEnd).getTime() > time;
}

function startOfCurrentMonthIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

function age(birthDate) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function isCashRecurring(plan) {
  return plan?.isRecurring && plan?.providerKind === 'CASH';
}

function isDailyCashPlan(plan) {
  return plan?.type === 'DAILY' && plan?.providerKind === 'CASH';
}

function StudentDetail({ student, plans, onClose }) {
  const showError = useError();
  const [tab, setTab] = useState('checkins');
  const [paymentFormMode, setPaymentFormMode] = useState(null);
  const [periodStart, setPeriodStart] = useState(startOfCurrentMonthIso());
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingOneOff, setSavingOneOff] = useState(false);

  const currentPlan = plans.find((p) => p.id === Number(student.planId));
  const dailyCashPlan = plans.find((p) => isDailyCashPlan(p) && p.enabled);
  const isRecurringCash = isCashRecurring(currentPlan);

  const loadCheckIns = useCallback(
    async (params) => {
      try {
        return await getCheckIns(student.id, params);
      } catch (e) {
        showError(e.message);
        return { items: [], total: 0, totalPages: 0, page: params.page, limit: params.limit, thisMonth: 0 };
      }
    },
    [student.id, showError]
  );

  const loadPayments = useCallback(
    async (params) => {
      try {
        return await getPayments(student.id, params);
      } catch (e) {
        showError(e.message);
        return {
          items: [],
          total: 0,
          totalPages: 0,
          page: params.page,
          limit: params.limit,
          accessToday: false,
          activeSubscriptionPayment: null,
        };
      }
    },
    [student.id, showError]
  );

  const checkIns = usePaginatedList(loadCheckIns, [student.id]);
  const payments = usePaginatedList(loadPayments, [student.id]);

  const activeSubscriptionPayment = payments.extra.activeSubscriptionPayment ?? null;
  const accessToday = payments.extra.accessToday ?? false;
  const canRegisterMonthly = isRecurringCash && currentPlan && !activeSubscriptionPayment;
  const canRegisterOneOff = isRecurringCash && !accessToday && dailyCashPlan;

  function getPlanName(planId) {
    const plan = plans.find((p) => p.id === Number(planId));
    return plan ? plan.name : `Plano #${planId}`;
  }

  function getPlanType(planId) {
    const plan = plans.find((p) => p.id === Number(planId));
    if (!plan) {
      return '';
    }
    if (isDailyCashPlan(plan)) {
      return 'Entrada avulsa';
    }
    return planTypeLabels[plan.type] || plan.type;
  }

  function isOneOffPayment(payment) {
    const plan = plans.find((p) => p.id === Number(payment.planId));
    return isDailyCashPlan(plan);
  }

  useEffect(() => {
    setPeriodStart(startOfCurrentMonthIso());
    setTab('checkins');
    setPaymentFormMode(null);
  }, [student.id]);

  async function handlePaymentSubmit(e) {
    e.preventDefault();
    if (!currentPlan) {
      return;
    }
    setSavingPayment(true);
    try {
      await createPayment({
        personId: student.id,
        planId: currentPlan.id,
        priceCents: currentPlan.priceCents,
        periodStart,
      });
      setPaymentFormMode(null);
      setPeriodStart(startOfCurrentMonthIso());
      await payments.reload();
    } catch (err) {
      showError(err.message);
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleOneOffPayment() {
    setSavingOneOff(true);
    try {
      await createOneOffDailyPayment(student.id);
      await payments.reload();
    } catch (err) {
      showError(err.message);
    } finally {
      setSavingOneOff(false);
    }
  }

  return (
    <Modal open title={student.name} onClose={onClose}>
      <div className="space-y-4 -mt-2">
        <div className="text-sm text-slate-600 space-y-1">
          <p><span className="text-slate-400">CPF:</span> {student.cpf}</p>
          <p><span className="text-slate-400">E-mail:</span> {student.email}</p>
          <p>
            <span className="text-slate-400">Nascimento:</span>{' '}
            {formatDate(student.birthDate)} ({age(student.birthDate)} anos)
          </p>
          <p><span className="text-slate-400">Gênero:</span> {genderLabels[student.gender]}</p>
          <p>
            <span className="text-slate-400">Plano atual:</span>{' '}
            <span className="text-indigo-600 font-medium">
              {currentPlan
                ? `${currentPlan.name} — R$ ${formatCents(currentPlan.priceCents)}`
                : 'Sem plano'}
            </span>
          </p>
        </div>

        <Tabs tabs={detailTabs} active={tab} onChange={setTab} />

        {tab === 'checkins' ? (
          <div>
            <div className="flex gap-6 text-sm text-slate-600 mb-4">
              <span>Total: <strong>{checkIns.extra.total ?? 0}</strong></span>
              <span>Este mês: <strong>{checkIns.extra.thisMonth ?? 0}</strong></span>
            </div>
            <PaginatedList
              items={checkIns.items}
              total={checkIns.total}
              page={checkIns.page}
              totalPages={checkIns.totalPages}
              search=""
              onSearchChange={() => {}}
              onPageChange={checkIns.setPage}
              loading={checkIns.loading}
              empty="Nenhum check-in registrado."
              showSearch={false}
              renderItem={(item) => (
                <li key={item.id} className="px-4 py-3 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{getPlanName(item.planId)}</span>
                  <span className="text-slate-500">{formatDateTime(item.createdAt)}</span>
                </li>
              )}
            />
          </div>
        ) : (
          <div>
            {activeSubscriptionPayment && (
              <p className="mb-4 text-sm rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                O plano <strong>{getPlanName(activeSubscriptionPayment.planId)}</strong> já está pago no
                período vigente (válido até{' '}
                <strong>{lastValidDay(activeSubscriptionPayment.periodEnd)}</strong>). Novo pagamento
                disponível a partir de{' '}
                <strong>{formatDate(activeSubscriptionPayment.periodEnd)}</strong>.
              </p>
            )}

            {accessToday && !activeSubscriptionPayment && isRecurringCash && (
              <p className="mb-4 text-sm rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                Entrada avulsa válida para hoje. A mensalidade do plano{' '}
                <strong>{currentPlan.name}</strong> ainda está pendente.
              </p>
            )}

            {(canRegisterMonthly || canRegisterOneOff) && (
              <div className="mb-4 space-y-3">
                {paymentFormMode !== 'monthly' ? (
                  <div className="flex flex-wrap gap-2">
                    {canRegisterMonthly && (
                      <button
                        type="button"
                        onClick={() => setPaymentFormMode('monthly')}
                        className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        + Registrar mensalidade
                      </button>
                    )}
                    {canRegisterOneOff && (
                      <button
                        type="button"
                        onClick={handleOneOffPayment}
                        disabled={savingOneOff}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {savingOneOff
                          ? 'Registrando...'
                          : `+ Entrada avulsa — R$ ${formatCents(dailyCashPlan.priceCents)}`}
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-slate-600">
                      Plano: <strong>{currentPlan.name}</strong>
                      <span className="ml-2 text-indigo-600">({getPlanType(currentPlan.id)})</span>
                    </p>
                    <p className="text-sm rounded-lg bg-indigo-50 px-3 py-2 text-indigo-800">
                      Valor a pagar:{' '}
                      <strong className="text-base">R$ {formatCents(currentPlan.priceCents)}</strong>
                    </p>
                    <label className="block text-sm max-w-xs">
                      <span className="text-slate-500">Início do período</span>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        required
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingPayment}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {savingPayment ? 'Salvando...' : 'Confirmar mensalidade'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentFormMode(null)}
                        className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <PaginatedList
              items={payments.items}
              total={payments.total}
              page={payments.page}
              totalPages={payments.totalPages}
              search=""
              onSearchChange={() => {}}
              onPageChange={payments.setPage}
              loading={payments.loading}
              empty="Nenhum pagamento registrado."
              showSearch={false}
              renderItem={(item) => (
                <li key={item.id} className="px-4 py-3 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-slate-700">
                        {isOneOffPayment(item)
                          ? 'Entrada avulsa'
                          : `Plano: ${getPlanName(item.planId)}`}
                      </p>
                      <p className="text-indigo-600 text-xs font-medium uppercase mt-0.5">
                        {getPlanType(item.planId)}
                      </p>
                    </div>
                    <span className="text-slate-700 font-medium shrink-0">
                      R$ {formatCents(item.priceCents)}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Válido de {formatDate(item.periodStart)} até {lastValidDay(item.periodEnd)}
                  </p>
                  {paymentCovers(item) && (
                    <span className="inline-block mt-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      Período vigente
                    </span>
                  )}
                </li>
              )}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default StudentDetail;
