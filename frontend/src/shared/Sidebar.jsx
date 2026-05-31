const items = [
  { key: 'reports', label: 'Relatórios' },
  { key: 'students', label: 'Alunos' },
  { key: 'teachers', label: 'Professores' },
  { key: 'plans', label: 'Planos' },
  { key: 'providers', label: 'Provedores' },
];

function Sidebar({ current, onNavigate }) {
  return (
    <nav className="w-60 shrink-0 bg-slate-900 text-slate-100 p-6">
      <h1 className="text-xl font-bold mb-8 tracking-tight">Academia</h1>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.key}>
            <button
              onClick={() => onNavigate(item.key)}
              className={
                'w-full text-left px-4 py-2 rounded-lg transition-colors ' +
                (current === item.key
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800')
              }
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
