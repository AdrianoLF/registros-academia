import Spinner from './Spinner';

function LoadingPanel({ label = 'Carregando...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner className="h-6 w-6" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default LoadingPanel;
