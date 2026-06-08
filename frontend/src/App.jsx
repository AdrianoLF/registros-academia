import { Navigate, Route, Routes } from 'react-router-dom';
import TopBar from './shared/TopBar';
import Reports from './reports/Reports';
import Students from './person/Students';
import Teachers from './person/Teachers';
import Plans from './plans/Plans';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/40 text-slate-800">
      <TopBar />
      <main className="mx-auto max-w-7xl p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/relatorios" replace />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/alunos" element={<Navigate to="/alunos/ativos" replace />} />
          <Route path="/alunos/:tab" element={<Students />} />
          <Route path="/professores" element={<Navigate to="/professores/ativos" replace />} />
          <Route path="/professores/:tab" element={<Teachers />} />
          <Route path="/planos" element={<Navigate to="/planos/ativos" replace />} />
          <Route path="/planos/:tab" element={<Plans />} />
          <Route path="*" element={<Navigate to="/relatorios" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
