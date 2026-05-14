import { Link } from 'react-router-dom';

const fmtSalary = (job) => {
  if (!job.salaryMin && !job.salaryMax) return null;
  const c = job.currency || 'USD';
  const f = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
  if (job.salaryMin && job.salaryMax) return `${c} ${f(job.salaryMin)}–${f(job.salaryMax)}`;
  if (job.salaryMin) return `${c} ${f(job.salaryMin)}+`;
  return `${c} up to ${f(job.salaryMax)}`;
};

const modeLabel = { REMOTE: 'Remote', ONSITE: 'On-site', HYBRID: 'Hybrid' };
const typeLabel = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time', CONTRACT: 'Contract',
  INTERNSHIP: 'Internship', TEMPORARY: 'Temporary',
};

export default function JobCard({ job, right }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card p-5 block hover:border-brand-500 transition-colors"
    >
      <div className="flex items-start gap-4">
        {job.company?.logoUrl ? (
          <img
            src={job.company.logoUrl}
            alt=""
            className="w-12 h-12 rounded-lg object-cover bg-slate-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xl">
            {job.company?.name?.[0] || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900 truncate">{job.title}</h3>
            {right}
          </div>
          <div className="text-sm text-slate-600">{job.company?.name}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {job.location && (
              <span className="badge bg-slate-100 text-slate-700">📍 {job.location}</span>
            )}
            {job.jobMode && (
              <span className="badge bg-slate-100 text-slate-700">{modeLabel[job.jobMode]}</span>
            )}
            {job.jobType && (
              <span className="badge bg-slate-100 text-slate-700">{typeLabel[job.jobType]}</span>
            )}
            {fmtSalary(job) && (
              <span className="badge bg-emerald-50 text-emerald-700">{fmtSalary(job)}</span>
            )}
          </div>
          {job.jobSkills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.jobSkills.slice(0, 6).map((js) => (
                <span key={js.skill.id} className="badge bg-brand-50 text-brand-700">
                  {js.skill.name}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 text-xs text-slate-400">
            Posted {new Date(job.createdAt).toLocaleDateString()}
            {job._count?.applications !== undefined && (
              <> · {job._count.applications} applicants</>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
