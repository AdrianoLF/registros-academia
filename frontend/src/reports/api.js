const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getDailyCheckInsReport() {
  const res = await fetch(`${API}/reports/daily-checkins`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Erro ao carregar relatório');
  }
  return res.json();
}
