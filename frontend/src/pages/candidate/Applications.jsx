import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import Pagination from '../../components/Pagination.jsx';

const statusColor = {
  APPLIED: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  INTERVIEW: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
};

export default function CandidateApplications() {
  const [data, setData] = useState({ items: [], totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);

  const refresh = () =>
    api.get('/applications/me', { params: { page, pageSize: 15 } }).then((r) => setData(r.data));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, [page]);

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    await api.post(`/applications/${id}/withdraw`);
    refresh();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My applications ({data.total})</h1>
      <div className="card divide-y">
        {data.items.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            You haven't applied to any jobs yet.{' '}
            <Link to="/jobs" className="text-brand-700">Browse jobs →</Link>
          </div>
        )}
        {data.items.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link to={`/jobs/${a.job.id}`} className="font-semibold hover:text-brand-700">
                {a.job.title}
              </Link>
              <div className="text-sm text-slate-600">{a.job.company?.name} · {a.job.location || '—'}</div>
              <div className="text-xs text-slate-400 mt-1">
                Applied {new Date(a.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${statusColor[a.status]}`}>{a.status.replace('_', ' ')}</span>
              {!['WITHDRAWN', 'HIRED', 'REJECTED'].includes(a.status) && (
                <button onClick={() => withdraw(a.id)} className="text-xs text-red-600 hover:underline">
                  Withdraw
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}
