import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDailyCheckInsReport } from './api';

function dayLabel(isoDate) {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

function WeeklyCheckInsChart({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDailyCheckInsReport()
      .then((report) => {
        if (!cancelled) {
          setData(report);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return <p className="text-sm text-slate-500">Carregando relatório...</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-600">Não foi possível carregar o relatório.</p>;
  }

  const chartData = data.days.map((day) => ({
    ...day,
    label: dayLabel(day.date),
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Total na última semana:{' '}
        <strong className="text-slate-800">{data.total}</strong>
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [value, 'Check-ins']}
            labelFormatter={(label) => `Dia ${label}`}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklyCheckInsChart;
