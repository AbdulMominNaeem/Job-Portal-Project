import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import Pagination from '../../components/Pagination.jsx';

export default function AdminJobs() {
  const [data, setData] = useState({ items: [], totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const refresh = () =>
    api.get('/admin/jobs', { params: { page, pageSize: 20, status: status || undefined, q: q || undefined } })
      .then((r) => setData(r.data));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, [page, status, q]);

  const moderate = async (id, action) => {
    await api.post(`/admin/jobs/${id}/moderate`, { action });
    refresh();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Job moderation</h1>
      <div className="card p-4 flex flex-wrap gap-3">
        <input className="input flex-1 min-w-[200px]" placeholder="Search by title" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <select className="input w-44" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>
      <div className="card divide-y">
        {data.items.map((j) => (
          <div key={j.id} className="p-4 flex justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/jobs/${j.id}`} className="font-semibold hover:text-brand-700">{j.title}</Link>
              <div className="text-sm text-slate-600">{j.company?.name} · {j.location || '—'}</div>
              <div className="text-xs text-slate-400 mt-1">
                <span className="badge bg-slate-100 text-slate-700">{j.status}</span> · {j._count?.applications ?? 0} applicants
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => moderate(j.id, 'close')} className="btn-secondary text-xs">Close</button>
              <button onClick={() => moderate(j.id, 'remove')} className="btn-danger text-xs">Remove</button>
              {j.status === 'REMOVED' && (
                <button onClick={() => moderate(j.id, 'restore')} className="btn-secondary text-xs">Restore</button>
              )}
            </div>
          </div>
        ))}
        {data.items.length === 0 && <div className="p-8 text-center text-slate-500">No jobs.</div>}
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}
