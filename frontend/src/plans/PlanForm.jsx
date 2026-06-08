import Form from '../shared/Form';

const input =
  'border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

function PlanForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  providers,
  typesForProvider,
  typeLabels,
  providerLabels,
  submitLabel,
  loading,
  plain,
}) {
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
        placeholder="Nome do plano"
        value={form.name}
        onChange={(e) => onChange('name', e.target.value)}
        required
        className={input}
      />
      <input
        type="number"
        placeholder="Preço (R$)"
        value={form.price}
        onChange={(e) => onChange('price', e.target.value)}
        required
        min="0"
        step="0.01"
        className={input}
      />
      <select
        value={form.providerKind}
        onChange={(e) => onChange('providerKind', e.target.value)}
        required
        className={input}
      >
        {providers.map((provider) => (
          <option key={provider.kind} value={provider.kind}>
            {providerLabels[provider.kind] || provider.kind}
          </option>
        ))}
      </select>
      <select
        value={form.type}
        onChange={(e) => onChange('type', e.target.value)}
        required
        className={input}
      >
        <option value="">Tipo do plano</option>
        {typesForProvider.map((type) => (
          <option key={type} value={type}>
            {typeLabels[type]}
          </option>
        ))}
      </select>
      <select
        value={form.qualityLevel}
        onChange={(e) => onChange('qualityLevel', e.target.value)}
        required
        className={input}
      >
        <option value="">Nível do plano</option>
        <option value="BASIC">Básico</option>
        <option value="ADVANCED">Avançado</option>
        <option value="PRO">Pro</option>
      </select>
    </Form>
  );
}

export default PlanForm;
