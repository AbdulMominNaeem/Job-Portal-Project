import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import Pagination from '../../components/Pagination.jsx';

export default function EmployerJobs() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  const refresh = () =>
    api.get('/jobs/mine', { params: { page, pageSize: 15 } }).then((r) => setData(r.data));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, [page]);

  const remove = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    await api.delete(`/jobs/${id}`);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My job postings ({data.total})</h1>
        <Link to="/employer/jobs/new" className="btn-primary">+ Post a job</Link>
      </div>
      <div className="card divide-y">
        {data.items.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            You haven't posted any jobs yet.
          </div>
        )}
        {data.items.map((j) => (
          <div key={j.id} className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/jobs/${j.id}`} className="font-semibold hover:text-brand-700">{j.title}</Link>
              <div className="text-sm text-slate-600">{j.company?.name} · {j.location || '—'}</div>
              <div className="text-xs text-slate-400 mt-1">
                <span className="badge bg-slate-100 text-slate-700">{j.status}</span>
                {' · '}{j._count?.applications ?? 0} applicants · {j.views ?? 0} views
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/employer/jobs/${j.id}/applicants`} className="btn-secondary text-xs">Applicants</Link>
              <Link to={`/employer/jobs/${j.id}/edit`} className="btn-secondary text-xs">Edit</Link>
              <button onClick={() => remove(j.id)} className="btn-danger text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}
