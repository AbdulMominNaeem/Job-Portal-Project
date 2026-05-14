import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';

const statusBadge = {
  APPLIED: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  INTERVIEW: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
};

export default function CandidateDashboard() {
  const [profile, setProfile] = useState(null);
  const [apps, setApps] = useState({ items: [], total: 0 });
  const [saved, setSaved] = useState([]);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    api.get('/candidates/me').then((r) => setProfile(r.data));
    api.get('/applications/me', { params: { pageSize: 5 } }).then((r) => setApps(r.data));
    api.get('/candidates/me/saved-jobs').then((r) => setSaved(r.data.slice(0, 4)));
    api.get('/jobs', { params: { pageSize: 5 } }).then((r) => setRecommended(r.data.items));
  }, []);

  const stats = (apps.items || []).reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="card p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {profile?.fullName || ''} 👋</h1>
          <p className="text-slate-600 text-sm">Here's a snapshot of your job search.</p>
        </div>
        <Link to="/candidate/profile" className="btn-secondary">Edit profile</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Applied', apps.total],
          ['Under review', stats.UNDER_REVIEW || 0],
          ['Interviews', stats.INTERVIEW || 0],
          ['Saved', saved.length],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <div className="text-sm text-slate-500">{k}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Recent applications</h2>
            <Link to="/candidate/applications" className="text-sm text-brand-700 hover:underline">View all</Link>
          </div>
          {apps.items.length === 0 ? (
            <p className="text-sm text-slate-500">No applications yet. <Link to="/jobs" className="text-brand-700">Browse jobs</Link>.</p>
          ) : (
            <ul className="divide-y">
              {apps.items.slice(0, 5).map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/jobs/${a.job.id}`} className="font-medium hover:text-brand-700 truncate block">
                      {a.job.title}
                    </Link>
                    <div className="text-xs text-slate-500">{a.job.company?.name}</div>
                  </div>
                  <span className={`badge ${statusBadge[a.status] || 'bg-slate-100'}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Saved jobs</h2>
            <Link to="/candidate/saved" className="text-sm text-brand-700 hover:underline">View all</Link>
          </div>
          {saved.length === 0 ? (
            <p className="text-sm text-slate-500">No saved jobs yet.</p>
          ) : (
            <ul className="divide-y">
              {saved.map((s) => (
                <li key={s.jobId} className="py-3">
                  <Link to={`/jobs/${s.job.id}`} className="font-medium hover:text-brand-700">
                    {s.job.title}
                  </Link>
                  <div className="text-xs text-slate-500">{s.job.company?.name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Recommended jobs</h2>
        <ul className="divide-y">
          {recommended.map((j) => (
            <li key={j.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <Link to={`/jobs/${j.id}`} className="font-medium hover:text-brand-700">{j.title}</Link>
                <div className="text-xs text-slate-500">{j.company?.name} · {j.location}</div>
              </div>
              <span className="badge bg-slate-100 text-slate-700">{j.jobMode}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
