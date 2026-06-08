function Spinner({ className = 'h-5 w-5' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
}

export default Spinner;
