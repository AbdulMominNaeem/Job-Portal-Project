BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(190) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(20) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [User_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Candidate] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [fullName] NVARCHAR(1000) NOT NULL,
    [headline] NVARCHAR(1000),
    [bio] NVARCHAR(max),
    [phone] NVARCHAR(1000),
    [location] NVARCHAR(190),
    [profilePic] NVARCHAR(1000),
    [resumeUrl] NVARCHAR(1000),
    [websiteUrl] NVARCHAR(1000),
    [linkedinUrl] NVARCHAR(1000),
    [githubUrl] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Candidate_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Candidate_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Candidate_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Employer] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [fullName] NVARCHAR(1000) NOT NULL,
    [jobTitle] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [companyId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Employer_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Employer_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Employer_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Company] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(190) NOT NULL,
    [slug] NVARCHAR(190) NOT NULL,
    [description] NVARCHAR(max),
    [website] NVARCHAR(1000),
    [logoUrl] NVARCHAR(1000),
    [industry] NVARCHAR(190),
    [size] NVARCHAR(1000),
    [location] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Company_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [Company_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Company_name_key] UNIQUE NONCLUSTERED ([name]),
    CONSTRAINT [Company_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[Skill] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(190) NOT NULL,
    [slug] NVARCHAR(190) NOT NULL,
    CONSTRAINT [Skill_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Skill_name_key] UNIQUE NONCLUSTERED ([name]),
    CONSTRAINT [Skill_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[CandidateSkill] (
    [candidateId] INT NOT NULL,
    [skillId] INT NOT NULL,
    [level] NVARCHAR(1000),
    CONSTRAINT [CandidateSkill_pkey] PRIMARY KEY CLUSTERED ([candidateId],[skillId])
);

-- CreateTable
CREATE TABLE [dbo].[JobSkill] (
    [jobId] INT NOT NULL,
    [skillId] INT NOT NULL,
    [required] BIT NOT NULL CONSTRAINT [JobSkill_required_df] DEFAULT 1,
    CONSTRAINT [JobSkill_pkey] PRIMARY KEY CLUSTERED ([jobId],[skillId])
);

-- CreateTable
CREATE TABLE [dbo].[Education] (
    [id] INT NOT NULL IDENTITY(1,1),
    [candidateId] INT NOT NULL,
    [school] NVARCHAR(1000) NOT NULL,
    [degree] NVARCHAR(1000),
    [fieldOfStudy] NVARCHAR(1000),
    [startDate] DATETIME2,
    [endDate] DATETIME2,
    [description] NVARCHAR(max),
    CONSTRAINT [Education_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Experience] (
    [id] INT NOT NULL IDENTITY(1,1),
    [candidateId] INT NOT NULL,
    [company] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [location] NVARCHAR(1000),
    [startDate] DATETIME2,
    [endDate] DATETIME2,
    [current] BIT NOT NULL CONSTRAINT [Experience_current_df] DEFAULT 0,
    [description] NVARCHAR(max),
    CONSTRAINT [Experience_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Certification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [candidateId] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [issuer] NVARCHAR(1000),
    [issuedAt] DATETIME2,
    [expiresAt] DATETIME2,
    [credentialUrl] NVARCHAR(1000),
    CONSTRAINT [Certification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Job] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(190) NOT NULL,
    [slug] NVARCHAR(190) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [category] NVARCHAR(190),
    [location] NVARCHAR(190),
    [jobMode] NVARCHAR(20) NOT NULL CONSTRAINT [Job_jobMode_df] DEFAULT 'ONSITE',
    [jobType] NVARCHAR(20) NOT NULL CONSTRAINT [Job_jobType_df] DEFAULT 'FULL_TIME',
    [experienceLevel] NVARCHAR(20) NOT NULL CONSTRAINT [Job_experienceLevel_df] DEFAULT 'MID',
    [salaryMin] INT,
    [salaryMax] INT,
    [currency] NVARCHAR(10) NOT NULL CONSTRAINT [Job_currency_df] DEFAULT 'USD',
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [Job_status_df] DEFAULT 'PUBLISHED',
    [applicationDeadline] DATETIME2,
    [companyId] INT NOT NULL,
    [postedById] INT NOT NULL,
    [views] INT NOT NULL CONSTRAINT [Job_views_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Job_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [Job_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Job_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[Application] (
    [id] INT NOT NULL IDENTITY(1,1),
    [jobId] INT NOT NULL,
    [candidateId] INT NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [Application_status_df] DEFAULT 'APPLIED',
    [coverLetter] NVARCHAR(max),
    [resumeUrl] NVARCHAR(1000),
    [notes] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Application_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Application_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Application_jobId_candidateId_key] UNIQUE NONCLUSTERED ([jobId],[candidateId])
);

-- CreateTable
CREATE TABLE [dbo].[SavedJob] (
    [candidateId] INT NOT NULL,
    [jobId] INT NOT NULL,
    [savedAt] DATETIME2 NOT NULL CONSTRAINT [SavedJob_savedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [SavedJob_pkey] PRIMARY KEY CLUSTERED ([candidateId],[jobId])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [type] NVARCHAR(40) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(max) NOT NULL,
    [link] NVARCHAR(1000),
    [read] BIT NOT NULL CONSTRAINT [Notification_read_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_role_idx] ON [dbo].[User]([role]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Candidate_location_idx] ON [dbo].[Candidate]([location]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Company_name_idx] ON [dbo].[Company]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Company_industry_idx] ON [dbo].[Company]([industry]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CandidateSkill_skillId_idx] ON [dbo].[CandidateSkill]([skillId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [JobSkill_skillId_idx] ON [dbo].[JobSkill]([skillId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Job_title_idx] ON [dbo].[Job]([title]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Job_location_idx] ON [dbo].[Job]([location]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Job_category_idx] ON [dbo].[Job]([category]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Job_status_idx] ON [dbo].[Job]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Job_jobMode_idx] ON [dbo].[Job]([jobMode]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Job_jobType_idx] ON [dbo].[Job]([jobType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Job_experienceLevel_idx] ON [dbo].[Job]([experienceLevel]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Application_status_idx] ON [dbo].[Application]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [SavedJob_jobId_idx] ON [dbo].[SavedJob]([jobId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notification_userId_read_idx] ON [dbo].[Notification]([userId], [read]);

-- AddForeignKey
ALTER TABLE [dbo].[Candidate] ADD CONSTRAINT [Candidate_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Employer] ADD CONSTRAINT [Employer_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Employer] ADD CONSTRAINT [Employer_companyId_fkey] FOREIGN KEY ([companyId]) REFERENCES [dbo].[Company]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CandidateSkill] ADD CONSTRAINT [CandidateSkill_candidateId_fkey] FOREIGN KEY ([candidateId]) REFERENCES [dbo].[Candidate]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CandidateSkill] ADD CONSTRAINT [CandidateSkill_skillId_fkey] FOREIGN KEY ([skillId]) REFERENCES [dbo].[Skill]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[JobSkill] ADD CONSTRAINT [JobSkill_jobId_fkey] FOREIGN KEY ([jobId]) REFERENCES [dbo].[Job]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[JobSkill] ADD CONSTRAINT [JobSkill_skillId_fkey] FOREIGN KEY ([skillId]) REFERENCES [dbo].[Skill]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Education] ADD CONSTRAINT [Education_candidateId_fkey] FOREIGN KEY ([candidateId]) REFERENCES [dbo].[Candidate]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Experience] ADD CONSTRAINT [Experience_candidateId_fkey] FOREIGN KEY ([candidateId]) REFERENCES [dbo].[Candidate]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Certification] ADD CONSTRAINT [Certification_candidateId_fkey] FOREIGN KEY ([candidateId]) REFERENCES [dbo].[Candidate]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Job] ADD CONSTRAINT [Job_companyId_fkey] FOREIGN KEY ([companyId]) REFERENCES [dbo].[Company]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Job] ADD CONSTRAINT [Job_postedById_fkey] FOREIGN KEY ([postedById]) REFERENCES [dbo].[Employer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Application] ADD CONSTRAINT [Application_jobId_fkey] FOREIGN KEY ([jobId]) REFERENCES [dbo].[Job]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Application] ADD CONSTRAINT [Application_candidateId_fkey] FOREIGN KEY ([candidateId]) REFERENCES [dbo].[Candidate]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SavedJob] ADD CONSTRAINT [SavedJob_candidateId_fkey] FOREIGN KEY ([candidateId]) REFERENCES [dbo].[Candidate]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SavedJob] ADD CONSTRAINT [SavedJob_jobId_fkey] FOREIGN KEY ([jobId]) REFERENCES [dbo].[Job]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
