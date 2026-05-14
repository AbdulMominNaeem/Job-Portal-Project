const { z } = require('zod');
const prisma = require('../config/prisma');
const { parsePagination, paginated } = require('../utils/pagination');
const { uniqueSlug, slugify } = require('../utils/slug');
const { notFound, forbidden, badRequest } = require('../utils/httpError');

const jobBaseSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(20),
  category: z.string().optional(),
  location: z.string().optional(),
  jobMode: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']).optional(),
  experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).optional(),
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  applicationDeadline: z.coerce.date().optional(),
  skills: z.array(z.string().min(1)).optional(),
});

async function ensureSkillsByName(tx, names = []) {
  const ids = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name);
    const existing = await tx.skill.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (existing) ids.push(existing.id);
    else {
      const created = await tx.skill.create({ data: { name, slug } });
      ids.push(created.id);
    }
  }
  return ids;
}

async function listJobs(req, res) {
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const {
    q,
    location,
    company,
    jobType,
    jobMode,
    experienceLevel,
    category,
    salaryMin,
    salaryMax,
    skill,
    postedSince,
    sort,
  } = req.query;

  const where = {
    deletedAt: null,
    status: 'PUBLISHED',
  };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { company: { name: { contains: q } } },
    ];
  }
  if (location) where.location = { contains: location };
  if (jobType) where.jobType = jobType;
  if (jobMode) where.jobMode = jobMode;
  if (experienceLevel) where.experienceLevel = experienceLevel;
  if (category) where.category = { contains: category };
  if (company) where.company = { name: { contains: company } };
  if (salaryMin) where.salaryMax = { gte: Number(salaryMin) };
  if (salaryMax) where.salaryMin = { lte: Number(salaryMax) };
  if (skill) {
    const skills = Array.isArray(skill) ? skill : String(skill).split(',');
    where.jobSkills = { some: { skill: { name: { in: skills } } } };
  }
  if (postedSince) {
    const days = parseInt(postedSince, 10);
    if (!Number.isNaN(days)) {
      const after = new Date(Date.now() - days * 86400000);
      where.createdAt = { gte: after };
    }
  }

  const orderBy = (() => {
    switch (sort) {
      case 'salary_desc':
        return [{ salaryMax: 'desc' }];
      case 'salary_asc':
        return [{ salaryMin: 'asc' }];
      case 'oldest':
        return [{ createdAt: 'asc' }];
      default:
        return [{ createdAt: 'desc' }];
    }
  })();

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: true,
        jobSkills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.job.count({ where }),
  ]);

  res.json(paginated(items, total, { page, pageSize }));
}

async function getJob(req, res) {
  const id = parseInt(req.params.id, 10);
  const job = await prisma.job.findFirst({
    where: { id, deletedAt: null },
    include: {
      company: true,
      jobSkills: { include: { skill: true } },
      postedBy: { select: { id: true, fullName: true, jobTitle: true } },
      _count: { select: { applications: true } },
    },
  });
  if (!job) throw notFound('Job not found');
  // Increment view counter (best-effort)
  prisma.job.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
  res.json(job);
}

async function createJob(req, res) {
  const employer = req.user.employer;
  if (!employer) throw forbidden('Only employers can post jobs');
  if (!employer.companyId) throw badRequest('Create a company profile before posting jobs');

  const data = jobBaseSchema.parse(req.body);
  if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
    throw badRequest('salaryMin cannot exceed salaryMax');
  }

  const slug = await uniqueSlug(data.title, async (s) =>
    Boolean(await prisma.job.findUnique({ where: { slug: s } })),
  );

  const job = await prisma.$transaction(async (tx) => {
    const skillIds = await ensureSkillsByName(tx, data.skills || []);
    const created = await tx.job.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        category: data.category,
        location: data.location,
        jobMode: data.jobMode || 'ONSITE',
        jobType: data.jobType || 'FULL_TIME',
        experienceLevel: data.experienceLevel || 'MID',
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        currency: data.currency || 'USD',
        status: data.status || 'PUBLISHED',
        applicationDeadline: data.applicationDeadline,
        companyId: employer.companyId,
        postedById: employer.id,
        jobSkills: { create: skillIds.map((sid) => ({ skillId: sid })) },
      },
      include: { company: true, jobSkills: { include: { skill: true } } },
    });
    return created;
  });

  res.status(201).json(job);
}

async function updateJob(req, res) {
  const id = parseInt(req.params.id, 10);
  const employer = req.user.employer;
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) throw notFound('Job not found');
  if (req.user.role !== 'ADMIN' && existing.postedById !== employer?.id) {
    throw forbidden('Cannot edit this job');
  }

  const data = jobBaseSchema.partial().parse(req.body);

  const job = await prisma.$transaction(async (tx) => {
    if (data.skills) {
      await tx.jobSkill.deleteMany({ where: { jobId: id } });
      const skillIds = await ensureSkillsByName(tx, data.skills);
      for (const sid of skillIds) {
        await tx.jobSkill.create({ data: { jobId: id, skillId: sid } });
      }
    }
    const updated = await tx.job.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        jobMode: data.jobMode,
        jobType: data.jobType,
        experienceLevel: data.experienceLevel,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        currency: data.currency,
        status: data.status,
        applicationDeadline: data.applicationDeadline,
      },
      include: { company: true, jobSkills: { include: { skill: true } } },
    });
    return updated;
  });

  res.json(job);
}

async function deleteJob(req, res) {
  const id = parseInt(req.params.id, 10);
  const employer = req.user.employer;
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) throw notFound('Job not found');
  if (req.user.role !== 'ADMIN' && existing.postedById !== employer?.id) {
    throw forbidden('Cannot delete this job');
  }
  await prisma.job.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'REMOVED' },
  });
  res.json({ ok: true });
}

async function listMyPostedJobs(req, res) {
  const employer = req.user.employer;
  if (!employer) throw forbidden('Only employers');
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const where = { postedById: employer.id, deletedAt: null };
  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: true,
        jobSkills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
    }),
    prisma.job.count({ where }),
  ]);
  res.json(paginated(items, total, { page, pageSize }));
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob, listMyPostedJobs };
