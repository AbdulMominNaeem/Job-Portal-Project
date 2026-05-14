import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import JobCard from '../components/JobCard.jsx';
import Pagination from '../components/Pagination.jsx';

export default function JobsList() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  const filters = {
    q: params.get('q') || '',
    location: params.get('location') || '',
    company: params.get('company') || '',
    jobMode: params.get('jobMode') || '',
    jobType: params.get('jobType') || '',
    experienceLevel: params.get('experienceLevel') || '',
    category: params.get('category') || '',
    salaryMin: params.get('salaryMin') || '',
    salaryMax: params.get('salaryMax') || '',
    skill: params.get('skill') || '',
    postedSince: params.get('postedSince') || '',
    sort: params.get('sort') || 'newest',
    page: parseInt(params.get('page') || '1', 10),
  };

  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k !== 'page') next.set('page', '1');
    setParams(next);
  };

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api
      .get('/jobs', { params: { ...filters, pageSize: 12 } })
      .then((r) => !cancel && setData(r.data))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
      <aside className="card p-4 h-fit lg:sticky lg:top-20 space-y-4">
        <h2 className="font-semibold">Filters</h2>
        <div>
          <label className="label">Keyword</label>
          <input
            className="input"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Title, company, keyword"
          />
        </div>
        <div>
          <label className="label">Location</label>
          <input
            className="input"
            value={filters.location}
            onChange={(e) => setFilter('location', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Job mode</label>
          <select
            className="input"
            value={filters.jobMode}
            onChange={(e) => setFilter('jobMode', e.target.value)}
          >
            <option value="">Any</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </select>
        </div>
        <div>
          <label className="label">Job type</label>
          <select
            className="input"
            value={filters.jobType}
            onChange={(e) => setFilter('jobType', e.target.value)}
          >
            <option value="">Any</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="TEMPORARY">Temporary</option>
          </select>
        </div>
        <div>
          <label className="label">Experience</label>
          <select
            className="input"
            value={filters.experienceLevel}
            onChange={(e) => setFilter('experienceLevel', e.target.value)}
          >
            <option value="">Any</option>
            <option value="ENTRY">Entry</option>
            <option value="JUNIOR">Junior</option>
            <option value="MID">Mid</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <input
            className="input"
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            placeholder="e.g., Engineering"
          />
        </div>
        <div>
          <label className="label">Skill</label>
          <input
            className="input"
            value={filters.skill}
            onChange={(e) => setFilter('skill', e.target.value)}
            placeholder="e.g., React"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Salary min</label>
            <input
              className="input"
              type="number"
              value={filters.salaryMin}
              onChange={(e) => setFilter('salaryMin', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Salary max</label>
            <input
              className="input"
              type="number"
              value={filters.salaryMax}
              onChange={(e) => setFilter('salaryMax', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Date posted</label>
          <select
            className="input"
            value={filters.postedSince}
            onChange={(e) => setFilter('postedSince', e.target.value)}
          >
            <option value="">Any time</option>
            <option value="1">Last 24h</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
        <button
          onClick={() => setParams(new URLSearchParams())}
          className="btn-secondary w-full"
        >
          Reset filters
        </button>
      </aside>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">
            {loading ? 'Searching…' : `${data.total} jobs found`}
          </h1>
          <select
            className="input w-44"
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="salary_desc">Salary: high → low</option>
            <option value="salary_asc">Salary: low → high</option>
          </select>
        </div>
        {!loading && data.items.length === 0 && (
          <div className="card p-8 text-center text-slate-500">
            No jobs match your filters.
          </div>
        )}
        <div className="space-y-3">
          {data.items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <Pagination
          page={filters.page}
          totalPages={data.totalPages}
          onChange={(p) => setFilter('page', String(p))}
        />
      </section>
    </div>
  );
}
