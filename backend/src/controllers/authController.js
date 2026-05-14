const bcrypt = require('bcryptjs');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { sign } = require('../utils/jwt');
const { conflict, unauthorized, badRequest } = require('../utils/httpError');
const { uniqueSlug } = require('../utils/slug');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  fullName: z.string().min(2).max(120),
  role: z.enum(['CANDIDATE', 'EMPLOYER']),
  // Employer-only optional fields
  companyName: z.string().min(2).max(120).optional(),
  jobTitle: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  candidate: user.candidate
    ? {
        id: user.candidate.id,
        fullName: user.candidate.fullName,
        headline: user.candidate.headline,
        profilePic: user.candidate.profilePic,
      }
    : null,
  employer: user.employer
    ? {
        id: user.employer.id,
        fullName: user.employer.fullName,
        jobTitle: user.employer.jobTitle,
        companyId: user.employer.companyId,
      }
    : null,
});

async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw conflict('Email already registered');

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { email: data.email, passwordHash, role: data.role },
    });

    if (data.role === 'CANDIDATE') {
      await tx.candidate.create({
        data: { userId: u.id, fullName: data.fullName },
      });
    } else {
      let companyId = null;
      if (data.companyName) {
        const slug = await uniqueSlug(data.companyName, async (s) =>
          Boolean(await tx.company.findUnique({ where: { slug: s } })),
        );
        const company = await tx.company.create({
          data: { name: data.companyName, slug },
        });
        companyId = company.id;
      }
      await tx.employer.create({
        data: {
          userId: u.id,
          fullName: data.fullName,
          jobTitle: data.jobTitle,
          companyId,
        },
      });
    }

    return tx.user.findUnique({
      where: { id: u.id },
      include: { candidate: true, employer: true },
    });
  });

  const token = sign({ userId: user.id, role: user.role });
  res.status(201).json({ token, user: sanitizeUser(user) });
}

async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { candidate: true, employer: true },
  });
  if (!user || user.deletedAt || !user.isActive) throw unauthorized('Invalid credentials');
  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) throw unauthorized('Invalid credentials');

  const token = sign({ userId: user.id, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      candidate: {
        include: {
          educations: true,
          experiences: true,
          certifications: true,
          candidateSkills: { include: { skill: true } },
        },
      },
      employer: { include: { company: true } },
    },
  });
  res.json({ user: sanitizeUser(user), profile: user.candidate || user.employer });
}

async function changePassword(req, res) {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
  });
  const data = schema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const ok = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!ok) throw badRequest('Current password is incorrect');
  const newHash = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
  res.json({ ok: true });
}

module.exports = { register, login, me, changePassword };
