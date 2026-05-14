const { z } = require('zod');
const prisma = require('../config/prisma');
const { forbidden, badRequest } = require('../utils/httpError');
const { uniqueSlug } = require('../utils/slug');
const { fileToUrl } = require('../middleware/upload');

const requireEmployer = (req) => {
  if (!req.user.employer) throw forbidden('Employer account required');
  return req.user.employer;
};

const employerSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
});

const companySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(5000).optional(),
  website: z.string().url().optional().nullable(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
});

async function getMe(req, res) {
  const e = requireEmployer(req);
  const employer = await prisma.employer.findUnique({
    where: { id: e.id },
    include: { company: true },
  });
  res.json(employer);
}

async function updateMe(req, res) {
  const e = requireEmployer(req);
  const data = employerSchema.parse(req.body);
  const updated = await prisma.employer.update({ where: { id: e.id }, data });
  res.json(updated);
}

async function createOrUpdateCompany(req, res) {
  const e = requireEmployer(req);
  const data = companySchema.parse(req.body);

  if (e.companyId) {
    const company = await prisma.company.update({
      where: { id: e.companyId },
      data: {
        description: data.description,
        website: data.website,
        industry: data.industry,
        size: data.size,
        location: data.location,
        // Allow renaming
        name: data.name,
      },
    });
    return res.json(company);
  }

  const slug = await uniqueSlug(data.name, async (s) =>
    Boolean(await prisma.company.findUnique({ where: { slug: s } })),
  );
  const company = await prisma.company.create({ data: { ...data, slug } });
  await prisma.employer.update({ where: { id: e.id }, data: { companyId: company.id } });
  res.status(201).json(company);
}

async function uploadCompanyLogo(req, res) {
  const e = requireEmployer(req);
  if (!e.companyId) throw badRequest('Create a company first');
  if (!req.file) throw badRequest('No file uploaded');
  const url = fileToUrl(req, req.file, 'logos');
  const company = await prisma.company.update({
    where: { id: e.companyId },
    data: { logoUrl: url },
  });
  res.json({ logoUrl: company.logoUrl });
}

async function getDashboardStats(req, res) {
  const e = requireEmployer(req);
  const [totalJobs, openJobs, totalApplications, byStatus, recentApps, topJobs] = await Promise.all([
    prisma.job.count({ where: { postedById: e.id, deletedAt: null } }),
    prisma.job.count({ where: { postedById: e.id, status: 'PUBLISHED', deletedAt: null } }),
    prisma.application.count({ where: { job: { postedById: e.id } } }),
    prisma.application.groupBy({
      by: ['status'],
      where: { job: { postedById: e.id } },
      _count: true,
    }),
    prisma.application.findMany({
      where: { job: { postedById: e.id } },
      include: { candidate: true, job: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.job.findMany({
      where: { postedById: e.id, deletedAt: null },
      orderBy: { applications: { _count: 'desc' } },
      take: 5,
      include: {
        _count: { select: { applications: true } },
      },
    }),
  ]);

  // Build a 30-day application trend
  const since = new Date(Date.now() - 30 * 86400000);
  const trendRows = await prisma.application.findMany({
    where: { job: { postedById: e.id }, createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const trend = {};
  for (const r of trendRows) {
    const k = r.createdAt.toISOString().slice(0, 10);
    trend[k] = (trend[k] || 0) + 1;
  }

  res.json({
    totalJobs,
    openJobs,
    totalApplications,
    byStatus,
    recentApps,
    topJobs,
    trend,
  });
}

module.exports = {
  getMe,
  updateMe,
  createOrUpdateCompany,
  uploadCompanyLogo,
  getDashboardStats,
};
