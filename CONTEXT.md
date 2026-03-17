# Workclaw — Context

## What Is Workclaw?

Workclaw is a human intelligence platform for training AI and LLMs. Contributors complete structured AI training tasks — labeling, ranking, reviewing, red-teaming — and get paid in USDC. Organizations (AI labs, startups, enterprises, research teams) post projects that need high-quality human feedback on AI outputs across diverse domains.

**Think:** Outlier/Scale AI with crypto-native payments. Not a freelancing marketplace. Not a job board. A structured work platform where qualified contributors do paid AI training tasks. Web3 (Solana/USDC) is the payment and identity layer, not the product scope.

## Origin

This codebase was originally **detask**, a web3 freelancing marketplace (Next.js frontend + Solana escrow contracts). Workclaw repurposes the strong foundation — auth, profiles, organizations, Prisma schema, UI components, escrow contracts — and transforms it into an AI work platform.

## Core Transformation

| Freelancing Concept | Workclaw Concept |
|---------------------|------------------|
| Freelancers | Contributors |
| Clients/Employers | Organizations / Customers |
| Jobs/Gigs | Projects |
| Proposals | Applications / Qualification Requests |
| Milestones | Task Batches / Payout Batches |
| Portfolio | Expertise Profile / Proof of Work |
| Reviews | QA Scores / Trust Scores |

## Target Users

### Contributors
Writers, researchers, developers, linguists, domain experts (science, math, medicine, law, finance), data annotators, content reviewers, multilingual evaluators, prompt engineers, red teamers.

### Customers (Organizations)
AI labs, LLM companies, startups building AI products, enterprises training domain-specific AI, research teams, data providers, companies needing high-quality labeled datasets.

### Reviewers
Quality assurance managers, expert reviewers, calibrators, fraud/integrity reviewers.

### Admins
Operations, trust & safety, payout managers, project managers.

## Core Use Cases

- Human labeling and ranking of AI outputs
- Reviewing AI-generated responses for accuracy and helpfulness
- Factuality verification across science, math, coding, and more
- Content safety evaluation and moderation
- Prompt writing and prompt improvement for LLMs and AI agents
- Red-team testing of AI systems for vulnerabilities and unsafe behaviors
- Data annotation and dataset curation for model training

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, shadcn/ui, Zustand, SWR
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL
- **Auth:** Sign In With Solana (SIWS), JWT (access + refresh tokens)
- **Blockchain:** Solana (Anchor 0.31.1), USDC escrow contracts
- **Web3 Wallet:** Reown AppKit (Phantom, Solflare)

## What Already Exists (from detask)

### Reusable
- Solana wallet auth (SIWS) — keep, extend
- User profiles with skills — keep, extend fields
- Organization system — keep, rename to customer/organization
- Prisma schema (User, Profile, Social, Organization, Skill, etc.) — extend
- 47 shadcn/ui components — keep all
- API middleware (auth, RBAC, validation) — keep, extend
- Search and pagination hooks — keep
- Zustand store — keep, extend
- Escrow smart contract (deposit, release, dispute) — keep for payout layer

### Needs Rework
- Job system → Project system (different fields, lifecycle)
- Proposal system → Application/qualification system
- Recruiter system → Reviewer assignment system
- Dashboard layouts → New dashboard with task-centric widgets
- Landing page → New marketing site for AI work platform
- Analytics → New metrics (quality scores, earnings, task throughput)

### Needs Building (New)
- Screening engine (tests, qualifications)
- Task engine (modular task types, workspace UI)
- Review & quality system (QA, gold tasks, consensus scoring)
- Reputation system (levels, badges, trust scores)
- Earnings & payout ledger (auditable, multi-method)
- Customer project creation wizard
- Admin backoffice
- Fraud & integrity systems
- Notification system

## Smart Contract (Anchor/Solana)

The existing escrow contract handles:
- USDC deposits by clients for job escrow
- Release to provider (with platform fee in bps)
- Refund to client (provider cancels)
- Admin dispute arbitration (split between parties)
- Two-step ownership transfer
- Configurable fee (basis points)

This maps well to the payout layer: organizations deposit USDC, platform holds in escrow, releases to contributors after task approval.
