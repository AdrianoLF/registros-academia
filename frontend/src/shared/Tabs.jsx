function Tabs({ tabs, active, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-slate-200/60 p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={[
            'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
            active === tab.key
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
