const { z } = require('zod');
const prisma = require('../config/prisma');
const { forbidden, notFound, conflict, badRequest } = require('../utils/httpError');
const { parsePagination, paginated } = require('../utils/pagination');

async function applyToJob(req, res) {
  const candidate = req.user.candidate;
  if (!candidate) throw forbidden('Candidate account required');

  const schema = z.object({
    coverLetter: z.string().max(5000).optional(),
    resumeUrl: z.string().url().optional(),
  });
  const data = schema.parse(req.body || {});

  const jobId = parseInt(req.params.jobId, 10);
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.deletedAt) throw notFound('Job not found');
  if (job.status !== 'PUBLISHED') throw badRequest('Job is not accepting applications');
  if (job.applicationDeadline && job.applicationDeadline < new Date()) {
    throw badRequest('Application deadline has passed');
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
  });
  if (existing) throw conflict('You have already applied to this job');

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: candidate.id,
      coverLetter: data.coverLetter,
      resumeUrl: data.resumeUrl || candidate.resumeUrl,
    },
    include: { job: { include: { company: true } } },
  });

  // Notify the employer
  const employer = await prisma.employer.findUnique({ where: { id: job.postedById } });
  if (employer) {
    await prisma.notification.create({
      data: {
        userId: employer.userId,
        type: 'SYSTEM',
        title: 'New application received',
        message: `${candidate.fullName} applied to "${job.title}".`,
        link: `/employer/jobs/${job.id}/applicants`,
      },
    });
  }

  res.status(201).json(application);
}

async function listMyApplications(req, res) {
  const candidate = req.user.candidate;
  if (!candidate) throw forbidden();
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const where = { candidateId: candidate.id };
  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.application.count({ where }),
  ]);
  res.json(paginated(items, total, { page, pageSize }));
}

async function withdrawApplication(req, res) {
  const candidate = req.user.candidate;
  if (!candidate) throw forbidden();
  const id = parseInt(req.params.id, 10);
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app || app.candidateId !== candidate.id) throw notFound();
  const updated = await prisma.application.update({
    where: { id },
    data: { status: 'WITHDRAWN' },
  });
  res.json(updated);
}

async function listJobApplicants(req, res) {
  const employer = req.user.employer;
  const jobId = parseInt(req.params.jobId, 10);
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw notFound('Job not found');
  if (req.user.role !== 'ADMIN' && job.postedById !== employer?.id) throw forbidden();

  const { page, pageSize, skip, take } = parsePagination(req.query);
  const { status, q } = req.query;
  const where = { jobId };
  if (status) where.status = status;
  if (q) {
    where.candidate = {
      OR: [
        { fullName: { contains: q } },
        { headline: { contains: q } },
        { location: { contains: q } },
      ],
    };
  }
  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        candidate: {
          include: { candidateSkills: { include: { skill: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.application.count({ where }),
  ]);
  res.json(paginated(items, total, { page, pageSize }));
}

async function updateApplicationStatus(req, res) {
  const employer = req.user.employer;
  const id = parseInt(req.params.id, 10);
  const schema = z.object({
    status: z.enum(['APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'REJECTED', 'HIRED']),
    notes: z.string().max(5000).optional(),
  });
  const data = schema.parse(req.body);

  const app = await prisma.application.findUnique({
    where: { id },
    include: { job: true, candidate: true },
  });
  if (!app) throw notFound();
  if (req.user.role !== 'ADMIN' && app.job.postedById !== employer?.id) throw forbidden();

  const updated = await prisma.application.update({
    where: { id },
    data: { status: data.status, notes: data.notes ?? app.notes },
  });

  // Notify candidate
  await prisma.notification.create({
    data: {
      userId: app.candidate.userId,
      type: 'APPLICATION_UPDATE',
      title: 'Application status updated',
      message: `Your application for "${app.job.title}" is now ${data.status.replace(/_/g, ' ').toLowerCase()}.`,
      link: `/candidate/applications`,
    },
  });

  res.json(updated);
}

module.exports = {
  applyToJob,
  listMyApplications,
  withdrawApplication,
  listJobApplicants,
  updateApplicationStatus,
};
