import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Companies() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get('/companies', { params: { q } }).then((r) => {
        setItems(r.data);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4">
        <h1 className="text-xl font-semibold">Companies</h1>
        <input
          className="input max-w-xs"
          placeholder="Search by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {loading && <div className="card p-8 text-center text-slate-500">Loading…</div>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-center gap-3">
              {c.logoUrl ? (
                <img src={c.logoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xl">
                  {c.name[0]}
                </div>
              )}
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-slate-500">{c.industry || '—'} · {c.location || '—'}</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3 line-clamp-3">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
