import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, apiError } from '../../api/client.js';

const empty = {
  title: '',
  description: '',
  category: '',
  location: '',
  jobMode: 'ONSITE',
  jobType: 'FULL_TIME',
  experienceLevel: 'MID',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  status: 'PUBLISHED',
  applicationDeadline: '',
  skills: [],
};

export default function EmployerJobForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get(`/jobs/${id}`).then((r) => {
      const j = r.data;
      setForm({
        title: j.title,
        description: j.description,
        category: j.category || '',
        location: j.location || '',
        jobMode: j.jobMode,
        jobType: j.jobType,
        experienceLevel: j.experienceLevel,
        salaryMin: j.salaryMin || '',
        salaryMax: j.salaryMax || '',
        currency: j.currency || 'USD',
        status: j.status,
        applicationDeadline: j.applicationDeadline ? j.applicationDeadline.slice(0, 10) : '',
        skills: j.jobSkills.map((js) => js.skill.name),
      });
    });
  }, [id, editing]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        applicationDeadline: form.applicationDeadline || undefined,
      };
      if (editing) {
        await api.put(`/jobs/${id}`, payload);
      } else {
        const { data } = await api.post('/jobs', payload);
        return navigate(`/employer/jobs/${data.id}/applicants`);
      }
      navigate('/employer/jobs');
    } catch (e) {
      const details = e?.response?.data?.details;
      if (details?.length) {
        setError(details.map((d) => `${d.path || 'Field'}: ${d.message}`).join(' • '));
      } else {
        setError(apiError(e));
      }
    } finally {
      setBusy(false);
    }
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (form.skills.includes(v)) return;
    setForm({ ...form, skills: [...form.skills, v] });
    setSkillInput('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{editing ? 'Edit job' : 'Post a job'}</h1>
      {error && <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm mb-4">{error}</div>}
      <form onSubmit={submit} className="card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description <span className="text-slate-400 font-normal">(min 20 characters)</span></label>
          <textarea className="input min-h-[200px]" required minLength={20} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="label">Category</label>
          <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div>
          <label className="label">Job mode</label>
          <select className="input" value={form.jobMode} onChange={(e) => setForm({ ...form, jobMode: e.target.value })}>
            <option value="ONSITE">On-site</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="label">Job type</label>
          <select className="input" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="TEMPORARY">Temporary</option>
          </select>
        </div>
        <div>
          <label className="label">Experience level</label>
          <select className="input" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
            <option value="ENTRY">Entry</option>
            <option value="JUNIOR">Junior</option>
            <option value="MID">Mid</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div>
          <label className="label">Salary min</label>
          <input className="input" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
        </div>
        <div>
          <label className="label">Salary max</label>
          <input className="input" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
        </div>
        <div>
          <label className="label">Currency</label>
          <input className="input" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
        </div>
        <div>
          <label className="label">Application deadline</label>
          <input className="input" type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Required skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.skills.map((s, i) => (
              <span key={i} className="badge bg-brand-50 text-brand-700">
                {s}
                <button type="button" className="ml-1 text-slate-400 hover:text-red-500" onClick={() => setForm({ ...form, skills: form.skills.filter((_, j) => j !== i) })}>×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g., React" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <button type="button" onClick={addSkill} className="btn-secondary">Add skill</button>
          </div>
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={() => navigate('/employer/jobs')} className="btn-secondary">Cancel</button>
          <button disabled={busy} className="btn-primary">
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Publish job'}
          </button>
        </div>
      </form>
    </div>
  );
}
