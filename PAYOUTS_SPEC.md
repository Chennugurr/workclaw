# Payouts Specification

## Hard Requirement

The ledger must be auditable and must not depend on wallet balance guesses. Every cent earned, held, deducted, or paid must have a corresponding ledger entry.

## Earning Types

| Type | Description |
|------|-------------|
| `TASK_EARNING` | Per-task or hourly compensation for approved work |
| `BONUS` | One-time bonus payments |
| `STREAK_INCENTIVE` | Bonus for consecutive days/weeks of work |
| `QUALITY_BONUS` | Extra pay for consistently high quality |
| `REFERRAL_CREDIT` | Credit for referring contributors (placeholder) |
| `MANUAL_ADJUSTMENT` | Admin manual credit/debit |
| `PAYOUT_DEBIT` | Deduction when payout is processed |
| `REVERSAL` | Reversal of a previous earning (dispute, error) |
| `HOLD` | Temporary hold on earnings (fraud review, dispute) |

## Ledger Architecture

```
┌─────────────────────────────────────────┐
│            PayoutLedgerEntry            │
│                                         │
│  Each earning/deduction = one entry     │
│  Running balance = SUM(entries)         │
│  Never delete entries, only add         │
│  Reversals are new negative entries     │
│                                         │
│  Fields:                                │
│  - userId                               │
│  - type (enum above)                    │
│  - amount (positive = credit, neg = debit)│
│  - currency (USDC)                      │
│  - reference (taskId, payoutId, etc.)   │
│  - payoutId (null until batched)        │
│  - note                                 │
│  - createdAt                            │
└─────────────────────────────────────────┘
```

### Balance Calculation
```sql
SELECT SUM(amount) as balance
FROM payout_ledger_entries
WHERE user_id = ? AND currency = 'USDC'
```

### Pending Balance
```sql
SELECT SUM(amount) as pending
FROM payout_ledger_entries
WHERE user_id = ? AND payout_id IS NULL AND amount > 0
```

## Payout Flow

```
1. Contributor earns (tasks approved) → TASK_EARNING entries created
2. Balance accumulates above minimum threshold
3. Contributor requests payout OR admin batches payouts
4. Payout record created (status: PENDING)
5. Ledger entries linked to payout (PAYOUT_DEBIT entry created)
6. Admin approves batch (status: APPROVED)
7. Payout executed (status: PROCESSING)
   - USDC: On-chain transfer via escrow contract
   - Fiat: External provider API call (placeholder)
8. Payout confirmed (status: COMPLETED, txHash recorded)
```

## Payout States

```
PENDING → APPROVED → PROCESSING → COMPLETED
    │         │           │
    ↓         ↓           ↓
  HELD    DISPUTED      FAILED
```

## Payout Methods

| Method | Status | Details |
|--------|--------|---------|
| Solana Wallet (USDC) | Supported | Direct SPL token transfer via escrow contract |
| Ethereum Wallet (USDC) | Placeholder | Future cross-chain support |
| Fiat Bank Transfer | Placeholder | Requires payment provider integration |
| PayPal | Placeholder | Requires PayPal API integration |

## Earnings Views

Contributors see earnings broken down by:

| View | Filter |
|------|--------|
| Today | `createdAt >= today` |
| This Week | `createdAt >= startOfWeek` |
| This Month | `createdAt >= startOfMonth` |
| Lifetime | All entries |
| Pending | `payoutId IS NULL AND amount > 0` |
| Approved | Linked to approved payouts |
| In Payout | Linked to processing payouts |
| Paid | Linked to completed payouts |
| Disputed | Linked to disputed payouts |

## Escrow Contract Integration

The existing Solana escrow contract maps to payouts:

| Contract Function | Payout Use |
|-------------------|------------|
| `deposit(job_id, amount)` | Customer funds a project (org deposits USDC into escrow) |
| `release_by_client(job_id)` | Customer approves payout batch → release to contributor wallets |
| `release_by_provider(job_id)` | Contributor-initiated refund (rare, edge case) |
| `release_by_admin(job_id, splits)` | Admin resolves payout dispute |

### Required Contract Enhancements (Future)
- Batch release: Release to multiple recipients in one transaction
- Partial release: Release partial amounts per task batch
- Automated release: Time-locked release after QA approval period

## Minimum Payout Thresholds

| Method | Minimum |
|--------|---------|
| Solana USDC | $10.00 |
| Ethereum USDC | $50.00 (higher due to gas) |
| Fiat | $25.00 |

## Tax & Compliance (Placeholders)

- Tax documentation collection: W-9 (US), W-8BEN (non-US) — placeholder
- Earnings export: CSV/PDF for tax reporting
- 1099 generation threshold tracking (US $600+) — placeholder
- Sanctions screening before payout — placeholder
