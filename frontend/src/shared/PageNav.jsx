function PageNav({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) {
    return total > 0 ? (
      <p className="text-xs text-slate-400">{total} registro{total === 1 ? '' : 's'}</p>
    ) : null;
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50"
      >
        Anterior
      </button>
      <span className="text-xs text-slate-500">
        Página {page} de {totalPages} ({total} registro{total === 1 ? '' : 's'})
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50"
      >
        Próxima
      </button>
    </div>
  );
}

export default PageNav;
