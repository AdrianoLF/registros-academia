import { useEffect, useState } from 'react';
import { getProviders } from './api';
import { useError } from '../shared/ErrorContext';
import List from '../shared/List';

const kindLabels = { CASH: 'Dinheiro', TOTALPASS: 'TotalPass', WELLHUB: 'Wellhub' };

function Providers() {
  const [providers, setProviders] = useState([]);
  const showError = useError();

  useEffect(() => {
    getProviders()
      .then(setProviders)
      .catch((e) => showError(e.message));
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Provedores</h1>
      <List
        items={providers}
        empty="Nenhum provedor disponível."
        renderItem={(provider) => (
          <li key={provider.kind} className="px-4 py-3">
            <div className="font-medium">{kindLabels[provider.kind] || provider.kind}</div>
            <div className="text-sm text-slate-400 mt-1 flex gap-4">
              {provider.acceptsDaily && <span>Diária</span>}
              {provider.acceptsMonthly && <span>Mensalista</span>}
              {provider.acceptsAnnual && <span>Anual</span>}
            </div>
          </li>
        )}
      />
    </div>
  );
}

export default Providers;
