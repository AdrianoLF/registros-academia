import Modal from './Modal';
import Spinner from './Spinner';

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-slate-600 mb-6">{message}</p>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={[
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60',
            danger ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700',
          ].join(' ')}
        >
          {loading && <Spinner className="h-4 w-4 border-white/30 border-t-white" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
