import { buildQuery, PAGE_SIZE } from '../shared/pageQuery';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getCheckIns(personId, { page, limit = PAGE_SIZE } = { page: 1 }) {
  const res = await fetch(`${API}/checkins?${buildQuery({ personId, page, limit })}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao carregar check-ins');
  }
  return res.json();
}

export async function createCheckIn(personId) {
  const res = await fetch(`${API}/checkins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personId }),
  });
  if (!res.ok) {
    const body = await res.json();
    const message = body.reason || body.error || 'Check-in recusado';
    throw new Error(message);
  }
  return res.json();
}

const reasonLabels = {
  person_disabled: 'Aluno inativo',
  no_plan: 'Aluno sem plano',
  no_valid_payment: 'Mensalidade do período não paga',
};

export function checkInReasonLabel(reason) {
  return reasonLabels[reason] || reason;
}
