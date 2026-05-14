import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiError } from '../api/client.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'employer' ? 'EMPLOYER' : 'CANDIDATE';

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: initialRole,
    companyName: '',
    jobTitle: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: form.role,
      };
      if (form.role === 'EMPLOYER') {
        if (form.companyName) payload.companyName = form.companyName;
        if (form.jobTitle) payload.jobTitle = form.jobTitle;
      }
      const user = await register(payload);
      navigate(user.role === 'EMPLOYER' ? '/employer' : '/candidate', { replace: true });
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h1 className="text-2xl font-semibold mb-1">Create account</h1>
      <p className="text-sm text-slate-600 mb-6">Join JobPortal in under a minute.</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {['CANDIDATE', 'EMPLOYER'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setForm({ ...form, role: r })}
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              form.role === r
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {r === 'CANDIDATE' ? "I'm looking for a job" : "I'm hiring"}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="text-xs text-slate-500 mt-1">At least 8 characters.</p>
        </div>
        {form.role === 'EMPLOYER' && (
          <>
            <div>
              <label className="label">Company name</label>
              <input
                className="input"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Your title</label>
              <input
                className="input"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />
            </div>
          </>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-4">
        Already have an account? <Link to="/login" className="text-brand-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
