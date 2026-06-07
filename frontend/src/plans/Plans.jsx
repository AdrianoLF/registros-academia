// Mock temporário — substituir por chamada à API quando backend tiver rota de planos
import { useState } from 'react';
import { PLANS as INITIAL_PLANS } from './mockPlans';
import Form from '../shared/Form';
import List from '../shared/List';

const typeLabels = { DAILY: 'Diária', MONTHLY: 'Mensalista', ANNUAL: 'Anual' };
const levelLabels = { BASIC: 'Básico', ADVANCED: 'Avançado', PRO: 'Pro' };

const empty = { name: '', price: '', type: '', level: '' };

const input =
  'border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

function Plans() {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setForm(empty);
    setEditingId(null);
  }

  function startEdit(plan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      price: String(plan.price),
      type: plan.type,
      level: plan.level,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price) };

    if (editingId) {
      setPlans((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...data } : p))
      );
    } else {
      setPlans((prev) => [...prev, { ...data, id: Date.now() }]);
    }

    reset();
  }

  function handleDelete(id) {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) reset();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Planos</h1>

      <Form
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Salvar' : 'Adicionar'}
        onCancel={editingId ? reset : undefined}
      >
        <input
          placeholder="Nome do plano"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
          className={input}
        />
        <input
          type="number"
          placeholder="Preço (R$)"
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
          required
          min="0"
          step="0.01"
          className={input}
        />
        <select
          value={form.type}
          onChange={(e) => update('type', e.target.value)}
          required
          className={input}
        >
          <option value="">Tipo do plano</option>
          <option value="DAILY">Diária</option>
          <option value="MONTHLY">Mensalista</option>
          <option value="ANNUAL">Anual</option>
        </select>
        <select
          value={form.level}
          onChange={(e) => update('level', e.target.value)}
          required
          className={input}
        >
          <option value="">Nível do plano</option>
          <option value="BASIC">Básico</option>
          <option value="ADVANCED">Avançado</option>
          <option value="PRO">Pro</option>
        </select>
      </Form>

      <List
        items={plans}
        empty="Nenhum plano cadastrado."
        renderItem={(plan) => (
          <li key={plan.id} className="px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-3">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-slate-500">
                    R$ {plan.price.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-slate-400 mt-1 flex gap-4">
                  <span>{typeLabels[plan.type]}</span>
                  <span>{levelLabels[plan.level]}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(plan)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          </li>
        )}
      />
    </div>
  );
}

export default Plans;
