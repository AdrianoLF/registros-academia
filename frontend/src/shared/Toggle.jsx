import Spinner from './Spinner';

function Toggle({ enabled, onChange, loading = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label || (enabled ? 'Desativar' : 'Ativar')}
      title={enabled ? 'Desativar' : 'Ativar'}
      disabled={loading}
      onClick={() => onChange(!enabled)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60',
        enabled ? 'bg-indigo-600' : 'bg-slate-300',
      ].join(' ')}
    >
      <span
        className={
          `inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition-transform duration-200
          ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`
        }
      >
        {loading && <Spinner className="h-3 w-3 border-slate-200 border-t-indigo-600" />}
      </span>
    </button>
  );
}

export default Toggle;
