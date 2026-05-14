import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import Pagination from '../../components/Pagination.jsx';

export default function AdminUsers() {
  const [data, setData] = useState({ items: [], totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');

  const refresh = () =>
    api.get('/admin/users', { params: { page, pageSize: 20, role: role || undefined, q: q || undefined } })
      .then((r) => setData(r.data));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, [page, role, q]);

  const toggleActive = async (u) => {
    await api.patch(`/admin/users/${u.id}/active`, { isActive: !u.isActive });
    refresh();
  };
  const remove = async (u) => {
    if (!window.confirm(`Soft-delete ${u.email}?`)) return;
    await api.delete(`/admin/users/${u.id}`);
    refresh();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <div className="card p-4 flex flex-wrap gap-3">
        <input className="input flex-1 min-w-[200px]" placeholder="Search by email" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <select className="input w-44" value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }}>
          <option value="">All roles</option>
          <option value="CANDIDATE">Candidates</option>
          <option value="EMPLOYER">Employers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Profile</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.email}</td>
                <td className="p-3"><span className="badge bg-slate-100 text-slate-700">{u.role}</span></td>
                <td className="p-3 text-slate-600">{u.candidate?.fullName || u.employer?.fullName || '—'}{u.employer?.company?.name ? ` (${u.employer.company.name})` : ''}</td>
                <td className="p-3">{u.isActive ? '✅' : '⛔'}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => toggleActive(u)} className="btn-secondary text-xs">{u.isActive ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => remove(u)} className="btn-danger text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}
