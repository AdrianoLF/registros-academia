import { useCallback, useState } from 'react';
import { getPersonsPage } from '../person/api';
import { createCheckIn, checkInReasonLabel } from '../person/checkinApi';
import WeeklyCheckInsChart from '../reports/WeeklyCheckInsChart';
import { useError } from '../shared/ErrorContext';
import PaginatedList from '../shared/PaginatedList';
import { usePaginatedList } from '../shared/usePaginatedList';

function Home() {
  const showError = useError();
  const [selected, setSelected] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [reportRefresh, setReportRefresh] = useState(0);

  const loadStudents = useCallback(
    async (params) => {
      try {
        return await getPersonsPage({
          role: 'STUDENT',
          enabled: true,
          ...params,
        });
      } catch (e) {
        showError(e.message);
        return { items: [], total: 0, totalPages: 0, page: params.page, limit: params.limit };
      }
    },
    [showError]
  );

  const {
    items: students,
    total,
    page,
    totalPages,
    searchInput,
    setSearchInput,
    setPage,
    loading,
  } = usePaginatedList(loadStudents);

  async function handleCheckIn(e) {
    e.preventDefault();
    if (!selected) {
      return;
    }
    setCheckingIn(true);
    setFeedback(null);
    try {
      await createCheckIn(selected.id);
      setFeedback({ ok: true, message: `Check-in de ${selected.name} realizado!` });
      setReportRefresh((value) => value + 1);
    } catch (err) {
      setFeedback({ ok: false, message: checkInReasonLabel(err.message) });
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Home</h1>

      <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Check-in</h2>

        <PaginatedList
          items={students}
          total={total}
          page={page}
          totalPages={totalPages}
          search={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value);
            setSelected(null);
            setFeedback(null);
          }}
          onPageChange={setPage}
          loading={loading}
          empty="Nenhum aluno ativo encontrado."
          searchPlaceholder="Buscar aluno por nome, e-mail ou CPF..."
          renderItem={(student) => (
            <li key={student.id} className="px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setSelected(student);
                  setFeedback(null);
                }}
                className={[
                  'w-full text-left rounded-lg -m-2 p-2 transition-colors',
                  selected?.id === student.id
                    ? 'bg-indigo-100 ring-1 ring-indigo-300'
                    : 'hover:bg-indigo-50/80',
                ].join(' ')}
              >
                <div className="font-medium text-slate-800">{student.name}</div>
                <div className="text-sm text-slate-500 mt-0.5">{student.cpf}</div>
              </button>
            </li>
          )}
        />

        <form onSubmit={handleCheckIn} className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={checkingIn || !selected}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {checkingIn ? 'Registrando...' : 'Fazer check-in'}
          </button>
          {selected && (
            <span className="text-sm text-slate-600">
              Selecionado: <strong>{selected.name}</strong>
            </span>
          )}
          {feedback && (
            <span className={feedback.ok ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
              {feedback.message}
            </span>
          )}
        </form>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Check-ins na última semana</h2>
        <WeeklyCheckInsChart refreshKey={reportRefresh} />
      </section>
      </div>
    </div>
  );
}

export default Home;
