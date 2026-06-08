const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getPlans() {
  const res = await fetch(`${API}/plans`);
  if (!res.ok) {
    throw new Error('Erro ao carregar planos');
  }
  return res.json();
}

export async function updatePlan(id, data) {
  const res = await fetch(`${API}/plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao salvar plano');
  }
  return res.json();
}

export async function createPlan(data) {
  const res = await fetch(`${API}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao salvar plano');
  }
  return res.json();
}

export function formatCents(priceCents) {
  return (priceCents / 100).toFixed(2);
}
