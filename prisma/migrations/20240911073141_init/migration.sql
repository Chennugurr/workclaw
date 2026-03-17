-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHERS', 'UNDEFINED');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "Education" AS ENUM ('HIGH_SCHOOL', 'ASSOCIATE_DEGREE', 'BACHELOR_DEGREE', 'MASTER_DEGREE', 'DOCTORATE', 'PROFESSIONAL_CERTIFICATION', 'VOCATIONAL_TRAINING', 'OTHER');

-- CreateEnum
CREATE TYPE "Experience" AS ENUM ('INTERNSHIP', 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'MANAGEMENT', 'DIRECTOR', 'EXECUTIVE', 'CONSULTANT', 'FREELANCE');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('TWITTER', 'LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'GITHUB', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "SocialOwnerType" AS ENUM ('USER', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "SkillOwnerType" AS ENUM ('USER', 'JOB');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('STARTUP', 'SMALL_BUSINESS', 'CORPORATION', 'NON_PROFIT', 'GOVERNMENT', 'EDUCATIONAL', 'HEALTHCARE', 'FINTECH', 'ECOMMERCE', 'TECHNOLOGY', 'CONSULTING', 'OTHER');

-- CreateEnum
CREATE TYPE "OrganizationTeamSize" AS ENUM ('ONE_TO_TEN', 'ELEVEN_TO_FIFTY', 'FIFTY_ONE_TO_TWO_HUNDRED', 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED', 'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND', 'OVER_ONE_THOUSAND');

-- CreateEnum
CREATE TYPE "OrganizationStaffRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "JobCurrency" AS ENUM ('USDC');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "JobPosition" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('APPLIED', 'WITHDRAWN', 'SHORTLISTED', 'ARCHIVED', 'HIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "middleName" VARCHAR(50),
    "lastName" VARCHAR(50) NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "location" TEXT,
    "nationality" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "maritalStatus" "MaritalStatus",
    "education" "Education",
    "experience" "Experience",
    "availability" "Availability" NOT NULL DEFAULT 'AVAILABLE',
    "bio" TEXT,
    "pfp" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socials" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "userId" TEXT,
    "orgId" TEXT,
    "platform" "SocialPlatform" NOT NULL,
    "handleOrUrl" TEXT NOT NULL,
    "ownerType" "SocialOwnerType" NOT NULL,

    CONSTRAINT "socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "deviceInfo" JSONB,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_associations" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "jobId" TEXT,
    "skillId" TEXT NOT NULL,
    "level" "ExperienceLevel" NOT NULL,
    "ownerType" "SkillOwnerType" NOT NULL,

    CONSTRAINT "skill_associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "location" TEXT,
    "foundedIn" TIMESTAMP(3),
    "type" "OrganizationType" NOT NULL,
    "teamSize" "OrganizationTeamSize" NOT NULL,
    "bio" TEXT,
    "logo" TEXT,
    "banner" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_staffs" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "OrganizationStaffRole" NOT NULL,

    CONSTRAINT "organization_staffs_pkey" PRIMARY KEY ("userId","orgId")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "budget" MONEY NOT NULL,
    "currency" "JobCurrency" NOT NULL DEFAULT 'USDC',
    "duration" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "position" "JobPosition" NOT NULL,
    "experience" "ExperienceLevel" NOT NULL,
    "location" VARCHAR(255) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiters" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "staffId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "recruiters_pkey" PRIMARY KEY ("staffId","jobId")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "budget" MONEY,
    "statement" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'APPLIED',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("userId","jobId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_accessToken_key" ON "sessions"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_status_expiresAt_lastSeenAt_idx" ON "sessions"("userId", "status", "expiresAt", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skills_name_idx" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skill_associations_level_idx" ON "skill_associations"("level");

-- CreateIndex
CREATE UNIQUE INDEX "skill_associations_userId_skillId_key" ON "skill_associations"("userId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_associations_jobId_skillId_key" ON "skill_associations"("jobId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE INDEX "organizations_name_idx" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organization_staffs_id_key" ON "organization_staffs"("id");

-- CreateIndex
CREATE INDEX "jobs_createdAt_updatedAt_orgId_budget_duration_status_posit_idx" ON "jobs"("createdAt", "updatedAt", "orgId", "budget", "duration", "status", "position", "experience");

-- CreateIndex
CREATE UNIQUE INDEX "recruiters_id_key" ON "recruiters"("id");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_id_key" ON "proposals"("id");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_associations" ADD CONSTRAINT "skill_associations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_associations" ADD CONSTRAINT "skill_associations_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_associations" ADD CONSTRAINT "skill_associations_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_staffs" ADD CONSTRAINT "organization_staffs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_staffs" ADD CONSTRAINT "organization_staffs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "organization_staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
