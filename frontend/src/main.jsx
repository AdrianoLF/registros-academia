import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [status, setStatus] = useState('carregando...');

  useEffect(() => {
    fetch(`${API}/`)
      .then((r) => r.json())
      .then((d) => setStatus(d.message))
      .catch(() => setStatus('backend offline'));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Academia</h1>
      <p>Status do backend: {status}</p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
