const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getPersons(role) {
  const res = await fetch(`${API}/persons`);
  if (!res.ok) {
    throw new Error('Erro ao carregar');
  }
  const all = await res.json();
  return all.filter((p) => p.role === role);
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

