# Workclaw — Context

## What Is Workclaw?

Workclaw is a paid Web3 human intelligence platform for training crypto-native AI systems. Contributors complete AI training tasks — labeling, ranking, reviewing, red-teaming — and get paid in USDC or fiat. Organizations (AI startups, wallet teams, exchanges, DeFi protocols) post projects that need human feedback on AI outputs related to crypto/blockchain.

**Think:** Outlier/Scale AI meets crypto. Not a freelancing marketplace. Not a job board. A structured work platform where qualified contributors do paid AI training tasks in web3 domains.

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
Crypto researchers, smart contract developers, Solidity/Rust engineers, community moderators, security researchers, NFT analysts, traders, multilingual crypto users, content reviewers.

### Customers (Organizations)
AI startups, wallet teams, exchanges, DeFi protocols, data providers, agent platforms, L1/L2/L3 teams, security tooling companies, launchpads, research firms.

### Reviewers
Quality assurance managers, expert reviewers, calibrators, fraud/integrity reviewers.

### Admins
Operations, trust & safety, payout managers, project managers.

## Core Use Cases

- Human labeling and ranking of AI outputs
- Reviewing AI-generated crypto research and summaries
- Validating smart contract explanations
- Scam, phishing, rugpull, and impersonation classification
- Prompt writing and prompt improvement for blockchain agents
- Red-team testing of AI agents and web3 support systems
- Reviewing moderation decisions and multilingual crypto content

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
