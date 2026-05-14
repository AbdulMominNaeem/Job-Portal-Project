import { useEffect, useRef, useState } from 'react';
import { api, apiError } from '../../api/client.js';

export default function CandidateProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [edu, setEdu] = useState({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
  const [exp, setExp] = useState({ company: '', title: '', startDate: '', endDate: '', description: '' });
  const [cert, setCert] = useState({ name: '', issuer: '', issuedAt: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const resumeRef = useRef();
  const avatarRef = useRef();

  const refresh = async () => {
    const { data } = await api.get('/candidates/me');
    setProfile(data);
    setForm({
      fullName: data.fullName || '',
      headline: data.headline || '',
      bio: data.bio || '',
      phone: data.phone || '',
      location: data.location || '',
      websiteUrl: data.websiteUrl || '',
      linkedinUrl: data.linkedinUrl || '',
      githubUrl: data.githubUrl || '',
    });
    setSkills(data.candidateSkills.map((cs) => ({ name: cs.skill.name, level: cs.level || '' })));
  };

  useEffect(() => {
    refresh();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.put('/candidates/me', form);
      setMsg('Profile saved.');
      refresh();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const upload = async (ref, endpoint) => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Upload complete.');
      refresh();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const addSkill = () => {
    const name = skillInput.trim();
    if (!name) return;
    if (skills.find((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSkills([...skills, { name, level: '' }]);
    setSkillInput('');
  };

  const saveSkills = async () => {
    try {
      await api.put('/candidates/me/skills', { skills });
      setMsg('Skills updated.');
      refresh();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const addEducation = async (e) => {
    e.preventDefault();
    await api.post('/candidates/me/education', edu);
    setEdu({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
    refresh();
  };

  const addExperience = async (e) => {
    e.preventDefault();
    await api.post('/candidates/me/experience', exp);
    setExp({ company: '', title: '', startDate: '', endDate: '', description: '' });
    refresh();
  };

  const addCertification = async (e) => {
    e.preventDefault();
    await api.post('/candidates/me/certifications', cert);
    setCert({ name: '', issuer: '', issuedAt: '' });
    refresh();
  };

  if (!profile) return <div className="card p-6 text-slate-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My profile</h1>
      {msg && <div className="rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Basics</h2>
        <div className="flex items-start gap-6 mb-6">
          <div>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-400">
                {profile.fullName?.[0]}
              </div>
            )}
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={() => upload(avatarRef, '/candidates/me/avatar')} />
            <button onClick={() => avatarRef.current.click()} className="btn-secondary mt-2 text-xs">
              Change photo
            </button>
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-600 mb-1">Resume</div>
            {profile.resumeUrl ? (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline text-sm break-all">
                {profile.resumeUrl}
              </a>
            ) : (
              <div className="text-sm text-slate-500">No resume uploaded.</div>
            )}
            <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={() => upload(resumeRef, '/candidates/me/resume')} />
            <button onClick={() => resumeRef.current.click()} className="btn-secondary mt-2 text-xs">
              {profile.resumeUrl ? 'Replace resume' : 'Upload resume'}
            </button>
          </div>
        </div>

        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['fullName', 'Full name'],
            ['headline', 'Headline'],
            ['phone', 'Phone'],
            ['location', 'Location'],
            ['websiteUrl', 'Website URL'],
            ['linkedinUrl', 'LinkedIn URL'],
            ['githubUrl', 'GitHub URL'],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="label">{label}</label>
              <input className="input" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="label">Bio</label>
            <textarea className="input min-h-[120px]" value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary">Save profile</button>
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((s, i) => (
            <span key={i} className="badge bg-brand-50 text-brand-700">
              {s.name}
              <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="ml-1 text-slate-400 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g., React" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
          <button onClick={addSkill} className="btn-secondary">Add</button>
          <button onClick={saveSkills} className="btn-primary">Save</button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Education</h2>
        <ul className="divide-y mb-4">
          {profile.educations.map((ed) => (
            <li key={ed.id} className="py-3 flex justify-between gap-3">
              <div>
                <div className="font-medium">{ed.school}</div>
                <div className="text-sm text-slate-600">{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' · ')}</div>
                <div className="text-xs text-slate-400">
                  {ed.startDate ? new Date(ed.startDate).getFullYear() : ''} – {ed.endDate ? new Date(ed.endDate).getFullYear() : 'Present'}
                </div>
              </div>
              <button onClick={async () => { await api.delete(`/candidates/me/education/${ed.id}`); refresh(); }} className="text-xs text-red-600">Remove</button>
            </li>
          ))}
        </ul>
        <form onSubmit={addEducation} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="input" placeholder="School" required value={edu.school} onChange={(e) => setEdu({ ...edu, school: e.target.value })} />
          <input className="input" placeholder="Degree" value={edu.degree} onChange={(e) => setEdu({ ...edu, degree: e.target.value })} />
          <input className="input" placeholder="Field of study" value={edu.fieldOfStudy} onChange={(e) => setEdu({ ...edu, fieldOfStudy: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" type="date" value={edu.startDate} onChange={(e) => setEdu({ ...edu, startDate: e.target.value })} />
            <input className="input" type="date" value={edu.endDate} onChange={(e) => setEdu({ ...edu, endDate: e.target.value })} />
          </div>
          <button className="btn-primary sm:col-span-2 w-fit">Add education</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Experience</h2>
        <ul className="divide-y mb-4">
          {profile.experiences.map((ex) => (
            <li key={ex.id} className="py-3 flex justify-between gap-3">
              <div>
                <div className="font-medium">{ex.title} <span className="text-slate-500">@ {ex.company}</span></div>
                <div className="text-xs text-slate-400">
                  {ex.startDate ? new Date(ex.startDate).toLocaleDateString() : ''} – {ex.endDate ? new Date(ex.endDate).toLocaleDateString() : 'Present'}
                </div>
                {ex.description && <div className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{ex.description}</div>}
              </div>
              <button onClick={async () => { await api.delete(`/candidates/me/experience/${ex.id}`); refresh(); }} className="text-xs text-red-600">Remove</button>
            </li>
          ))}
        </ul>
        <form onSubmit={addExperience} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="input" placeholder="Company" required value={exp.company} onChange={(e) => setExp({ ...exp, company: e.target.value })} />
          <input className="input" placeholder="Title" required value={exp.title} onChange={(e) => setExp({ ...exp, title: e.target.value })} />
          <input className="input" type="date" value={exp.startDate} onChange={(e) => setExp({ ...exp, startDate: e.target.value })} />
          <input className="input" type="date" value={exp.endDate} onChange={(e) => setExp({ ...exp, endDate: e.target.value })} />
          <textarea className="input sm:col-span-2 min-h-[80px]" placeholder="Description" value={exp.description} onChange={(e) => setExp({ ...exp, description: e.target.value })} />
          <button className="btn-primary sm:col-span-2 w-fit">Add experience</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Certifications</h2>
        <ul className="divide-y mb-4">
          {profile.certifications.map((c) => (
            <li key={c.id} className="py-3 flex justify-between gap-3">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-slate-600">{c.issuer}</div>
              </div>
              <button onClick={async () => { await api.delete(`/candidates/me/certifications/${c.id}`); refresh(); }} className="text-xs text-red-600">Remove</button>
            </li>
          ))}
        </ul>
        <form onSubmit={addCertification} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input className="input" placeholder="Name" required value={cert.name} onChange={(e) => setCert({ ...cert, name: e.target.value })} />
          <input className="input" placeholder="Issuer" value={cert.issuer} onChange={(e) => setCert({ ...cert, issuer: e.target.value })} />
          <input className="input" type="date" value={cert.issuedAt} onChange={(e) => setCert({ ...cert, issuedAt: e.target.value })} />
          <button className="btn-primary sm:col-span-3 w-fit">Add certification</button>
        </form>
      </div>
    </div>
  );
}
