import { useState } from 'react';
import TopBar from './shared/TopBar';
import Reports from './reports/Reports';
import Students from './person/Students';
import Teachers from './person/Teachers';
import Plans from './plans/Plans';

const pages = {
  reports: Reports,
  students: Students,
  teachers: Teachers,
  plans: Plans,
};

function App() {
  const [page, setPage] = useState('reports');
  const Page = pages[page];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/40 text-slate-800">
      <TopBar current={page} onNavigate={setPage} />
      <main className="mx-auto max-w-7xl p-8">
        <Page />
      </main>
    </div>
  );
}

export default App;
