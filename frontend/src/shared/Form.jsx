function Form({ onSubmit, submitLabel = 'Salvar', onCancel, children }) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 bg-white p-5 rounded-xl shadow-sm mb-6">
      {children}
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg"
      >
        {submitLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg"
        >
          Cancelar
        </button>
      )}
    </form>
  );
}

export default Form;
