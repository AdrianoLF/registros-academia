// TODO: buscar planos da API quando backend tiver rota /plans
import Form from '../shared/Form';
import { PLANS } from '../plans/mockPlans';

const empty = { name: '', email: '', birthDate: '', gender: '', cpf: '', planId: '' };

const input =
  'border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

function PersonForm({ form, setForm, onSubmit, onCancel, editing }) {
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <Form onSubmit={onSubmit} submitLabel={editing ? 'Salvar' : 'Adicionar'} onCancel={editing ? onCancel : undefined}>
      <input
        placeholder="Nome"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        required
        className={input}
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        required
        className={input}
      />
      <input
        type="date"
        value={form.birthDate}
        onChange={(e) => update('birthDate', e.target.value)}
        required
        className={input}
      />
      <select
        value={form.gender}
        onChange={(e) => update('gender', e.target.value)}
        required
        className={input}
      >
        <option value="">Gênero</option>
        <option value="MALE">Masculino</option>
        <option value="FEMALE">Feminino</option>
        <option value="OTHER">Outro</option>
      </select>
      <input
        placeholder="CPF"
        value={form.cpf}
        onChange={(e) => update('cpf', e.target.value)}
        required
        className={input}
      />
      <select
        value={form.planId}
        onChange={(e) => update('planId', e.target.value)}
        required
        className={input}
      >
        <option value="">Selecione um plano</option>
        {PLANS.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} — R$ {plan.price.toFixed(2)}
          </option>
        ))}
      </select>
    </Form>
  );
}

export { empty };
export default PersonForm;
