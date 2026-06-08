import { buildQuery, PAGE_SIZE } from '../shared/pageQuery';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getPayments(personId, { page, limit = PAGE_SIZE } = { page: 1 }) {
  const res = await fetch(`${API}/payments?${buildQuery({ personId, page, limit })}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao carregar pagamentos');
  }
  return res.json();
}

export async function createOneOffDailyPayment(personId) {
  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personId, oneOffDaily: true }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao registrar entrada avulsa');
  }
  return res.json();
}

export async function createPayment(data) {
  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao registrar pagamento');
  }
  return res.json();
}
