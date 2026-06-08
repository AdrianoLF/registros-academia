const items = [
  { key: 'reports', label: 'Relatórios' },
  { key: 'students', label: 'Alunos' },
  { key: 'teachers', label: 'Professores' },
  { key: 'plans', label: 'Planos' },
];

function TopBar({ current, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 shadow-xl shadow-slate-950/30">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div>
            <p className="text-base font-semibold leading-tight text-white">Academia</p>
            <p className="text-xs text-slate-400">Registros</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-end gap-1">
          {items.map((item) => {
            const active = current === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={[
                  'group relative overflow-hidden rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out',
                  active
                    ? 'text-white'
                    : 'text-slate-400 hover:-translate-y-0.5 hover:text-white',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-all duration-300',
                    active ? 'opacity-100' : 'group-hover:opacity-100',
                  ].join(' ')}
                />
                <span
                  className={[
                    'absolute inset-0 rounded-xl bg-indigo-500/0 blur-md transition-all duration-300',
                    active ? 'bg-indigo-500/20' : 'group-hover:bg-indigo-500/25',
                  ].join(' ')}
                />
                <span className="relative z-10">{item.label}</span>
                <span
                  className={[
                    'absolute bottom-1 left-1/2 z-10 h-0.5 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-300 to-violet-400 transition-all duration-300',
                    active ? 'w-4/5' : 'w-0 group-hover:w-4/5',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default TopBar;
