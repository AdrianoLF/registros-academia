import { buildQuery, PAGE_SIZE } from '../shared/pageQuery';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getPersonsPage({ role, enabled, search, page, limit = PAGE_SIZE }) {
  const res = await fetch(`${API}/persons?${buildQuery({ role, enabled, search, page, limit })}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao carregar');
  }
  return res.json();
}

export async function createPerson(data) {
  const res = await fetch(`${API}/persons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao salvar');
  }
  return res.json();
}

export async function updatePerson(id, data) {
  const res = await fetch(`${API}/persons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao salvar');
  }
  return res.json();
}
