import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';

const statusColor = {
  APPLIED: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  INTERVIEW: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
};

function TrendChart({ trend }) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const k = d.toISOString().slice(0, 10);
    days.push({ k, count: trend[k] || 0 });
  }
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="flex items-end gap-1 h-32">
      {days.map((d) => (
        <div key={d.k} className="flex-1" title={`${d.k}: ${d.count}`}>
          <div
            className="bg-brand-500 rounded-t"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: '2px' }}
          />
        </div>
      ))}
    </div>
  );
}

export default function EmployerDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/employers/me/stats').then((r) => setStats(r.data));
  }, []);

  if (!stats) return <div className="card p-8 text-slate-500">Loading…</div>;

  const byStatusMap = (stats.byStatus || []).reduce((acc, s) => {
    acc[s.status] = s._count;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employer dashboard</h1>
        <Link to="/employer/jobs/new" className="btn-primary">+ Post a job</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-sm text-slate-500">Total jobs</div>
          <div className="text-2xl font-bold">{stats.totalJobs}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">Open jobs</div>
          <div className="text-2xl font-bold">{stats.openJobs}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">Total applications</div>
          <div className="text-2xl font-bold">{stats.totalApplications}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">Interviews</div>
          <div className="text-2xl font-bold">{byStatusMap.INTERVIEW || 0}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Applications — last 30 days</h2>
          <TrendChart trend={stats.trend} />
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">Pipeline</h2>
          <ul className="space-y-2">
            {['APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'HIRED', 'REJECTED', 'WITHDRAWN'].map((s) => (
              <li key={s} className="flex items-center justify-between">
                <span className={`badge ${statusColor[s]}`}>{s.replace('_', ' ')}</span>
                <span className="text-sm font-semibold">{byStatusMap[s] || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Top jobs</h2>
        <ul className="divide-y">
          {stats.topJobs.map((j) => (
            <li key={j.id} className="py-3 flex justify-between items-center">
              <Link to={`/employer/jobs/${j.id}/applicants`} className="font-medium hover:text-brand-700">
                {j.title}
              </Link>
              <span className="text-sm text-slate-500">{j._count.applications} applicants</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Recent applications</h2>
        <ul className="divide-y">
          {stats.recentApps.map((a) => (
            <li key={a.id} className="py-3 flex justify-between items-center gap-3">
              <div>
                <div className="font-medium">{a.candidate.fullName}</div>
                <div className="text-xs text-slate-500">{a.job.title}</div>
              </div>
              <span className={`badge ${statusColor[a.status]}`}>{a.status.replace('_', ' ')}</span>
            </li>
          ))}
          {stats.recentApps.length === 0 && (
            <li className="py-3 text-sm text-slate-500">No applications yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
