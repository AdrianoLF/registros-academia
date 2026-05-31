import { useState } from 'react';
import Sidebar from './shared/Sidebar';
import Reports from './reports/Reports';
import Students from './person/Students';
import Teachers from './person/Teachers';
import Plans from './plans/Plans';
import Providers from './providers/Providers';

const pages = {
  reports: Reports,
  students: Students,
  teachers: Teachers,
  plans: Plans,
  providers: Providers,
};

function App() {
  const [page, setPage] = useState('reports');
  const Page = pages[page];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 p-8">
        <Page />
      </main>
    </div>
  );
}

export default App;
