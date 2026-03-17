# Workclaw — Schema Diff

## Overview

This document shows what changes to the Prisma schema from detask → workclaw.

---

## Models: KEEP (with extensions)

### User — EXTEND
```diff
model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  address   String   @unique
+ role      UserRole @default(CONTRIBUTOR)
+ tier      ContributorTier @default(NEW)
+ onboardingComplete Boolean @default(false)
+ kycStatus KYCStatus @default(NONE)

  profile   Profile?
  social    Social[]
  sessions  Session[]
  skills    SkillAssociation[]
  staffs    OrganizationStaff[]
- proposals Proposal[]
+ applications     Application[]
+ taskSubmissions  TaskSubmission[]
+ screeningAttempts ScreeningAttempt[]
+ contributorScores ContributorScore[]
+ reputationEvents ReputationEvent[]
+ payoutMethods    PayoutMethod[]
+ payouts          Payout[]
+ notifications    Notification[]
+ fraudFlags       FraudFlag[]
+ supportTickets   SupportTicket[]
}
```

**New enums:**
```prisma
enum UserRole {
  CONTRIBUTOR
  CUSTOMER
  REVIEWER
  ADMIN
}

enum ContributorTier {
  NEW
  VERIFIED
  SKILLED
  TRUSTED
  EXPERT
  ELITE_REVIEWER
}

enum KYCStatus {
  NONE
  PENDING
  VERIFIED
  REJECTED
}
```

### Profile — EXTEND
```diff
model Profile {
  // ... existing fields kept ...
+ cryptoExperienceLevel CryptoExperience?
+ chainsOfExpertise     String[]          // ["ethereum", "solana", "base"]
+ protocolsOfExpertise  String[]          // ["uniswap", "aave", "jupiter"]
+ codingLanguages       String[]          // ["solidity", "rust", "typescript"]
+ moderationExperience  Boolean @default(false)
+ researchExperience    Boolean @default(false)
+ fraudDetectionExperience Boolean @default(false)
+ languagesSpoken       String[]          // ["en", "es", "zh"]
+ timezone              String?
+ country               String?
+ farcaster             String?
+ ens                   String?
+ payoutEligibility     Boolean @default(false)
+ trustScore            Float @default(0)
+ reviewerScore         Float @default(0)
+ integrityScore        Float @default(100)
}
```

**New enum:**
```prisma
enum CryptoExperience {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}
```

### Social, Session, Skill, SkillAssociation, Organization, OrganizationStaff — KEEP
Minor changes only:
- SkillAssociation: add `projectId` FK (alongside existing `jobId` → rename to `projectId`)
- Organization: add `customerType CustomerType?`

---

## Models: RENAME / REWRITE

### Job → Project
```prisma
model Project {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orgId       String
  title       String   @db.VarChar(200)
  slug        String   @unique
  description String   @db.Text
  taskType    TaskType
  domain      String[]           // ["defi", "wallets", "security"]
  chainTags   String[]           // ["ethereum", "solana"]
  modelOrUseCase String?
  payModel    PayModel
  rateAmount  Decimal?           // hourly or per-task rate
  currency    Currency @default(USDC)
  difficulty  Difficulty @default(INTERMEDIATE)
  qualityThreshold Float @default(0.8)
  qualityBonusEligible Boolean @default(false)
  capacity    Int?               // max contributors
  taskVolume  Int?               // total tasks
  goldTaskRatio Float @default(0.05)
  startDate   DateTime?
  endDate     DateTime?
  status      ProjectStatus @default(DRAFT)
  visibility  ProjectVisibility @default(PUBLIC)
  regionLimits String[]
  languageLimits String[]
  requiredTier ContributorTier @default(NEW)
  reviewPolicy String?  @db.Text
  disputeRules String?  @db.Text
  payoutRules  String?  @db.Text

  organization Organization @relation(fields: [orgId], references: [id])
  skills       SkillAssociation[]
  requirements ProjectRequirement[]
  assignments  ProjectAssignment[]
  tasks        Task[]
  taskBatches  TaskBatch[]
  screenings   Screening[]
  reviewerAssignments ReviewerAssignment[]
}

enum TaskType {
  SINGLE_RESPONSE_RATING
  PAIRWISE_COMPARISON
  MULTI_RESPONSE_RANKING
  LABEL_CLASSIFICATION
  TEXT_ANNOTATION
  CODE_REVIEW
  FACTUALITY_VERIFICATION
  SAFETY_REVIEW
  SCAM_CLASSIFICATION
  CONTRACT_VALIDATION
  RESEARCH_GRADING
  AGENT_EVALUATION
  PROMPT_WRITING
  TRANSLATION_REVIEW
}

enum PayModel {
  PER_TASK
  HOURLY
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

enum ProjectStatus {
  DRAFT
  SCREENING_SETUP
  INVITE_ONLY
  OPEN
  PAUSED
  FULL
  ARCHIVED
}

enum ProjectVisibility {
  PUBLIC
  PRIVATE
  INVITE_ONLY
}

enum Currency {
  USDC
}
```

### Proposal → Application
```prisma
model Application {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  projectId String
  status    ApplicationStatus @default(PENDING)
  note      String?  @db.Text

  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])

  @@unique([userId, projectId])
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}
```

### Recruiter → ReviewerAssignment
```prisma
model ReviewerAssignment {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userId    String
  projectId String

  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])

  @@unique([userId, projectId])
}
```

---

## Models: NEW

### Task
```prisma
model Task {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  projectId   String
  batchId     String?
  taskType    TaskType
  data        Json              // polymorphic task content
  instructions String? @db.Text
  rubric      Json?             // scoring rubric
  examples    Json?             // example responses
  isGold      Boolean @default(false)
  goldAnswer  Json?             // expected answer for gold tasks
  status      TaskStatus @default(AVAILABLE)
  assignedTo  String?
  assignedAt  DateTime?
  dueAt       DateTime?
  priority    Int @default(0)

  project     Project  @relation(fields: [projectId], references: [id])
  batch       TaskBatch? @relation(fields: [batchId], references: [id])
  submissions TaskSubmission[]

  @@index([projectId, status])
  @@index([assignedTo, status])
}

enum TaskStatus {
  AVAILABLE
  ASSIGNED
  IN_PROGRESS
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  EXPIRED
}
```

### TaskBatch
```prisma
model TaskBatch {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  projectId   String
  name        String
  taskCount   Int @default(0)
  status      BatchStatus @default(PENDING)

  project Project @relation(fields: [projectId], references: [id])
  tasks   Task[]
}

enum BatchStatus {
  PENDING
  ACTIVE
  COMPLETED
  ARCHIVED
}
```

### TaskSubmission
```prisma
model TaskSubmission {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  taskId       String
  userId       String
  response     Json              // contributor's response
  confidence   Float?            // 0-1 confidence score
  reasoning    String? @db.Text
  timeSpent    Int?              // seconds
  isDraft      Boolean @default(true)
  submittedAt  DateTime?
  status       SubmissionStatus @default(DRAFT)

  task    Task @relation(fields: [taskId], references: [id])
  user    User @relation(fields: [userId], references: [id])
  reviews TaskReview[]

  @@unique([taskId, userId])
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  REVISION_REQUESTED
}
```

### TaskReview
```prisma
model TaskReview {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  submissionId String
  reviewerId   String
  verdict      ReviewVerdict
  score        Float?
  comments     String? @db.Text
  flags        String[]

  submission TaskSubmission @relation(fields: [submissionId], references: [id])
}

enum ReviewVerdict {
  APPROVED
  REJECTED
  REVISION_REQUESTED
  ESCALATED
}
```

### Screening
```prisma
model Screening {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  projectId     String?
  title         String
  description   String?  @db.Text
  domain        String
  passingScore  Float @default(0.7)
  maxAttempts   Int @default(3)
  timeLimitMins Int?
  status        ScreeningStatus @default(DRAFT)

  project   Project?  @relation(fields: [projectId], references: [id])
  questions ScreeningQuestion[]
  attempts  ScreeningAttempt[]
}

enum ScreeningStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}
```

### ScreeningQuestion
```prisma
model ScreeningQuestion {
  id          String   @id @default(cuid())
  screeningId String
  questionType QuestionType
  question    String   @db.Text
  options     Json?             // for MCQ
  correctAnswer Json?           // for auto-grading
  points      Float @default(1)
  order       Int

  screening Screening @relation(fields: [screeningId], references: [id])
}

enum QuestionType {
  MULTIPLE_CHOICE
  SHORT_ANSWER
  SCENARIO_BASED
  MANUAL_REVIEW
}
```

### ScreeningAttempt
```prisma
model ScreeningAttempt {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  screeningId String
  userId      String
  answers     Json
  score       Float?
  passed      Boolean?
  reviewedBy  String?
  completedAt DateTime?

  screening Screening @relation(fields: [screeningId], references: [id])
  user      User      @relation(fields: [userId], references: [id])
}
```

### ContributorScore
```prisma
model ContributorScore {
  id               String   @id @default(cuid())
  updatedAt        DateTime @updatedAt
  userId           String
  projectId        String?
  agreementScore   Float @default(0)
  goldTaskAccuracy Float @default(0)
  acceptanceRate   Float @default(0)
  consistencyScore Float @default(0)
  speedScore       Float @default(0)
  overallScore     Float @default(0)

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, projectId])
}
```

### ReputationEvent
```prisma
model ReputationEvent {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userId    String
  eventType String           // "tier_upgrade", "badge_earned", "score_change"
  details   Json
  scoreDelta Float @default(0)

  user User @relation(fields: [userId], references: [id])
}
```

### Payout
```prisma
model Payout {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  methodId    String?
  amount      Decimal
  currency    Currency @default(USDC)
  status      PayoutStatus @default(PENDING)
  txHash      String?
  batchId     String?
  processedAt DateTime?
  note        String?

  user   User         @relation(fields: [userId], references: [id])
  method PayoutMethod? @relation(fields: [methodId], references: [id])
  ledgerEntries PayoutLedgerEntry[]
}

enum PayoutStatus {
  PENDING
  APPROVED
  PROCESSING
  COMPLETED
  FAILED
  DISPUTED
  HELD
}
```

### PayoutMethod
```prisma
model PayoutMethod {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userId    String
  type      PayoutMethodType
  details   Json             // wallet address, etc.
  isPrimary Boolean @default(false)
  verified  Boolean @default(false)

  user    User     @relation(fields: [userId], references: [id])
  payouts Payout[]
}

enum PayoutMethodType {
  SOLANA_WALLET
  ETHEREUM_WALLET
  FIAT_PLACEHOLDER
  PAYPAL_PLACEHOLDER
}
```

### PayoutLedgerEntry
```prisma
model PayoutLedgerEntry {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userId    String
  payoutId  String?
  type      LedgerEntryType
  amount    Decimal
  currency  Currency @default(USDC)
  reference String?           // task ID, bonus ID, etc.
  note      String?

  payout Payout? @relation(fields: [payoutId], references: [id])

  @@index([userId, createdAt])
}

enum LedgerEntryType {
  TASK_EARNING
  BONUS
  STREAK_INCENTIVE
  QUALITY_BONUS
  REFERRAL_CREDIT
  MANUAL_ADJUSTMENT
  PAYOUT_DEBIT
  REVERSAL
  HOLD
}
```

### Dispute
```prisma
model Dispute {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  raisedBy    String
  type        DisputeType
  referenceId String           // task, payout, or review ID
  reason      String   @db.Text
  status      DisputeStatus @default(OPEN)
  resolution  String?  @db.Text
  resolvedBy  String?
  resolvedAt  DateTime?
}

enum DisputeType {
  TASK_REVIEW
  PAYOUT
  ACCOUNT
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED
  DISMISSED
}
```

### Notification
```prisma
model Notification {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userId    String
  type      String           // "new_project_match", "payout_sent", etc.
  title     String
  body      String?
  data      Json?
  read      Boolean @default(false)
  readAt    DateTime?

  user User @relation(fields: [userId], references: [id])

  @@index([userId, read, createdAt])
}
```

### Announcement
```prisma
model Announcement {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  title     String
  body      String   @db.Text
  active    Boolean @default(true)
  expiresAt DateTime?
  createdBy String
}
```

### FraudFlag
```prisma
model FraudFlag {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userId    String
  type      String           // "speed_anomaly", "duplicate_account", etc.
  severity  FraudSeverity
  details   Json
  status    FraudFlagStatus @default(OPEN)
  resolvedBy String?
  resolvedAt DateTime?

  user User @relation(fields: [userId], references: [id])
}

enum FraudSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum FraudFlagStatus {
  OPEN
  INVESTIGATING
  CONFIRMED
  DISMISSED
}
```

### AuditLog
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  actorId   String
  action    String
  target    String
  targetId  String
  details   Json?
  ipAddress String?

  @@index([actorId, createdAt])
  @@index([target, targetId])
}
```

### SupportTicket
```prisma
model SupportTicket {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  subject   String
  body      String   @db.Text
  status    TicketStatus @default(OPEN)
  priority  TicketPriority @default(NORMAL)

  user User @relation(fields: [userId], references: [id])
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```
