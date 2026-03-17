# Migration Map

## Legend

| Decision | Meaning |
|----------|---------|
| **KEEP** | Use as-is or with minor updates |
| **EXTEND** | Keep and add significant new fields/logic |
| **MERGE** | Combine with another component |
| **REWRITE** | Replace with new implementation |
| **REMOVE** | Delete, no longer needed |
| **NEW** | Does not exist yet, must be built |

---

## Pages

| Old Page/Route | New Page/Route | Decision | Rationale |
|----------------|----------------|----------|-----------|
| `/` (landing) | `/` (marketing site) | REWRITE | New product positioning — AI work platform, not freelancing |
| `/app` (role selector) | `/app` (role selector) | EXTEND | Add reviewer and admin roles |
| `/app/c/dashboard` | `/app/contributor/dashboard` | REWRITE | New dashboard with task-centric widgets, earnings, quality scores |
| `/app/c/jobs` | `/app/contributor/opportunities` | REWRITE | Opportunities browsing with skill matching, not job board |
| `/app/c/jobs/[id]` | `/app/contributor/opportunities/[id]` | REWRITE | Opportunity detail with requirements, screening gates |
| `/app/c/applied` | `/app/contributor/my-tasks` | REWRITE | Active task list, not proposal tracking |
| `/app/c/employers` | — | REMOVE | Contributors don't browse customers directly |
| `/app/c/employers/[id]` | — | REMOVE | Not needed |
| `/app/c/alerts` | `/app/contributor/notifications` | REWRITE | Notification center |
| `/app/c/favorites` | — | REMOVE | Not applicable to task-based work |
| `/app/c/settings/*` | `/app/contributor/settings/*` | EXTEND | Add payout methods, availability, expertise |
| `/app/c/settings/profile` | `/app/contributor/profile` | EXTEND | Expertise profile with chains, protocols, languages, proofs |
| `/app/e/dashboard` | `/app/customer/dashboard` | REWRITE | Project management dashboard, throughput, costs |
| `/app/e/jobs` | `/app/customer/projects` | REWRITE | Project list with lifecycle states |
| `/app/e/jobs/new` | `/app/customer/projects/new` | REWRITE | Project creation wizard |
| `/app/e/jobs/[id]` | `/app/customer/projects/[id]` | REWRITE | Project detail with analytics |
| `/app/e/jobs/[id]/edit` | `/app/customer/projects/[id]/settings` | REWRITE | Project configuration |
| `/app/e/jobs/[id]/applications` | `/app/customer/projects/[id]/contributors` | REWRITE | Contributor pool management |
| `/app/e/candidates` | — | REMOVE | Customers don't browse contributors directly |
| `/app/e/candidates/[id]` | — | REMOVE | Not needed |
| `/app/e/saved` | — | REMOVE | Not applicable |
| `/app/e/settings/*` | `/app/customer/settings/*` | EXTEND | Billing, team, org settings |
| — | `/app/contributor/screenings` | NEW | Screening tests hub |
| — | `/app/contributor/earnings` | NEW | Earnings & payout history |
| — | `/app/contributor/task/[id]` | NEW | Task workspace (the core work UI) |
| — | `/app/reviewer/dashboard` | NEW | Reviewer queue and tools |
| — | `/app/reviewer/queue` | NEW | Submission review queue |
| — | `/app/admin/*` | NEW | Full admin backoffice |
| — | `/how-it-works` | NEW | Public explainer page |
| — | `/for-contributors` | NEW | Contributor CTA page |
| — | `/for-customers` | NEW | Customer CTA page |
| — | `/trust-and-safety` | NEW | Trust & safety page |

---

## API Routes

| Old Endpoint | New Endpoint | Decision | Rationale |
|-------------|-------------|----------|-----------|
| `POST /api/auth/siws` | `POST /api/auth/siws` | KEEP | Core auth unchanged |
| `POST /api/auth/refresh-token` | `POST /api/auth/refresh-token` | KEEP | Token refresh unchanged |
| `GET /api/auth/whoami` | `GET /api/auth/whoami` | EXTEND | Add role, tier, screening status |
| `GET/PATCH /api/users/[id]/profile` | `GET/PATCH /api/users/[id]/profile` | EXTEND | Add contributor-specific fields |
| `*/api/users/[id]/skills` | `*/api/users/[id]/skills` | KEEP | Skills system reusable |
| `POST /api/orgs` | `POST /api/orgs` | KEEP | Org creation works |
| `*/api/orgs/[orgId]` | `*/api/orgs/[orgId]` | EXTEND | Add customer-specific fields |
| `*/api/orgs/[orgId]/jobs/*` | `*/api/orgs/[orgId]/projects/*` | REWRITE | New project model and logic |
| `*/api/orgs/[orgId]/jobs/[id]/proposals/*` | — | REMOVE | Replaced by application/assignment system |
| `*/api/orgs/[orgId]/jobs/[id]/recruiters/*` | — | REMOVE | Replaced by reviewer assignments |
| `GET /api/search/*` | `GET /api/search/*` | EXTEND | New search targets (projects, tasks) |
| `GET /api/analytics/*` | `GET /api/analytics/*` | REWRITE | New metrics model |
| `GET /api/skills` | `GET /api/skills` | KEEP | Skill taxonomy reusable |
| — | `*/api/projects/*` | NEW | Project CRUD, lifecycle |
| — | `*/api/tasks/*` | NEW | Task engine endpoints |
| — | `*/api/screenings/*` | NEW | Screening engine endpoints |
| — | `*/api/reviews/*` | NEW | Review/QA endpoints |
| — | `*/api/payouts/*` | NEW | Payout ledger endpoints |
| — | `*/api/reputation/*` | NEW | Reputation/badge endpoints |
| — | `*/api/notifications/*` | NEW | Notification endpoints |
| — | `*/api/admin/*` | NEW | Admin backoffice endpoints |

---

## Components

| Old Component | New Component | Decision | Rationale |
|--------------|--------------|----------|-----------|
| 47 shadcn/ui components | Same | KEEP | Reusable primitives |
| `AuthGuard` | `AuthGuard` | EXTEND | Add role-based guards (contributor, customer, reviewer, admin) |
| `JobForm` | `ProjectForm` | REWRITE | Different fields, task types, requirements |
| `OrganizationSwitcher` | `OrganizationSwitcher` | KEEP | Works as-is for customers |
| `MdxEditor` | `MdxEditor` | KEEP | Useful for project descriptions, task instructions |
| `FeatureComingSoon` | `FeatureComingSoon` | KEEP | Still needed during build |
| `JobPositionBadge` | — | REMOVE | No position types in new model |
| `JobStatusBadge` | `ProjectStatusBadge` | REWRITE | New lifecycle states |
| `ProposalStatusBadge` | `ApplicationStatusBadge` | REWRITE | New statuses |
| `Pagination` | `Pagination` | KEEP | Reusable |
| `MVPBanner` | — | REMOVE | Replace with new branding |
| — | `TaskWorkspace` | NEW | Core task completion UI |
| — | `ScreeningTest` | NEW | Screening test UI |
| — | `ReviewQueue` | NEW | Reviewer tools |
| — | `EarningsWidget` | NEW | Earnings display |
| — | `QualityScoreCard` | NEW | Quality metrics display |
| — | `OpportunityCard` | NEW | Opportunity listing card |
| — | `ContributorLevelBadge` | NEW | Reputation level display |
| — | `TaskTimer` | NEW | Task timing component |
| — | `RubricPanel` | NEW | Task rubric display |
| — | `InstructionsPanel` | NEW | Task instructions display |

---

## Database Models (Prisma)

| Old Model | New Model | Decision | Rationale |
|-----------|-----------|----------|-----------|
| `User` | `User` | EXTEND | Add role, tier, contributorLevel fields |
| `Profile` | `Profile` | EXTEND | Add crypto experience, chains, protocols, languages, payout eligibility |
| `Social` | `Social` | KEEP | Works as-is |
| `Session` | `Session` | KEEP | Works as-is |
| `Skill` | `Skill` | EXTEND | Add categories (chain, domain, language) |
| `SkillAssociation` | `SkillAssociation` | EXTEND | Add project associations |
| `Organization` | `Organization` | EXTEND | Add customer type, billing fields |
| `OrganizationStaff` | `OrganizationStaff` | KEEP | Works as-is |
| `Job` | `Project` | REWRITE | Completely different model |
| `Recruiter` | `ReviewerAssignment` | REWRITE | Different relationship model |
| `Proposal` | `Application` | REWRITE | Different fields and lifecycle |
| — | `Screening` | NEW | Screening test definitions |
| — | `ScreeningAttempt` | NEW | User screening attempts |
| — | `ScreeningQuestion` | NEW | Screening questions |
| — | `Task` | NEW | Individual task items |
| — | `TaskBatch` | NEW | Groups of tasks |
| — | `TaskSubmission` | NEW | Contributor task responses |
| — | `TaskReview` | NEW | QA reviews of submissions |
| — | `GoldTask` | NEW | Benchmark/calibration tasks |
| — | `ContributorScore` | NEW | Quality and reputation scores |
| — | `ReputationEvent` | NEW | Score change history |
| — | `Payout` | NEW | Payout records |
| — | `PayoutMethod` | NEW | Contributor payout methods |
| — | `PayoutLedgerEntry` | NEW | Auditable ledger |
| — | `Dispute` | NEW | Dispute records |
| — | `Notification` | NEW | Notification records |
| — | `Announcement` | NEW | Admin announcements |
| — | `FraudFlag` | NEW | Fraud detection flags |
| — | `AuditLog` | NEW | System audit trail |
| — | `SupportTicket` | NEW | Support tickets |

---

## Store / State

| Old | New | Decision | Rationale |
|-----|-----|----------|-----------|
| Zustand store (auth, user, org) | Zustand store | EXTEND | Add active task, earnings, notifications state |
| `dispatch.js` actions | Dispatch actions | EXTEND | Add task, screening, payout actions |
| `constants.js` | Constants | EXTEND | Add new status enums, action types |

---

## Smart Contract

| Component | Decision | Rationale |
|-----------|----------|-----------|
| `initialize` | KEEP | Config setup works |
| `deposit` | EXTEND | Map to project funding by customers |
| `release_by_client` | KEEP | Maps to payout after task approval |
| `release_by_provider` | KEEP | Maps to contributor-initiated refund |
| `release_by_admin` | KEEP | Maps to dispute resolution |
| `set_fee` | KEEP | Platform fee management |
| `ownership transfer` | KEEP | Admin control |
| Job accounts | EXTEND | May need batch payout support |

---

## Infrastructure

| Component | Decision | Rationale |
|-----------|----------|-----------|
| `Dockerfile` | EXTEND | May need additional services |
| `docker-compose.yml` | EXTEND | Add services as needed |
| `.env.example` | EXTEND | Add new env vars |
| `next.config.mjs` | KEEP | Turbopack, config fine |
| `prisma/schema.prisma` | EXTEND | Major schema additions |
| `tailwind.config.js` | EXTEND | Add new design tokens |
| `eslint.config.mjs` | KEEP | Linting config fine |
