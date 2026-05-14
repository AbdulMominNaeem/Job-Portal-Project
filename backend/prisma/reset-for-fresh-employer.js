/* eslint-disable no-console */
// Clears jobs + applications + saved jobs + fake companies + employer accounts,
// so you can register a brand-new employer and post jobs from scratch.
//
//   Keeps : admin account, candidate accounts, skills
//   Wipes : jobs, applications, saved jobs, jobskills, employers, companies,
//           and employer/import-bot users
//
// Run:    npm run reset:fresh

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing job-side data so you can start fresh…');

  // Order matters — children before parents
  const apps = await prisma.application.deleteMany();
  const saved = await prisma.savedJob.deleteMany();
  const jobSkills = await prisma.jobSkill.deleteMany();
  const jobs = await prisma.job.deleteMany();
  const employers = await prisma.employer.deleteMany();
  const companies = await prisma.company.deleteMany();

  // Delete the user rows that backed those employers + the import bot
  const employerUsers = await prisma.user.deleteMany({
    where: { role: 'EMPLOYER' },
  });

  // Drop any notifications that referenced now-gone jobs/employers
  const notifs = await prisma.notification.deleteMany({
    where: { type: { in: ['APPLICATION_UPDATE', 'NEW_MATCHING_JOB'] } },
  });

  console.log('Wipe summary:');
  console.log(`  applications      : ${apps.count}`);
  console.log(`  saved jobs        : ${saved.count}`);
  console.log(`  job-skill links   : ${jobSkills.count}`);
  console.log(`  jobs              : ${jobs.count}`);
  console.log(`  employers         : ${employers.count}`);
  console.log(`  companies         : ${companies.count}`);
  console.log(`  employer users    : ${employerUsers.count}`);
  console.log(`  stale notifs      : ${notifs.count}`);

  const remaining = {
    users: await prisma.user.count(),
    candidates: await prisma.candidate.count(),
    skills: await prisma.skill.count(),
    jobs: await prisma.job.count(),
    companies: await prisma.company.count(),
    employers: await prisma.employer.count(),
  };
  console.log('\nRemaining in DB:');
  for (const [k, v] of Object.entries(remaining)) console.log(`  ${k.padEnd(12)}: ${v}`);

  console.log('\nDone. You can now:');
  console.log('  1) Register a new employer at  http://localhost:5173/register?role=employer');
  console.log('  2) Set up your company under   Employer → Company');
  console.log('  3) Post jobs under             Employer → Post a Job');
  console.log('  4) Apply as one of the existing candidates:');
  console.log('       candidate1@jobportal.test … candidate6@jobportal.test  (pw: Passw0rd!)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
