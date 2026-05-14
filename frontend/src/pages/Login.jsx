import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiError } from '../api/client.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      const dest =
        location.state?.from?.pathname ||
        (user.role === 'CANDIDATE'
          ? '/candidate'
          : user.role === 'EMPLOYER'
          ? '/employer'
          : '/admin');
      navigate(dest, { replace: true });
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
      <p className="text-sm text-slate-600 mb-6">Welcome back to JobPortal.</p>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}
      <form onSubmit={submit} className="space-y-4">
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
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button disabled={busy} className="btn-primary w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-4">
        New here? <Link to="/register" className="text-brand-700 hover:underline">Create an account</Link>
      </p>
      <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Demo logins (password <code>Passw0rd!</code>):
        <ul className="list-disc ml-5 mt-1">
          <li>candidate1@jobportal.test</li>
          <li>employer1@jobportal.test</li>
          <li>admin@jobportal.test</li>
        </ul>
      </div>
    </div>
  );
}
