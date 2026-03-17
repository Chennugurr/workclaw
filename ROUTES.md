# Workclaw — Routes

## Public Routes

| Route | Page | Status |
|-------|------|--------|
| `/` | Marketing home (hero, how it works, task types, CTAs) | REWRITE |
| `/how-it-works` | Step-by-step explainer | NEW |
| `/opportunities` | Public opportunities listing (preview) | NEW |
| `/for-contributors` | Contributor value prop + signup CTA | NEW |
| `/for-customers` | Customer value prop + contact CTA | NEW |
| `/faq` | Frequently asked questions | NEW |
| `/trust-and-safety` | Trust & safety policies | NEW |
| `/terms` | Terms of service (placeholder) | NEW |
| `/privacy` | Privacy policy (placeholder) | NEW |
| `/sign-in` | Wallet connect sign-in | REWRITE (from landing) |
| `/sign-up` | New user registration flow | REWRITE (from landing) |

## Contributor Routes (`/app/contributor/`)

| Route | Page | Status |
|-------|------|--------|
| `/app/contributor/dashboard` | Overview: earnings, tasks, quality, screenings, announcements | REWRITE |
| `/app/contributor/opportunities` | Browse available projects with filters | REWRITE |
| `/app/contributor/opportunities/[id]` | Opportunity detail, requirements, apply/start | REWRITE |
| `/app/contributor/my-tasks` | Active and completed tasks | NEW |
| `/app/contributor/task/[id]` | Task workspace (instructions, rubric, work area, submit) | NEW |
| `/app/contributor/screenings` | Available and completed screenings | NEW |
| `/app/contributor/screenings/[id]` | Take a screening test | NEW |
| `/app/contributor/earnings` | Earnings history, pending, paid, charts | NEW |
| `/app/contributor/reviews` | Review feedback on submitted tasks | NEW |
| `/app/contributor/notifications` | Notification center | NEW |
| `/app/contributor/profile` | Expertise profile (public-facing) | EXTEND |
| `/app/contributor/settings` | Settings hub | EXTEND |
| `/app/contributor/settings/account` | Account settings | EXTEND |
| `/app/contributor/settings/payout` | Payout method configuration | NEW |
| `/app/contributor/settings/availability` | Availability & preferences | NEW |
| `/app/contributor/support` | Support tickets | NEW |

## Customer Routes (`/app/customer/`)

| Route | Page | Status |
|-------|------|--------|
| `/app/customer/dashboard` | Project overview, throughput, cost analytics | REWRITE |
| `/app/customer/projects` | Project list with lifecycle states | REWRITE |
| `/app/customer/projects/new` | Project creation wizard | REWRITE |
| `/app/customer/projects/[id]` | Project detail + analytics | REWRITE |
| `/app/customer/projects/[id]/settings` | Project configuration | REWRITE |
| `/app/customer/projects/[id]/contributors` | Contributor pool for project | NEW |
| `/app/customer/projects/[id]/tasks` | Task batch management | NEW |
| `/app/customer/projects/[id]/results` | Results & export | NEW |
| `/app/customer/projects/[id]/quality` | Quality dashboard | NEW |
| `/app/customer/billing` | Billing & payout settings | NEW |
| `/app/customer/team` | Team/staff management | EXTEND |
| `/app/customer/settings` | Organization settings | EXTEND |

## Reviewer Routes (`/app/reviewer/`)

| Route | Page | Status |
|-------|------|--------|
| `/app/reviewer/dashboard` | Review overview, queue stats | NEW |
| `/app/reviewer/queue` | Submission review queue | NEW |
| `/app/reviewer/queue/[submissionId]` | Review a submission | NEW |
| `/app/reviewer/calibration` | Calibration task queue | NEW |
| `/app/reviewer/disputes` | Dispute queue | NEW |
| `/app/reviewer/stats` | Reviewer performance stats | NEW |

## Admin Routes (`/app/admin/`)

| Route | Page | Status |
|-------|------|--------|
| `/app/admin/overview` | Platform health dashboard | NEW |
| `/app/admin/users` | User management | NEW |
| `/app/admin/contributors` | Contributor management | NEW |
| `/app/admin/customers` | Customer/org management | NEW |
| `/app/admin/projects` | Project management | NEW |
| `/app/admin/tasks` | Task queue management | NEW |
| `/app/admin/reviews` | Review queue management | NEW |
| `/app/admin/screenings` | Screening management | NEW |
| `/app/admin/payouts` | Payout management | NEW |
| `/app/admin/disputes` | Dispute management | NEW |
| `/app/admin/fraud` | Fraud & risk dashboard | NEW |
| `/app/admin/announcements` | Announcement management | NEW |
| `/app/admin/settings` | Platform settings, feature flags | NEW |

## API Routes

### Auth
| Method | Route | Status |
|--------|-------|--------|
| POST | `/api/auth/siws` | KEEP |
| POST | `/api/auth/refresh-token` | KEEP |
| GET | `/api/auth/whoami` | EXTEND |

### Users & Profiles
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/users/[id]` | KEEP |
| GET/PATCH | `/api/users/[id]/profile` | EXTEND |
| GET/POST | `/api/users/[id]/skills` | KEEP |
| DELETE | `/api/users/[id]/skills/[skillId]` | KEEP |

### Organizations
| Method | Route | Status |
|--------|-------|--------|
| POST | `/api/orgs` | KEEP |
| GET/PATCH | `/api/orgs/[orgId]` | EXTEND |
| GET/DELETE | `/api/orgs/[orgId]/staffs/[userId]` | KEEP |

### Projects (replaces Jobs)
| Method | Route | Status |
|--------|-------|--------|
| GET/POST | `/api/orgs/[orgId]/projects` | NEW |
| GET/PATCH | `/api/orgs/[orgId]/projects/[projectId]` | NEW |
| GET/POST | `/api/orgs/[orgId]/projects/[projectId]/tasks` | NEW |
| GET/POST | `/api/orgs/[orgId]/projects/[projectId]/requirements` | NEW |

### Tasks
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/tasks/available` | NEW |
| GET | `/api/tasks/[taskId]` | NEW |
| POST | `/api/tasks/[taskId]/submit` | NEW |
| PATCH | `/api/tasks/[taskId]/save-draft` | NEW |

### Screenings
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/screenings` | NEW |
| GET | `/api/screenings/[screeningId]` | NEW |
| POST | `/api/screenings/[screeningId]/attempt` | NEW |
| GET | `/api/screenings/[screeningId]/results` | NEW |

### Reviews
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/reviews/queue` | NEW |
| GET | `/api/reviews/[submissionId]` | NEW |
| POST | `/api/reviews/[submissionId]/verdict` | NEW |

### Payouts
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/payouts/earnings` | NEW |
| GET | `/api/payouts/history` | NEW |
| GET/POST | `/api/payouts/methods` | NEW |
| POST | `/api/payouts/request` | NEW |

### Reputation
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/reputation/[userId]` | NEW |
| GET | `/api/reputation/[userId]/badges` | NEW |

### Search
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/search/contributors` | RENAME (from candidates) |
| GET | `/api/search/projects` | RENAME (from jobs) |
| GET | `/api/search/orgs` | KEEP |
| GET | `/api/search/skills` | KEEP |

### Analytics
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/analytics/contributor/[id]` | REWRITE |
| GET | `/api/analytics/project/[id]` | REWRITE |
| GET | `/api/analytics/org/[id]` | REWRITE |
| GET | `/api/analytics/platform` | REWRITE |

### Notifications
| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/notifications` | NEW |
| PATCH | `/api/notifications/[id]/read` | NEW |

### Admin
| Method | Route | Status |
|--------|-------|--------|
| GET/PATCH | `/api/admin/users/[id]` | NEW |
| GET/POST | `/api/admin/projects/[id]` | NEW |
| GET/POST | `/api/admin/payouts/batch` | NEW |
| GET | `/api/admin/fraud/flags` | NEW |
| POST | `/api/admin/announcements` | NEW |
