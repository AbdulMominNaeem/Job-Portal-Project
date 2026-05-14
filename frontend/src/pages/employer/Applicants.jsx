import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import Pagination from '../../components/Pagination.jsx';

const statusOptions = ['APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'REJECTED', 'HIRED'];

const statusColor = {
  APPLIED: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  INTERVIEW: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
};

export default function EmployerApplicants() {
  const { id } = useParams();
  const [data, setData] = useState({ items: [], totalPages: 1, total: 0 });
  const [job, setJob] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const refresh = () =>
    api
      .get(`/applications/jobs/${id}`, { params: { page, pageSize: 15, status: status || undefined, q: q || undefined } })
      .then((r) => setData(r.data));

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data));
  }, [id]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, [id, page, status, q]);

  const update = async (appId, newStatus) => {
    await api.patch(`/applications/${appId}/status`, { status: newStatus });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div>
        <Link to="/employer/jobs" className="text-sm text-brand-700 hover:underline">← Back to my jobs</Link>
        <h1 className="text-2xl font-semibold">{job?.title || 'Applicants'}</h1>
        <p className="text-sm text-slate-500">{data.total} applicants</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="Search by name, headline, location"
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />
        <select className="input w-44" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="card divide-y">
        {data.items.length === 0 && (
          <div className="p-8 text-center text-slate-500">No applicants match.</div>
        )}
        {data.items.map((a) => (
          <div key={a.id} className="p-4 flex items-start gap-4">
            {a.candidate.profilePic ? (
              <img src={a.candidate.profilePic} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-lg">
                {a.candidate.fullName?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="font-semibold">{a.candidate.fullName}</div>
                <span className={`badge ${statusColor[a.status]}`}>{a.status.replace('_', ' ')}</span>
              </div>
              <div className="text-sm text-slate-600">{a.candidate.headline || '—'}</div>
              <div className="text-xs text-slate-400 mt-1">
                {a.candidate.location || '—'} · Applied {new Date(a.createdAt).toLocaleDateString()}
              </div>
              {a.candidate.candidateSkills?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.candidate.candidateSkills.slice(0, 8).map((cs) => (
                    <span key={cs.skillId} className="badge bg-brand-50 text-brand-700">{cs.skill.name}</span>
                  ))}
                </div>
              )}
              {a.coverLetter && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-slate-600 hover:text-slate-900">Cover letter</summary>
                  <p className="mt-1 whitespace-pre-wrap text-slate-700">{a.coverLetter}</p>
                </details>
              )}
            </div>
            <div className="flex flex-col gap-2 items-stretch">
              <select
                className="input text-xs"
                value={a.status}
                onChange={(e) => update(a.id, e.target.value)}
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              {(a.resumeUrl || a.candidate.resumeUrl) && (
                <a
                  href={a.resumeUrl || a.candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn-secondary text-xs"
                >
                  Resume
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}
