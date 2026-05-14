const { z } = require('zod');
const prisma = require('../config/prisma');
const { forbidden, notFound, badRequest } = require('../utils/httpError');
const { slugify } = require('../utils/slug');
const { fileToUrl } = require('../middleware/upload');

const profileSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(5000).optional(),
  phone: z.string().max(40).optional(),
  location: z.string().max(120).optional(),
  websiteUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
});

const requireCandidate = (req) => {
  if (!req.user.candidate) throw forbidden('Candidate account required');
  return req.user.candidate;
};

async function getMyProfile(req, res) {
  const c = requireCandidate(req);
  const candidate = await prisma.candidate.findUnique({
    where: { id: c.id },
    include: {
      educations: { orderBy: { startDate: 'desc' } },
      experiences: { orderBy: { startDate: 'desc' } },
      certifications: { orderBy: { issuedAt: 'desc' } },
      candidateSkills: { include: { skill: true } },
    },
  });
  res.json(candidate);
}

async function updateMyProfile(req, res) {
  const c = requireCandidate(req);
  const data = profileSchema.parse(req.body);
  const updated = await prisma.candidate.update({ where: { id: c.id }, data });
  res.json(updated);
}

async function uploadResume(req, res) {
  const c = requireCandidate(req);
  if (!req.file) throw badRequest('No file uploaded');
  const url = fileToUrl(req, req.file, 'resumes');
  const updated = await prisma.candidate.update({ where: { id: c.id }, data: { resumeUrl: url } });
  res.json({ resumeUrl: updated.resumeUrl });
}

async function uploadAvatar(req, res) {
  const c = requireCandidate(req);
  if (!req.file) throw badRequest('No file uploaded');
  const url = fileToUrl(req, req.file, 'avatars');
  const updated = await prisma.candidate.update({ where: { id: c.id }, data: { profilePic: url } });
  res.json({ profilePic: updated.profilePic });
}

// Skills
async function setSkills(req, res) {
  const c = requireCandidate(req);
  const schema = z.object({ skills: z.array(z.object({ name: z.string(), level: z.string().optional() })) });
  const { skills } = schema.parse(req.body);

  await prisma.$transaction(async (tx) => {
    await tx.candidateSkill.deleteMany({ where: { candidateId: c.id } });
    for (const s of skills) {
      const slug = slugify(s.name);
      let skill = await tx.skill.findFirst({ where: { OR: [{ name: s.name }, { slug }] } });
      if (!skill) skill = await tx.skill.create({ data: { name: s.name, slug } });
      await tx.candidateSkill.create({
        data: { candidateId: c.id, skillId: skill.id, level: s.level || null },
      });
    }
  });

  const result = await prisma.candidateSkill.findMany({
    where: { candidateId: c.id },
    include: { skill: true },
  });
  res.json(result);
}

// Education
async function addEducation(req, res) {
  const c = requireCandidate(req);
  const schema = z.object({
    school: z.string().min(1),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    description: z.string().optional(),
  });
  const data = schema.parse(req.body);
  const created = await prisma.education.create({ data: { ...data, candidateId: c.id } });
  res.status(201).json(created);
}

async function deleteEducation(req, res) {
  const c = requireCandidate(req);
  const id = parseInt(req.params.id, 10);
  const item = await prisma.education.findUnique({ where: { id } });
  if (!item || item.candidateId !== c.id) throw notFound();
  await prisma.education.delete({ where: { id } });
  res.json({ ok: true });
}

// Experience
async function addExperience(req, res) {
  const c = requireCandidate(req);
  const schema = z.object({
    company: z.string().min(1),
    title: z.string().min(1),
    location: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    current: z.boolean().optional(),
    description: z.string().optional(),
  });
  const data = schema.parse(req.body);
  const created = await prisma.experience.create({ data: { ...data, candidateId: c.id } });
  res.status(201).json(created);
}

async function deleteExperience(req, res) {
  const c = requireCandidate(req);
  const id = parseInt(req.params.id, 10);
  const item = await prisma.experience.findUnique({ where: { id } });
  if (!item || item.candidateId !== c.id) throw notFound();
  await prisma.experience.delete({ where: { id } });
  res.json({ ok: true });
}

// Certifications
async function addCertification(req, res) {
  const c = requireCandidate(req);
  const schema = z.object({
    name: z.string().min(1),
    issuer: z.string().optional(),
    issuedAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    credentialUrl: z.string().url().optional(),
  });
  const data = schema.parse(req.body);
  const created = await prisma.certification.create({ data: { ...data, candidateId: c.id } });
  res.status(201).json(created);
}

async function deleteCertification(req, res) {
  const c = requireCandidate(req);
  const id = parseInt(req.params.id, 10);
  const item = await prisma.certification.findUnique({ where: { id } });
  if (!item || item.candidateId !== c.id) throw notFound();
  await prisma.certification.delete({ where: { id } });
  res.json({ ok: true });
}

// Saved jobs
async function saveJob(req, res) {
  const c = requireCandidate(req);
  const jobId = parseInt(req.params.jobId, 10);
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw notFound('Job not found');
  await prisma.savedJob.upsert({
    where: { candidateId_jobId: { candidateId: c.id, jobId } },
    create: { candidateId: c.id, jobId },
    update: {},
  });
  res.json({ ok: true });
}

async function unsaveJob(req, res) {
  const c = requireCandidate(req);
  const jobId = parseInt(req.params.jobId, 10);
  await prisma.savedJob.deleteMany({ where: { candidateId: c.id, jobId } });
  res.json({ ok: true });
}

async function listSavedJobs(req, res) {
  const c = requireCandidate(req);
  const items = await prisma.savedJob.findMany({
    where: { candidateId: c.id },
    include: {
      job: {
        include: { company: true, jobSkills: { include: { skill: true } } },
      },
    },
    orderBy: { savedAt: 'desc' },
  });
  res.json(items);
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  uploadAvatar,
  setSkills,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  addCertification,
  deleteCertification,
  saveJob,
  unsaveJob,
  listSavedJobs,
};
