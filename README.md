# Workclaw

A paid Web3 human intelligence platform for training crypto-native AI systems.

Contributors complete AI training tasks — labeling, ranking, reviewing, red-teaming — and get paid in USDC. Organizations post projects that need human feedback on AI outputs in crypto/blockchain domains.

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, shadcn/ui, Zustand, SWR
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL
- **Auth:** Sign In With Solana (SIWS), JWT
- **Blockchain:** Solana (Anchor 0.31.1), USDC escrow contracts
- **Wallet:** Reown AppKit (Phantom, Solflare)

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, NEXT_PUBLIC_PROJECT_ID

# Run database migrations
bunx prisma migrate dev

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/           # Next.js App Router (pages + API routes)
├── components/    # UI components (shadcn/ui + custom)
├── hooks/         # Custom React hooks
├── lib/           # Utilities (axios, prisma, helpers)
├── store/         # Zustand state management
├── providers/     # React context providers
├── constants/     # App constants
contracts/         # Solana smart contracts (Anchor)
prisma/            # Database schema
```

## Documentation

- [CONTEXT.md](CONTEXT.md) — Project overview
- [PLAN.md](PLAN.md) — Execution plan
- [MIGRATION_MAP.md](MIGRATION_MAP.md) — Migration decisions
- [ROUTES.md](ROUTES.md) — Route structure
- [SCHEMA_DIFF.md](SCHEMA_DIFF.md) — Database changes
- [TASK_ENGINE_SPEC.md](TASK_ENGINE_SPEC.md) — Task engine spec
- [PAYOUTS_SPEC.md](PAYOUTS_SPEC.md) — Payout system spec
- [SCREENING_ENGINE_SPEC.md](SCREENING_ENGINE_SPEC.md) — Screening engine spec
- [ADMIN_REQUIREMENTS.md](ADMIN_REQUIREMENTS.md) — Admin requirements
