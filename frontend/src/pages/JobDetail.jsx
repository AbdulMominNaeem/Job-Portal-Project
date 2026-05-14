import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, apiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data)).finally(() => setLoading(false));
    if (user?.role === 'CANDIDATE') {
      api.get('/candidates/me/saved-jobs').then((r) => {
        setSaved(r.data.some((s) => s.jobId === Number(id)));
      });
    }
  }, [id, user]);

  const apply = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      await api.post(`/applications/jobs/${id}/apply`, { coverLetter });
      setMsg('Application submitted!');
      setShowApply(false);
    } catch (e) {
      setMsg(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = async () => {
    if (saved) {
      await api.delete(`/candidates/me/saved-jobs/${id}`);
      setSaved(false);
    } else {
      await api.post(`/candidates/me/saved-jobs/${id}`);
      setSaved(true);
    }
  };

  if (loading) return <div className="card p-8 text-center text-slate-500">Loading…</div>;
  if (!job) return <div className="card p-8 text-center text-slate-500">Job not found.</div>;

  const fmtSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const c = job.currency || 'USD';
    if (job.salaryMin && job.salaryMax) return `${c} ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin) return `${c} ${job.salaryMin.toLocaleString()}+`;
    return `${c} up to ${job.salaryMax.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <div className="flex items-start gap-4">
            {job.company?.logoUrl ? (
              <img src={job.company.logoUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
                {job.company?.name?.[0]}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <div className="text-slate-600">{job.company?.name} · {job.location || '—'}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-slate-100 text-slate-700">{job.jobMode}</span>
                <span className="badge bg-slate-100 text-slate-700">{job.jobType?.replace('_', ' ')}</span>
                <span className="badge bg-slate-100 text-slate-700">{job.experienceLevel}</span>
                {fmtSalary() && <span className="badge bg-emerald-50 text-emerald-700">{fmtSalary()}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">About this role</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">{job.description}</div>
        </div>

        {job.jobSkills?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold mb-3">Required skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.jobSkills.map((js) => (
                <span key={js.skill.id} className="badge bg-brand-50 text-brand-700">
                  {js.skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-3">
        <div className="card p-6 lg:sticky lg:top-20">
          {msg && <div className="mb-3 rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">{msg}</div>}
          {!user && (
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              Login to apply
            </button>
          )}
          {user?.role === 'CANDIDATE' && (
            <>
              <button
                disabled={busy}
                onClick={() => setShowApply((v) => !v)}
                className="btn-primary w-full"
              >
                {showApply ? 'Cancel' : 'Apply now'}
              </button>
              <button onClick={toggleSave} className="btn-secondary w-full mt-2">
                {saved ? 'Saved ✓' : 'Save job'}
              </button>
              {showApply && (
                <form onSubmit={apply} className="mt-4 space-y-3">
                  <label className="label">Cover letter (optional)</label>
                  <textarea
                    className="input min-h-[160px]"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Why you're a great fit…"
                  />
                  <button disabled={busy} className="btn-primary w-full">
                    {busy ? 'Submitting…' : 'Submit application'}
                  </button>
                  <p className="text-xs text-slate-500">
                    Your resume and profile are sent automatically.
                  </p>
                </form>
              )}
            </>
          )}
          {user?.role === 'EMPLOYER' && (
            <div className="text-sm text-slate-600">
              You're signed in as an employer. Switch to a candidate account to apply.
            </div>
          )}
          <div className="mt-4 text-xs text-slate-500 space-y-1">
            <div>Applicants: {job._count?.applications ?? 0}</div>
            <div>Posted: {new Date(job.createdAt).toLocaleDateString()}</div>
            {job.applicationDeadline && (
              <div>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</div>
            )}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">{job.company?.name}</h3>
          <p className="text-sm text-slate-600 mt-2 line-clamp-5">{job.company?.description}</p>
          {job.company?.website && (
            <a
              href={job.company.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand-700 hover:underline mt-2 inline-block"
            >
              Visit website
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
