const prisma = require('../config/prisma');

const { parsePagination, paginated } = require('../utils/pagination');
const { notFound } = require('../utils/httpError');

async function stats(_req, res) {
  const [users, candidates, employers, companies, jobs, applications] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.candidate.count(),
    prisma.employer.count(),
    prisma.company.count({ where: { deletedAt: null } }),
    prisma.job.count({ where: { deletedAt: null } }),
    prisma.application.count(),
  ]);
  const recentJobs = await prisma.job.findMany({
    where: { deletedAt: null },
    include: { company: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  const recentUsers = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, email: true, role: true, createdAt: true },
  });
  res.json({ users, candidates, employers, companies, jobs, applications, recentJobs, recentUsers });
}

async function listUsers(req, res) {
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const { role, q } = req.query;
  const where = { deletedAt: null };
  if (role) where.role = role;
  if (q) where.email = { contains: q };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { candidate: true, employer: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);
  res.json(paginated(items, total, { page, pageSize }));
}

async function setUserActive(req, res) {
  const id = parseInt(req.params.id, 10);
  const isActive = Boolean(req.body.isActive);
  const user = await prisma.user.update({ where: { id }, data: { isActive } });
  res.json(user);
}

async function softDeleteUser(req, res) {
  const id = parseInt(req.params.id, 10);
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  res.json({ ok: true });
}

async function listAllJobs(req, res) {
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const { status, q } = req.query;
  const where = { deletedAt: null };
  if (status) where.status = status;
  if (q) where.title = { contains: q };
  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.job.count({ where }),
  ]);
  res.json(paginated(items, total, { page, pageSize }));
}

async function moderateJob(req, res) {
  const id = parseInt(req.params.id, 10);
  const action = req.body.action;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw notFound();
  let updated;
  if (action === 'remove') {
    updated = await prisma.job.update({
      where: { id },
      data: { status: 'REMOVED', deletedAt: new Date() },
    });
  } else if (action === 'restore') {
    updated = await prisma.job.update({
      where: { id },
      data: { status: 'PUBLISHED', deletedAt: null },
    });
  } else if (action === 'close') {
    updated = await prisma.job.update({ where: { id }, data: { status: 'CLOSED' } });
  } else {
    return res.status(400).json({ error: 'Unknown action' });
  }
  res.json(updated);
}

module.exports = {
  stats,
  listUsers,
  setUserActive,
  softDeleteUser,
  listAllJobs,
  moderateJob,
};
