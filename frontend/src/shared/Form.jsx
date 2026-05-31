function Form({ onSubmit, submitLabel = 'Salvar', children }) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 bg-white p-5 rounded-xl shadow-sm mb-6">
      {children}
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export default Form;
