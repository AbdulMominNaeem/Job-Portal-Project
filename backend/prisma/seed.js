/* eslint-disable no-console */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const slugify = (s) =>
  s
    .replace(/\+/g, 'p')      // C++ → Cpp
    .replace(/#/g, 's')       // C#  → Cs
    .replace(/\./g, '-')      // Next.js → next-js
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

// ---------- Data definitions ----------

const SKILL_NAMES = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'Kotlin', 'Swift', 'C++', 'C#', 'Ruby', 'PHP',
  // Frameworks
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Express', 'NestJS',
  'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Rails', 'Laravel',
  // Data
  'MySQL', 'PostgreSQL', 'SQL Server', 'MongoDB', 'Redis', 'Elasticsearch', 'ClickHouse', 'Snowflake', 'BigQuery',
  // Cloud / DevOps
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions',
  // Frontend
  'Tailwind CSS', 'CSS', 'HTML', 'Figma', 'Sass',
  // ML / data science
  'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'scikit-learn', 'LLMs',
  // Mobile
  'iOS', 'Android', 'React Native', 'Flutter',
  // APIs / patterns
  'GraphQL', 'REST', 'gRPC', 'Microservices',
  // Soft
  'Product Management', 'Agile', 'Scrum', 'Stakeholder Management',
  // Design
  'UI Design', 'UX Research', 'Prototyping',
  // Sales / marketing
  'Salesforce', 'HubSpot', 'SEO', 'Content Marketing', 'Email Marketing',
];

const COMPANIES = [
  { name: 'Acme Corp', industry: 'Software', size: '500-1000', location: 'San Francisco, CA',
    description: 'Building the future of B2B software with deep developer integrations.' },
  { name: 'Northwind Labs', industry: 'AI/ML', size: '50-200', location: 'New York, NY',
    description: 'Applied research lab focused on natural language and information retrieval.' },
  { name: 'Globex', industry: 'Fintech', size: '200-500', location: 'London, UK',
    description: 'Modern banking infrastructure for global teams and businesses.' },
  { name: 'Initech', industry: 'SaaS', size: '50-200', location: 'Austin, TX',
    description: 'Workflow automation for finance and operations teams.' },
  { name: 'Hooli', industry: 'Consumer Internet', size: '1000-5000', location: 'Mountain View, CA',
    description: 'Search, ads, and a sprawling consumer suite touching a billion people a day.' },
  { name: 'Pied Piper', industry: 'Compression', size: '10-50', location: 'Palo Alto, CA',
    description: 'A new way to compress everything from video to entire data lakes.' },
  { name: 'Wayne Enterprises', industry: 'Aerospace', size: '5000+', location: 'Gotham, NY',
    description: 'Industrial systems and applied R&D across aerospace, defense, and clean energy.' },
  { name: 'Stark Industries', industry: 'Robotics', size: '1000-5000', location: 'Malibu, CA',
    description: 'Robotics and embedded systems for industrial and consumer markets.' },
  { name: 'Tyrell Corp', industry: 'Biotech', size: '200-500', location: 'Los Angeles, CA',
    description: 'Synthetic biology and large-scale genomic data platforms.' },
  { name: 'Cyberdyne Systems', industry: 'AI/ML', size: '50-200', location: 'Sunnyvale, CA',
    description: 'Foundation models and inference infrastructure at scale.' },
  { name: 'Soylent Industries', industry: 'Consumer Goods', size: '200-500', location: 'Chicago, IL',
    description: 'Consumer packaged goods with a tech-forward supply chain.' },
  { name: 'Black Mesa', industry: 'Research', size: '500-1000', location: 'Albuquerque, NM',
    description: 'Public-private research consortium for materials science and physics.' },
  { name: 'Aperture Labs', industry: 'Robotics', size: '50-200', location: 'Boston, MA',
    description: 'Test-and-measurement hardware and the software stack that drives it.' },
  { name: 'Vandelay Industries', industry: 'Logistics', size: '1000-5000', location: 'Newark, NJ',
    description: 'Global import/export logistics with modern tracking and customs APIs.' },
  { name: 'Oceanic Airlines', industry: 'Travel', size: '5000+', location: 'Sydney, Australia',
    description: 'Long-haul carrier modernising booking, ops, and crew management software.' },
];

const EMPLOYERS = [
  // [companyIndex, email, fullName, jobTitle]
  [0, 'employer1@jobportal.test', 'Riley Stone',   'Head of Talent'],
  [1, 'employer2@jobportal.test', 'Morgan Hayes',  'Recruiting Lead'],
  [2, 'employer3@jobportal.test', 'Chris Park',    'People Operations'],
  [3, 'employer4@jobportal.test', 'Jamie Russo',   'Talent Partner'],
  [4, 'employer5@jobportal.test', 'Sam Avery',     'Director of Recruiting'],
  [5, 'employer6@jobportal.test', 'Drew Quinn',    'Head of Hiring'],
  [7, 'employer7@jobportal.test', 'Casey Lin',     'Engineering Recruiter'],
  [9, 'employer8@jobportal.test', 'Tara Mendoza',  'Talent Acquisition'],
];

const CANDIDATES = [
  {
    email: 'candidate1@jobportal.test', fullName: 'Alex Reyes',
    headline: 'Senior Frontend Engineer', location: 'San Francisco, CA',
    bio: 'Frontend engineer with 8 years of React, design systems, and accessibility experience.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'GraphQL', 'Next.js'],
  },
  {
    email: 'candidate2@jobportal.test', fullName: 'Jordan Singh',
    headline: 'Full-Stack Developer', location: 'Austin, TX',
    bio: 'Full-stack developer focused on Node.js, SQL Server, and clean REST APIs.',
    skills: ['Node.js', 'Express', 'SQL Server', 'MySQL', 'Docker', 'Redis', 'TypeScript'],
  },
  {
    email: 'candidate3@jobportal.test', fullName: 'Taylor Chen',
    headline: 'ML Engineer', location: 'Remote',
    bio: 'Machine learning engineer with experience in NLP, retrieval, and production model serving.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'AWS', 'Kubernetes', 'LLMs', 'FastAPI'],
  },
  {
    email: 'candidate4@jobportal.test', fullName: 'Sam Patel',
    headline: 'Backend Engineer', location: 'Berlin, Germany',
    bio: 'Backend engineer who thrives on distributed systems, observability, and data correctness.',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'gRPC', 'Kubernetes', 'Terraform', 'AWS'],
  },
  {
    email: 'candidate5@jobportal.test', fullName: 'Robin Hayes',
    headline: 'Product Designer', location: 'London, UK',
    bio: 'Product designer focused on B2B SaaS, design systems, and prototyping.',
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Tailwind CSS'],
  },
  {
    email: 'candidate6@jobportal.test', fullName: 'Pat Nguyen',
    headline: 'iOS Engineer', location: 'Toronto, Canada',
    bio: 'Mobile engineer with seven years of iOS, plus solid React Native experience.',
    skills: ['Swift', 'iOS', 'React Native', 'Kotlin', 'Android'],
  },
];

const JOBS = [
  // 0 Acme Corp — engineering
  { companyIdx: 0, employerIdx: 0,
    title: 'Senior React Engineer', category: 'Engineering',
    description: 'Build polished customer-facing experiences across our flagship product. You will own a slice of the frontend, partner with design, and ship weekly.',
    location: 'San Francisco, CA', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 170000, salaryMax: 230000,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Next.js'] },
  { companyIdx: 0, employerIdx: 0,
    title: 'Backend Engineer (Node.js)', category: 'Engineering',
    description: 'Design and ship REST and GraphQL APIs that power our growing product surface. Strong SQL Server fundamentals required.',
    location: 'San Francisco, CA', jobMode: 'REMOTE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 140000, salaryMax: 180000,
    skills: ['Node.js', 'Express', 'SQL Server', 'Docker', 'GraphQL'] },
  { companyIdx: 0, employerIdx: 0,
    title: 'Engineering Manager — Platform', category: 'Engineering',
    description: 'Lead a team of 6–8 engineers responsible for the data platform that the rest of the product builds on. Hands-on coaching, roadmap, and hiring.',
    location: 'San Francisco, CA', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'LEAD',
    salaryMin: 220000, salaryMax: 290000,
    skills: ['Microservices', 'AWS', 'PostgreSQL', 'Stakeholder Management'] },

  // 1 Northwind Labs — ML/research
  { companyIdx: 1, employerIdx: 1,
    title: 'Applied ML Engineer', category: 'Machine Learning',
    description: 'Train, evaluate and deploy retrieval and ranking models. You will partner with research scientists and ship to production weekly.',
    location: 'New York, NY', jobMode: 'ONSITE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 160000, salaryMax: 220000,
    skills: ['Python', 'PyTorch', 'AWS', 'PostgreSQL', 'Docker'] },
  { companyIdx: 1, employerIdx: 1,
    title: 'Research Engineer — LLM Evaluation', category: 'Machine Learning',
    description: 'Build evaluation pipelines and datasets for our foundation models. Strong Python and a knack for measurement design.',
    location: 'New York, NY', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 200000, salaryMax: 280000,
    skills: ['Python', 'PyTorch', 'LLMs', 'FastAPI', 'AWS'] },
  { companyIdx: 1, employerIdx: 1,
    title: 'Data Engineer', category: 'Data',
    description: 'Own the data pipelines that feed model training and analytics. dbt + Snowflake + Airflow.',
    location: 'Remote', jobMode: 'REMOTE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 140000, salaryMax: 190000,
    skills: ['Python', 'Snowflake', 'AWS', 'PostgreSQL'] },

  // 2 Globex — fintech
  { companyIdx: 2, employerIdx: 2,
    title: 'Full-Stack Developer', category: 'Engineering',
    description: 'Ship end-to-end features across our payment platform. Comfortable working with banking APIs and reconciliation.',
    location: 'London, UK', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 95000, salaryMax: 135000, currency: 'GBP',
    skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'AWS'] },
  { companyIdx: 2, employerIdx: 2,
    title: 'Junior QA Engineer', category: 'QA',
    description: 'Own automated test coverage for our core payments flows. Strong attention to detail and curiosity required.',
    location: 'Remote', jobMode: 'REMOTE', jobType: 'CONTRACT', experienceLevel: 'JUNIOR',
    salaryMin: 50000, salaryMax: 72000, currency: 'GBP',
    skills: ['JavaScript', 'Node.js', 'CI/CD'] },
  { companyIdx: 2, employerIdx: 2,
    title: 'Compliance Analyst', category: 'Operations',
    description: 'Partner with engineering to keep our payment products in lockstep with EU/UK regulations.',
    location: 'London, UK', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 70000, salaryMax: 95000, currency: 'GBP',
    skills: ['Stakeholder Management', 'Agile'] },

  // 3 Initech — SaaS
  { companyIdx: 3, employerIdx: 3,
    title: 'Founding Backend Engineer', category: 'Engineering',
    description: 'Help build the v2 of our workflow engine from the ground up. Heavy Postgres and TypeScript.',
    location: 'Austin, TX', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 150000, salaryMax: 210000,
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'] },
  { companyIdx: 3, employerIdx: 3,
    title: 'Customer Success Manager', category: 'Customer Success',
    description: 'Own a book of enterprise accounts; ensure adoption, identify expansion, partner with product on feedback loops.',
    location: 'Austin, TX', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 90000, salaryMax: 130000,
    skills: ['Salesforce', 'HubSpot', 'Stakeholder Management'] },
  { companyIdx: 3, employerIdx: 3,
    title: 'Marketing Designer (Contract)', category: 'Design',
    description: 'Help us produce launch assets, landing pages, and brand-aligned campaign visuals.',
    location: 'Remote', jobMode: 'REMOTE', jobType: 'CONTRACT', experienceLevel: 'MID',
    salaryMin: 60, salaryMax: 95, currency: 'USD',
    skills: ['Figma', 'UI Design', 'Prototyping'] },

  // 4 Hooli — consumer internet
  { companyIdx: 4, employerIdx: 4,
    title: 'Software Engineer II — Search', category: 'Engineering',
    description: 'Own a slice of the search relevance stack. Python + Go + a lot of latency budgets.',
    location: 'Mountain View, CA', jobMode: 'ONSITE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 175000, salaryMax: 245000,
    skills: ['Go', 'Python', 'Elasticsearch', 'Microservices'] },
  { companyIdx: 4, employerIdx: 4,
    title: 'Staff Engineer — Ads Quality', category: 'Engineering',
    description: 'Set technical direction for the team responsible for ad ranking quality and experimentation.',
    location: 'Mountain View, CA', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'LEAD',
    salaryMin: 320000, salaryMax: 460000,
    skills: ['Python', 'PyTorch', 'GCP', 'BigQuery'] },
  { companyIdx: 4, employerIdx: 4,
    title: 'Product Designer — Consumer', category: 'Design',
    description: 'Design the next generation of one of our largest consumer surfaces.',
    location: 'Mountain View, CA', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 180000, salaryMax: 250000,
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'] },
  { companyIdx: 4, employerIdx: 4,
    title: 'Summer 2026 SWE Intern', category: 'Engineering',
    description: '12-week paid internship across consumer and infra teams.',
    location: 'Mountain View, CA', jobMode: 'ONSITE', jobType: 'INTERNSHIP', experienceLevel: 'ENTRY',
    salaryMin: 12000, salaryMax: 14000, currency: 'USD',
    skills: ['Python', 'Java'] },

  // 5 Pied Piper — small startup
  { companyIdx: 5, employerIdx: 5,
    title: 'Senior Systems Engineer (Compression)', category: 'Engineering',
    description: 'Own performance-critical paths in our compression engine. Rust + a deep understanding of memory hierarchies.',
    location: 'Palo Alto, CA', jobMode: 'ONSITE', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 200000, salaryMax: 290000,
    skills: ['Rust', 'C++'] },
  { companyIdx: 5, employerIdx: 5,
    title: 'Developer Advocate', category: 'Engineering',
    description: 'Be the bridge between our engineers and the wider open-source community.',
    location: 'Remote', jobMode: 'REMOTE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 130000, salaryMax: 180000,
    skills: ['JavaScript', 'TypeScript', 'Content Marketing', 'SEO'] },

  // 6 Wayne Enterprises — large industrial
  { companyIdx: 6, employerIdx: null, // No employer assigned -> uses bot
    title: 'Embedded Software Engineer', category: 'Embedded',
    description: 'Develop firmware for industrial control modules. Heavy C and CI/CD experience required.',
    location: 'Gotham, NY', jobMode: 'ONSITE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 130000, salaryMax: 175000,
    skills: ['C++', 'CI/CD'] },
  { companyIdx: 6, employerIdx: null,
    title: 'Project Manager — Defense Systems', category: 'Operations',
    description: 'Coordinate cross-discipline engineering teams on long-cycle hardware programs.',
    location: 'Gotham, NY', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 150000, salaryMax: 210000,
    skills: ['Stakeholder Management', 'Agile', 'Scrum'] },

  // 7 Stark Industries — robotics
  { companyIdx: 7, employerIdx: 6,
    title: 'Robotics Software Engineer', category: 'Robotics',
    description: 'Design and ship motion-planning and perception code for our industrial robot platform.',
    location: 'Malibu, CA', jobMode: 'ONSITE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 160000, salaryMax: 220000,
    skills: ['C++', 'Python', 'PyTorch'] },
  { companyIdx: 7, employerIdx: 6,
    title: 'Computer Vision Engineer', category: 'Machine Learning',
    description: 'Build the perception stack used across our consumer and industrial robots.',
    location: 'Malibu, CA', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 195000, salaryMax: 275000,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs'] },
  { companyIdx: 7, employerIdx: 6,
    title: 'Manufacturing Test Technician', category: 'Operations',
    description: 'Own ATE bring-up and qualification for new robot revisions in our pilot line.',
    location: 'Malibu, CA', jobMode: 'ONSITE', jobType: 'FULL_TIME', experienceLevel: 'JUNIOR',
    salaryMin: 75000, salaryMax: 100000,
    skills: [] },

  // 8 Tyrell Corp — biotech (no employer assigned — uses bot)
  { companyIdx: 8, employerIdx: null,
    title: 'Bioinformatics Engineer', category: 'Data',
    description: 'Build pipelines that process petabyte-scale genomic datasets.',
    location: 'Los Angeles, CA', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 180000, salaryMax: 240000,
    skills: ['Python', 'Pandas', 'AWS', 'PostgreSQL'] },

  // 9 Cyberdyne — AI
  { companyIdx: 9, employerIdx: 7,
    title: 'Inference Infrastructure Engineer', category: 'Infrastructure',
    description: 'Make our GPU inference cluster faster, cheaper, and more reliable.',
    location: 'Sunnyvale, CA', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 220000, salaryMax: 320000,
    skills: ['Python', 'Kubernetes', 'CUDA', 'gRPC'] },
  { companyIdx: 9, employerIdx: 7,
    title: 'ML Platform Engineer', category: 'Machine Learning',
    description: 'Own the developer experience for our model-training platform.',
    location: 'Sunnyvale, CA', jobMode: 'REMOTE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 175000, salaryMax: 240000,
    skills: ['Python', 'Kubernetes', 'AWS', 'Terraform'] },
  { companyIdx: 9, employerIdx: 7,
    title: 'Founding Sales Engineer', category: 'Sales',
    description: 'First sales engineer on the team. Partner with AEs on technical wins.',
    location: 'New York, NY', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 200000, salaryMax: 290000,
    skills: ['Python', 'Salesforce', 'Stakeholder Management'] },

  // 10 Soylent — consumer goods (no employer -> bot)
  { companyIdx: 10, employerIdx: null,
    title: 'Supply Chain Analyst', category: 'Operations',
    description: 'Build dashboards and forecasts that drive purchasing, logistics, and inventory decisions.',
    location: 'Chicago, IL', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 90000, salaryMax: 125000,
    skills: ['Python', 'Pandas', 'BigQuery'] },

  // 11 Black Mesa — research
  { companyIdx: 11, employerIdx: null,
    title: 'Research Software Engineer', category: 'Research',
    description: 'Build simulation tooling for our materials science group.',
    location: 'Albuquerque, NM', jobMode: 'ONSITE', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 120000, salaryMax: 170000,
    skills: ['Python', 'C++', 'NumPy'] },

  // 12 Aperture Labs
  { companyIdx: 12, employerIdx: null,
    title: 'Test Automation Engineer', category: 'QA',
    description: 'Automate hardware-in-the-loop testing for our flagship measurement platform.',
    location: 'Boston, MA', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 120000, salaryMax: 165000,
    skills: ['Python', 'CI/CD', 'Jenkins'] },

  // 13 Vandelay — logistics
  { companyIdx: 13, employerIdx: null,
    title: 'Senior Java Engineer — Customs APIs', category: 'Engineering',
    description: 'Own the integration platform that connects our customers to global customs authorities.',
    location: 'Newark, NJ', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 160000, salaryMax: 215000,
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'AWS'] },
  { companyIdx: 13, employerIdx: null,
    title: 'Account Executive — Mid-Market', category: 'Sales',
    description: 'Run a full-cycle territory of mid-market import/export customers.',
    location: 'Newark, NJ', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 110000, salaryMax: 180000,
    skills: ['Salesforce', 'HubSpot'] },

  // 14 Oceanic Airlines
  { companyIdx: 14, employerIdx: null,
    title: 'Senior Backend Engineer — Booking', category: 'Engineering',
    description: 'Modernise the booking engine. Java + Kafka + lots of legacy.',
    location: 'Sydney, Australia', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 160000, salaryMax: 220000, currency: 'AUD',
    skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'] },
  { companyIdx: 14, employerIdx: null,
    title: 'iOS Engineer — Crew App', category: 'Engineering',
    description: 'Own the crew-facing iOS app used by 8,000+ flight crew daily.',
    location: 'Sydney, Australia', jobMode: 'HYBRID', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryMin: 135000, salaryMax: 175000, currency: 'AUD',
    skills: ['Swift', 'iOS'] },
  { companyIdx: 14, employerIdx: null,
    title: 'Product Manager — Loyalty', category: 'Product',
    description: 'Lead the loyalty product. Partner with marketing, data, and engineering across regions.',
    location: 'Remote', jobMode: 'REMOTE', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
    salaryMin: 150000, salaryMax: 200000, currency: 'AUD',
    skills: ['Product Management', 'Agile', 'Stakeholder Management'] },
];

// ---------- Helpers ----------

async function ensureImportBot(passwordHash) {
  const email = 'import-bot@jobportal.local';
  let user = await prisma.user.findUnique({ where: { email }, include: { employer: true } });
  if (user?.employer) return user.employer;
  if (!user) {
    user = await prisma.user.create({
      data: { email, passwordHash, role: 'EMPLOYER', isActive: false },
    });
  }
  return prisma.employer.create({
    data: { userId: user.id, fullName: 'Import Bot', jobTitle: 'Automated importer' },
  });
}

// ---------- Run ----------

async function main() {
  console.log('Seeding…');

  // Wipe (idempotent dev seed)
  await prisma.notification.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.company.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Passw0rd!', 10);

  // Skills
  const skills = {};
  for (const name of SKILL_NAMES) {
    const s = await prisma.skill.create({ data: { name, slug: slugify(name) } });
    skills[name] = s;
  }
  // Some seeded jobs use skills not in the vocab; create lazily.
  const ensureSkill = async (name) => {
    if (skills[name]) return skills[name];
    const s = await prisma.skill.create({ data: { name, slug: slugify(name) } });
    skills[name] = s;
    return s;
  };

  // Admin
  await prisma.user.create({
    data: { email: 'admin@jobportal.test', passwordHash, role: 'ADMIN' },
  });

  // Companies
  const companies = [];
  for (const c of COMPANIES) {
    const company = await prisma.company.create({
      data: { ...c, slug: slugify(c.name) },
    });
    companies.push(company);
  }

  // Employers
  const employers = [];
  for (const [companyIdx, email, fullName, jobTitle] of EMPLOYERS) {
    const user = await prisma.user.create({
      data: { email, passwordHash, role: 'EMPLOYER' },
    });
    const employer = await prisma.employer.create({
      data: { userId: user.id, fullName, jobTitle, companyId: companies[companyIdx].id },
    });
    employers.push(employer);
  }

  // Bot employer (used as postedBy for jobs whose company has no real employer)
  const botEmployer = await ensureImportBot(passwordHash);

  // Candidates
  const candidates = [];
  for (const def of CANDIDATES) {
    const user = await prisma.user.create({
      data: { email: def.email, passwordHash, role: 'CANDIDATE' },
    });
    const cand = await prisma.candidate.create({
      data: {
        userId: user.id, fullName: def.fullName, headline: def.headline,
        location: def.location, bio: def.bio,
      },
    });
    for (const sn of def.skills) {
      const s = await ensureSkill(sn);
      await prisma.candidateSkill.create({
        data: { candidateId: cand.id, skillId: s.id, level: 'Advanced' },
      });
    }
    candidates.push(cand);
  }

  // Education / experience / certification on the first candidate to exercise the UI
  await prisma.education.create({
    data: {
      candidateId: candidates[0].id,
      school: 'UC Berkeley', degree: 'B.S.', fieldOfStudy: 'Computer Science',
      startDate: new Date('2014-09-01'), endDate: new Date('2018-06-01'),
      description: 'Focus on systems and HCI.',
    },
  });
  await prisma.experience.create({
    data: {
      candidateId: candidates[0].id,
      company: 'Stripe', title: 'Senior Frontend Engineer',
      startDate: new Date('2021-04-01'), current: true,
      description: 'Led design-system migration across 6 product teams.',
    },
  });
  await prisma.certification.create({
    data: {
      candidateId: candidates[0].id,
      name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services',
      issuedAt: new Date('2023-02-10'),
    },
  });

  // Jobs
  const createdJobs = [];
  for (const def of JOBS) {
    const company = companies[def.companyIdx];
    const postedBy =
      def.employerIdx !== null && def.employerIdx !== undefined
        ? employers[def.employerIdx]
        : botEmployer;
    const slug = `${slugify(def.title)}-${slugify(company.name)}-${Math.random().toString(36).slice(2, 7)}`;
    const job = await prisma.job.create({
      data: {
        title: def.title,
        slug,
        description: def.description,
        location: def.location,
        jobMode: def.jobMode,
        jobType: def.jobType,
        experienceLevel: def.experienceLevel,
        salaryMin: def.salaryMin,
        salaryMax: def.salaryMax,
        currency: def.currency || 'USD',
        category: def.category,
        status: 'PUBLISHED',
        companyId: company.id,
        postedById: postedBy.id,
      },
    });
    for (const sn of def.skills) {
      const s = await ensureSkill(sn);
      await prisma.jobSkill.create({ data: { jobId: job.id, skillId: s.id } });
    }
    createdJobs.push(job);
  }

  // Applications — spread a few across candidates and jobs with varied statuses
  const APPLY = [
    { candidateIdx: 0, jobIdx: 0, status: 'UNDER_REVIEW', cover: 'Excited about your design-system culture.' },
    { candidateIdx: 0, jobIdx: 14, status: 'APPLIED',     cover: 'Strong fit for the consumer design role.' },
    { candidateIdx: 1, jobIdx: 1, status: 'INTERVIEW',    cover: 'Node + SQL Server background lines up.' },
    { candidateIdx: 1, jobIdx: 9, status: 'APPLIED',      cover: 'Eager to help build v2 of the workflow engine.' },
    { candidateIdx: 2, jobIdx: 3, status: 'APPLIED',      cover: 'My retrieval work at $previous fits the bill.' },
    { candidateIdx: 2, jobIdx: 4, status: 'HIRED',        cover: 'Already familiar with your eval frameworks.' },
    { candidateIdx: 3, jobIdx: 24, status: 'APPLIED',     cover: 'Java + Kafka is my bread and butter.' },
    { candidateIdx: 3, jobIdx: 27, status: 'INTERVIEW',   cover: 'I shipped a similar booking system at $previous.' },
    { candidateIdx: 4, jobIdx: 11, status: 'UNDER_REVIEW',cover: 'Excited about the brand work you do.' },
    { candidateIdx: 4, jobIdx: 15, status: 'REJECTED',    cover: 'Thanks for considering me!' },
    { candidateIdx: 5, jobIdx: 28, status: 'APPLIED',     cover: 'Crew app sounds like exactly my kind of project.' },
  ];

  for (const a of APPLY) {
    const job = createdJobs[a.jobIdx];
    const cand = candidates[a.candidateIdx];
    if (!job || !cand) continue;
    await prisma.application.create({
      data: {
        jobId: job.id, candidateId: cand.id,
        status: a.status, coverLetter: a.cover,
      },
    });
  }

  // Saved jobs
  for (const [ci, ji] of [[0, 3], [0, 13], [1, 22], [2, 4], [4, 14], [5, 28]]) {
    if (!candidates[ci] || !createdJobs[ji]) continue;
    await prisma.savedJob.create({
      data: { candidateId: candidates[ci].id, jobId: createdJobs[ji].id },
    });
  }

  // A few notifications
  await prisma.notification.create({
    data: {
      userId: candidates[0].userId,
      type: 'APPLICATION_UPDATE',
      title: 'Your application advanced',
      message: 'Acme Corp moved your Senior React Engineer application to Under Review.',
      link: '/candidate/applications',
    },
  });
  await prisma.notification.create({
    data: {
      userId: candidates[2].userId,
      type: 'APPLICATION_UPDATE',
      title: '🎉 You got hired',
      message: 'Northwind Labs hired you for Research Engineer — LLM Evaluation.',
      link: '/candidate/applications',
    },
  });

  console.log('Seed complete.');
  console.log(`  ${COMPANIES.length} companies, ${EMPLOYERS.length} employers, ${CANDIDATES.length} candidates, ${JOBS.length} jobs`);
  console.log('Logins (password "Passw0rd!"):');
  console.log('  admin@jobportal.test (ADMIN)');
  console.log('  employer1@jobportal.test … employer8@jobportal.test');
  console.log('  candidate1@jobportal.test … candidate6@jobportal.test');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
