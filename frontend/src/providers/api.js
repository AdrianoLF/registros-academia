const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getProviders() {
  const res = await fetch(`${API}/providers`);
  if (!res.ok) {
    throw new Error('Erro ao carregar provedores');
  }
  return res.json();
}
