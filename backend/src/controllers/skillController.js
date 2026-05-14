const prisma = require('../config/prisma');

async function listSkills(req, res) {
  const q = req.query.q?.toString().trim();
  const items = await prisma.skill.findMany({
    where: q ? { name: { contains: q } } : {},
    orderBy: { name: 'asc' },
    take: 50,
  });
  res.json(items);
}

async function listCompanies(req, res) {
  const q = req.query.q?.toString().trim();
  const items = await prisma.company.findMany({
    where: { deletedAt: null, ...(q ? { name: { contains: q } } : {}) },
    orderBy: { name: 'asc' },
    take: 50,
  });
  res.json(items);
}

async function getCompany(req, res) {
  const id = parseInt(req.params.id, 10);
  const company = await prisma.company.findFirst({
    where: { id, deletedAt: null },
    include: {
      jobs: {
        where: { status: 'PUBLISHED', deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });
  if (!company) return res.status(404).json({ error: 'Not found' });
  res.json(company);
}

module.exports = { listSkills, listCompanies, getCompany };
