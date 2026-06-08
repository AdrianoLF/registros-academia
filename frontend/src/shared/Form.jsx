import Spinner from './Spinner';

function Form({
  onSubmit,
  submitLabel = 'Salvar',
  onCancel,
  className = '',
  loading = false,
  plain = false,
  children,
}) {
  const shell = plain
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
    : 'grid grid-cols-2 gap-3 bg-white p-5 rounded-xl shadow-sm mb-6';

  return (
    <form onSubmit={onSubmit} className={`${shell} ${className}`.trim()}>
      {children}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg"
      >
        {loading && <Spinner className="h-4 w-4 border-white/30 border-t-white" />}
        {submitLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="bg-slate-200 hover:bg-slate-300 disabled:opacity-60 text-slate-700 font-medium px-4 py-2 rounded-lg"
        >
          Cancelar
        </button>
      )}
    </form>
  );
}

export default Form;
