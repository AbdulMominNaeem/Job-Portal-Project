import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            Find the role that fits your next chapter.
          </h1>
          <p className="mt-3 text-brand-100">
            Search thousands of jobs from companies hiring right now. Apply in one click and track every conversation.
          </p>
          <form onSubmit={search} className="mt-6 grid grid-cols-1 sm:grid-cols-[2fr,1fr,auto] gap-2 bg-white p-2 rounded-xl shadow">
            <input
              className="input border-0 shadow-none text-slate-900"
              placeholder="Job title, company, or keyword"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input
              className="input border-0 shadow-none text-slate-900"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button className="btn-primary">Search</button>
          </form>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {[
          { title: 'For Candidates', body: 'Browse, save, and apply. Track every application status from one dashboard.', cta: 'Sign up free', to: '/register?role=candidate' },
          { title: 'For Employers', body: 'Post jobs, review applicants, and manage hiring pipelines.', cta: 'Hire talent', to: '/register?role=employer' },
          { title: 'Modern stack', body: 'Built with React, Node.js, MySQL, and JWT auth — production-ready.', cta: 'View API docs', to: '/api/docs' },
        ].map((c) => (
          <div key={c.title} className="card p-6">
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p className="text-sm text-slate-600 mt-2">{c.body}</p>
            <Link to={c.to} className="btn-primary mt-4 w-fit">{c.cta}</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
