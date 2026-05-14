import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data));
  }, []);

  if (!stats) return <div className="card p-8 text-slate-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          ['Users', stats.users],
          ['Candidates', stats.candidates],
          ['Employers', stats.employers],
          ['Companies', stats.companies],
          ['Jobs', stats.jobs],
          ['Applications', stats.applications],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <div className="text-xs text-slate-500">{k}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Recent users</h2>
            <Link to="/admin/users" className="text-sm text-brand-700 hover:underline">Manage</Link>
          </div>
          <ul className="divide-y">
            {stats.recentUsers.map((u) => (
              <li key={u.id} className="py-2 flex justify-between text-sm">
                <span>{u.email}</span>
                <span className="badge bg-slate-100 text-slate-700">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Recent jobs</h2>
            <Link to="/admin/jobs" className="text-sm text-brand-700 hover:underline">Manage</Link>
          </div>
          <ul className="divide-y">
            {stats.recentJobs.map((j) => (
              <li key={j.id} className="py-2 text-sm">
                <Link to={`/jobs/${j.id}`} className="font-medium hover:text-brand-700">{j.title}</Link>
                <div className="text-xs text-slate-500">{j.company?.name} · {j.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
