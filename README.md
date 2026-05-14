# JobPortal — Full-Stack Job Board

A LinkedIn-Jobs-style portal with separate experiences for **Candidates** and **Employers**, plus an **Admin** panel for moderation.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router + Axios + Context API
- **Backend**: Node.js + Express + Prisma ORM + JWT auth + Zod validation + Multer uploads
- **Database**: Microsoft SQL Server (Express) — inspected and managed via **SSMS 22**
- **Docs**: Swagger UI at `/api/docs`

## Project layout

```
.claude/launch.json         ← preview-tool config (optional)
.mssql-setup/setup.ps1      ← one-time admin script to configure SQL Server
backend/
  prisma/
    schema.prisma           ← Prisma data model (SQL Server)
    seed.js                 ← sample companies, employers, candidates, jobs
    migrations/             ← versioned migrations
  src/
    config/                 ← env + prisma client + swagger spec
    controllers/            ← route handlers, one file per domain
    middleware/             ← auth, errors, validation, file uploads
    routes/                 ← Express routers, mounted under /api/*
    utils/                  ← jwt, pagination, slug, asyncHandler
    server.js               ← entry point
  uploads/                  ← resumes / avatars / logos (gitignored)
  package.json, .env.example
frontend/
  src/
    api/                    ← axios client
    components/             ← Layout, JobCard, NotificationBell, …
    context/AuthContext.jsx
    pages/                  ← public + candidate/ + employer/ + admin/
    App.jsx, main.jsx, styles.css
  index.html, vite.config.js, tailwind.config.js, package.json
README.md
```

## Features

### Candidate
- Register / login (JWT), edit profile, upload resume + avatar
- Add education, experience, certifications, skills
- Browse jobs with server-side search/filter (keyword, location, company,
  mode, type, experience level, category, skill, salary range, date posted, sort)
- Apply with cover letter, save/bookmark jobs, withdraw applications
- Track application status (Applied → Under Review → Interview → Hired/Rejected)
- In-app notifications (new applications, status updates)

### Employer
- Register / login, manage company profile (logo, description, industry, size)
- Create / edit / delete job postings (skills, salary, deadline, status)
- View applicants per job with search and status filter
- Update applicant status, download resumes
- Analytics dashboard: total jobs, open jobs, applications, status breakdown,
  30-day trend chart, top jobs

### Admin
- Site-wide stats, manage users (enable/disable/soft-delete)
- Job moderation (close, remove, restore)

### Cross-cutting
- Role-based authorization middleware (`requireRole(...)`)
- Soft deletes on users, jobs, companies
- Indexes on common search columns
- Swagger OpenAPI spec at `/api/openapi.json`, UI at `/api/docs`
- Rate limiting, Helmet, CORS, bcrypt, parameterized queries via Prisma

## One-time SQL Server setup

Prerequisites: **SQL Server Express** and **SSMS 22** installed
(via `winget install Microsoft.SQLServer.2022.Express Microsoft.SQLServerManagementStudio.22`),
plus **Node.js 18+**.

The bundled `.mssql-setup/setup.ps1` does everything else for you. Run it from an **elevated PowerShell window** (Win → `powershell` → right-click → *Run as Administrator*):

```powershell
powershell -ExecutionPolicy Bypass -File "E:\Claude Project\.mssql-setup\setup.ps1"
```

It enables TCP/IP on port 1433, turns on mixed-mode auth, creates the
`jobportal` database, creates a `jobportal` SQL login, and grants it the
`dbcreator` and `securityadmin` roles (needed by Prisma during migrations).

Credentials provisioned:
- `sa` / `JobPortal!Secure123`
- `jobportal` / `jobportal` (`db_owner` on the `jobportal` database)

## Run the app

```powershell
# Backend
cd "E:\Claude Project\backend"
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev               # http://localhost:4000
```

```powershell
# Frontend (new terminal)
cd "E:\Claude Project\frontend"
npm install
npm run dev               # http://localhost:5173
```

API docs: http://localhost:4000/api/docs

## Inspect data with SSMS 22

1. Open **SQL Server Management Studio 22**
2. In the **Connect to Server** dialog:
   - **Server type**: Database Engine
   - **Server name**: `localhost,1433`  *(comma, not backslash)*
   - **Authentication**: SQL Server Authentication
   - **Login**: `sa`  **Password**: `JobPortal!Secure123`
   - Tick **Trust server certificate**
3. Expand **Databases → jobportal → Tables**

Example ad-hoc query (right-click `jobportal` → New Query):

```sql
SELECT TOP 10 j.title, c.name AS company, j.location, j.jobMode, j.salaryMin
FROM Job j JOIN Company c ON c.id = j.companyId
WHERE j.status = 'PUBLISHED' AND j.deletedAt IS NULL
ORDER BY j.createdAt DESC;
```

## Demo accounts (after running `npm run seed`)

Password for all: `Passw0rd!`

| Role      | Email                          |
|-----------|--------------------------------|
| Admin     | admin@jobportal.test           |
| Employer  | employer1@jobportal.test … employer8@jobportal.test |
| Candidate | candidate1@jobportal.test … candidate6@jobportal.test |

## Reset to a clean slate

If you've populated the demo data and want to start fresh — clear jobs,
applications, the seeded companies and employers — but keep the admin
and the candidate accounts:

```powershell
cd "E:\Claude Project\backend"
npm run reset:fresh
```

Then register a brand-new employer at `/register?role=employer`, set up
your own company, and post your own jobs.

## REST API summary

Auth + meta:
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/change-password
GET    /api/skills
GET    /api/companies
GET    /api/companies/:id
GET    /health
```

Jobs:
```
GET    /api/jobs                     filters: q, location, company, jobMode,
                                       jobType, experienceLevel, category,
                                       skill, salaryMin, salaryMax,
                                       postedSince, sort, page, pageSize
GET    /api/jobs/:id
GET    /api/jobs/mine                (employer)
POST   /api/jobs                     (employer)
PUT    /api/jobs/:id                 (employer)
DELETE /api/jobs/:id                 (employer)
```

Candidate:
```
GET    /api/candidates/me
PUT    /api/candidates/me
POST   /api/candidates/me/resume     (multipart/form-data, field: file)
POST   /api/candidates/me/avatar
PUT    /api/candidates/me/skills
POST   /api/candidates/me/education
DELETE /api/candidates/me/education/:id
POST   /api/candidates/me/experience
DELETE /api/candidates/me/experience/:id
POST   /api/candidates/me/certifications
DELETE /api/candidates/me/certifications/:id
POST   /api/candidates/me/saved-jobs/:jobId
DELETE /api/candidates/me/saved-jobs/:jobId
GET    /api/candidates/me/saved-jobs
```

Employer:
```
GET    /api/employers/me
PUT    /api/employers/me
POST   /api/employers/me/company
PUT    /api/employers/me/company
POST   /api/employers/me/company/logo
GET    /api/employers/me/stats
```

Applications:
```
POST   /api/applications/jobs/:jobId/apply  (candidate)
GET    /api/applications/me                 (candidate)
POST   /api/applications/:id/withdraw       (candidate)
GET    /api/applications/jobs/:jobId        (employer)
PATCH  /api/applications/:id/status         (employer)
```

Notifications:
```
GET    /api/notifications
GET    /api/notifications/unread-count
POST   /api/notifications/:id/read
POST   /api/notifications/read-all
```

Admin:
```
GET    /api/admin/stats
GET    /api/admin/users
PATCH  /api/admin/users/:id/active
DELETE /api/admin/users/:id
GET    /api/admin/jobs
POST   /api/admin/jobs/:id/moderate
```

## Database schema (high level)

```
User (1—1) Candidate / Employer
Employer (N—1) Company (1—N) Job
Job (M—N) Skill (M—N) Candidate
Application joins Job and Candidate (unique pair)
SavedJob, Education, Experience, Certification, Notification
```

Enums are emulated as `String` columns with documented allowed values (Prisma
doesn't support native SQL Server enums; validation happens at the API layer
via Zod). Indexes are declared on commonly filtered columns and on FK joins.

## Security

- Passwords hashed with **bcrypt** (cost 10)
- JWT access tokens (configurable expiry)
- Helmet secure headers
- CORS locked to `CLIENT_ORIGIN`
- `express-rate-limit` on all `/api` traffic
- Input validated with Zod; Prisma uses parameterized queries (no raw SQL)
- File uploads restricted by mimetype + size; stored under `uploads/{resumes|avatars|logos}`
- Role-based authorization via `requireRole(...)`
- Soft deletes on User, Job, Company

## Environment variables

Backend (`backend/.env`):
- `DATABASE_URL` — `sqlserver://localhost:1433;database=jobportal;user=jobportal;password=...;trustServerCertificate=true`
- `PORT` — default `4000`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN` — for CORS
- `UPLOAD_DIR`, `MAX_FILE_SIZE_MB`
- `RATE_LIMIT_WINDOW_MIN`, `RATE_LIMIT_MAX`

Frontend (`frontend/.env`):
- `VITE_API_BASE` — default `/api` (proxied to backend during dev)
- `VITE_API_PROXY` — backend URL for the dev proxy (default `http://localhost:4000`)

## Scripts

Backend:
- `npm run dev` — nodemon
- `npm start` — production
- `npm run prisma:migrate` — dev migration
- `npm run prisma:deploy` — production migration
- `npm run seed` — populate sample data

Frontend:
- `npm run dev`, `npm run build`, `npm run preview`
