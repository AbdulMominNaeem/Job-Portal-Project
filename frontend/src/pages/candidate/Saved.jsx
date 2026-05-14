import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import JobCard from '../../components/JobCard.jsx';

export default function CandidateSaved() {
  const [items, setItems] = useState([]);

  const refresh = () => api.get('/candidates/me/saved-jobs').then((r) => setItems(r.data));
  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Saved jobs</h1>
      {items.length === 0 && <div className="card p-8 text-center text-slate-500">No saved jobs.</div>}
      <div className="space-y-3">
        {items.map((s) => (
          <JobCard
            key={s.jobId}
            job={s.job}
            right={
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await api.delete(`/candidates/me/saved-jobs/${s.jobId}`);
                  refresh();
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            }
          />
        ))}
      </div>
    </div>
  );
}
