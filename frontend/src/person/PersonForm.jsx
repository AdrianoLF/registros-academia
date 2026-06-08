import Form from '../shared/Form';
import { formatCents } from '../plans/api';

const empty = { name: '', email: '', birthDate: '', gender: '', cpf: '', planId: '' };

const input =
  'border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

function PersonForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  plans,
  showPlan,
  loading = false,
  plain = false,
}) {
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const activePlans = plans.filter((plan) => plan.enabled);

  return (
    <Form
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      onCancel={onCancel}
      loading={loading}
      plain={plain}
      className={plain ? 'mb-0' : ''}
    >
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
      {showPlan && (
        <select
          value={form.planId}
          onChange={(e) => update('planId', e.target.value)}
          className={input}
        >
          <option value="">Sem plano</option>
          {activePlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} — R$ {formatCents(plan.priceCents)}
            </option>
          ))}
        </select>
      )}
    </Form>
  );
}

export { empty };
export default PersonForm;
