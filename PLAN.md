# Workclaw — Execution Plan

## Phase 1: Rebrand & Information Architecture

**Goal:** Transform the app from a freelancing marketplace into an AI training work platform at the structural level. After this phase the app should boot, auth should work, and the new navigation/routing should be in place — even if most pages are stubs.

### Tasks
1. Rename all references from "detask" to "workclaw" (package.json, titles, meta, env, constants)
2. Update route structure: `/app/c/` → `/app/contributor/`, `/app/e/` → `/app/customer/`
3. Add new role paths: `/app/reviewer/`, `/app/admin/`
4. Rename "jobs" → "projects", "proposals" → "applications", "candidates" → "contributors", "employers" → "customers" across code and UI copy
5. Rewrite the landing page to communicate the new product (hero, how it works, task types, CTAs)
6. Update the sidebar/nav to reflect new sections (Dashboard, Opportunities, My Tasks, Screenings, Earnings, Profile, Settings)
7. Add stub pages for all new routes
8. Update Prisma schema: rename Job → Project, Proposal → Application, add new enums
9. Run migration, verify app boots and auth works
10. Update README.md with new project description

---

## Phase 2: Contributor Onboarding & Profile

**Goal:** Build the contributor onboarding flow, extended profile, and opportunities browsing.

### Tasks
1. Extend User/Profile schema with contributor fields (crypto experience, chains, protocols, languages, availability, payout eligibility, trust score, contributor level)
2. Build onboarding wizard: wallet connect → profile setup → skills selection → languages → timezone → availability → payout method placeholder → agreement acceptance
3. Build expertise profile page with proof-of-work, chain specializations, languages spoken, linked accounts (ENS, Farcaster, X, GitHub)
4. Build opportunities listing page with filtering (domain, skills, pay type, difficulty)
5. Build opportunity detail page with requirements, screening gates, apply/start/locked states
6. Add contributor status dashboard widget (onboarding progress, quality score, earnings summary)
7. Add skill taxonomy with categories: chain expertise, domain expertise, coding languages, moderation, research

---

## Phase 3: Screening Engine

**Goal:** Build the qualification system where contributors take tests to unlock work.

### Tasks
1. Create Screening, ScreeningQuestion, ScreeningAttempt models
2. Build screening management API (CRUD, question management)
3. Build screening test UI: instructions → questions (MCQ, short answer, scenario) → submit → score
4. Implement passing thresholds, retake policies, dynamic unlocking
5. Build screening history view for contributors
6. Build screening management for admins (create tests, set thresholds, manual overrides)
7. Link screening completion to opportunity access (gate projects behind screenings)

---

## Phase 4: Task Engine

**Goal:** Build the modular task framework — the core product.

### Tasks
1. Design task data model: Task, TaskBatch, TaskSubmission with polymorphic task_type
2. Build core task types: single rating, pairwise comparison, ranking, label classification, code review, factuality verification
3. Build task workspace UI: instructions panel, rubric panel, examples panel, timer, autosave, draft/submit states, confidence score, reasoning field
4. Add web3-specific task examples: token description review, wallet risk ranking, smart contract explanation validation, scam classification
5. Build task assignment logic (match contributor skills/screenings to project requirements)
6. Add gold task / hidden benchmark system
7. Add spam detection hooks and impossible-speed detection
8. Build "My Tasks" view for contributors (active, completed, reviewed)

---

## Phase 5: Review & Quality System

**Goal:** Build the QA layer that ensures task quality.

### Tasks
1. Create TaskReview, GoldTask, ContributorScore models
2. Build reviewer dashboard: submission queue, calibration queue, dispute queue
3. Build review workflow: approve, reject, revise, escalate
4. Implement quality metrics: agreement score, gold task accuracy, acceptance rate, speed anomalies, consistency score
5. Implement consensus scoring and peer agreement weighting
6. Build contributor quality history view
7. Add tier upgrades/downgrades based on quality milestones
8. Add reviewer assignment to projects

---

## Phase 6: Reputation System

**Goal:** Build the trust and leveling system.

### Tasks
1. Create ReputationEvent model
2. Implement contributor levels: new → verified → skilled → trusted → expert → elite reviewer
3. Implement badges: solidity verified, defi analyst, scam hunter, ai rater, multilingual reviewer, etc.
4. Build reputation inputs: screening performance, acceptance rate, benchmark accuracy, task volume, dispute rate, account age
5. Display levels and badges on contributor profiles
6. Gate higher-paying work behind reputation levels

---

## Phase 7: Earnings & Payouts

**Goal:** Build the auditable earnings and payout system.

### Tasks
1. Create Payout, PayoutMethod, PayoutLedgerEntry models
2. Build internal ledger: per-task earnings, bonuses, streak incentives, quality bonuses, manual adjustments
3. Build earnings dashboard: today, this week, this month, lifetime, pending, approved, in payout, paid, disputed
4. Build payout method management (stablecoin wallet, fiat placeholder, PayPal placeholder)
5. Build payout batch system: batch creation, approval, execution
6. Integrate with escrow contract for USDC payouts
7. Add minimum payout thresholds, payout holds, disputes and reversals
8. Ensure ledger is auditable and does not depend on wallet balance guesses

---

## Phase 8: Customer Side

**Goal:** Build the customer-facing project management tools.

### Tasks
1. Build project creation wizard: title, description, task type, skill requirements, pay model, quality thresholds, screening requirements
2. Build task batch upload (CSV/JSON import)
3. Build rubric definition UI
4. Build project settings (contributor requirements, quality settings, region/language limits)
5. Build customer dashboard: throughput, quality, cost analytics
6. Build results export
7. Build contributor pool management per project
8. Build billing and payout settings

---

## Phase 9: Admin Backoffice

**Goal:** Build the internal operations panel.

### Tasks
1. Build admin layout and navigation
2. Build user management: approve/ban, score adjustments, KYC status
3. Build project management: unlock, pause, archive projects
4. Build task queue management: review queues, gold task creation
5. Build payout management: release, freeze, dispute payouts
6. Build fraud tools: suspicious behavior view, integrity scores, duplicate detection
7. Build announcement system
8. Build feature flag management
9. Build audit log viewer

---

## Phase 10: Fraud & Integrity

**Goal:** Build the fraud detection and integrity systems.

### Tasks
1. Create FraudFlag model
2. Implement duplicate account detection (wallet reuse, device fingerprint placeholder)
3. Implement impossible speed detection
4. Implement copy-paste / low-effort pattern detection
5. Implement benchmark failure alerts
6. Build contributor integrity score
7. Build suspicious agreement ring detection
8. Build fraud review workflow for admins

---

## Phase 11: Notifications & Analytics

**Goal:** Build the notification and analytics systems.

### Tasks
1. Create Notification model
2. Build in-app notification center
3. Add email-ready architecture (template system, queue)
4. Build admin broadcast announcements
5. Build contributor analytics: earnings graph, approval rate, quality trends
6. Build customer analytics: cost per task, throughput, turnaround time
7. Build admin analytics: platform GMV, active contributors, payout liabilities

---

## Phase 12: Polish & Harden

**Goal:** Production readiness.

### Tasks
1. Add loading, empty, and error states everywhere
2. Add onboarding guidance and empty state messaging
3. Dark mode support
4. Mobile responsiveness pass
5. Tighten TypeScript types
6. Add comprehensive Zod validation on all API endpoints
7. Security audit: OWASP top 10, input sanitization, rate limiting
8. Documentation finalization
9. Demo/seed data (clearly separated from production)
