import { useEffect, useRef, useState } from 'react';
import { api, apiError } from '../../api/client.js';

export default function EmployerCompany() {
  const [employer, setEmployer] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const logoRef = useRef();

  const refresh = async () => {
    const { data } = await api.get('/employers/me');
    setEmployer(data);
    setForm({
      name: data.company?.name || '',
      description: data.company?.description || '',
      website: data.company?.website || '',
      industry: data.company?.industry || '',
      size: data.company?.size || '',
      location: data.company?.location || '',
    });
  };

  useEffect(() => { refresh(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.post('/employers/me/company', form);
      setMsg('Company saved.');
      refresh();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const uploadLogo = async () => {
    const file = logoRef.current?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/employers/me/company/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      refresh();
    } catch (e) {
      setError(apiError(e));
    }
  };

  if (!employer) return <div className="card p-8 text-slate-500">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Company profile</h1>
      {msg && <div className="rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-4">
          {employer.company?.logoUrl ? (
            <img src={employer.company.logoUrl} alt="" className="w-20 h-20 rounded-lg object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-3xl">
              {employer.company?.name?.[0] || '?'}
            </div>
          )}
          <div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
            <button onClick={() => logoRef.current.click()} className="btn-secondary text-sm" disabled={!employer.company}>
              {employer.company?.logoUrl ? 'Replace logo' : 'Upload logo'}
            </button>
            {!employer.company && <div className="text-xs text-slate-500 mt-1">Save your company below first.</div>}
          </div>
        </div>

        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Company name</label>
            <input className="input" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-[120px]" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input" value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div>
            <label className="label">Size</label>
            <input className="input" placeholder="e.g., 50-200" value={form.size || ''} onChange={(e) => setForm({ ...form, size: e.target.value })} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary">Save company</button>
          </div>
        </form>
      </div>
    </div>
  );
}
