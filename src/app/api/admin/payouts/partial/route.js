import { NextResponse } from 'next/server';
import jsend from 'jsend';
import prisma from '@/lib/prisma';
import { sendSolReward, isRewardsConfigured } from '@/lib/token-rewards';

const SOL_PER_USD = 0.005;

function authCheck(req) {
  const secret = req.headers.get('x-admin-secret');
  return secret && secret === process.env.JWT_SECRET;
}

/**
 * POST /api/admin/payouts/partial
 * Process PENDING payouts smallest-first up to a SOL budget.
 * Body: { budgetSol: number }
 */
export const POST = async (req) => {
  if (!authCheck(req)) {
    return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  }

  if (!isRewardsConfigured()) {
    return NextResponse.json(jsend.error('Rewards not configured — set SOLANA_RPC_URL and TREASURY_PRIVATE_KEY'), { status: 500 });
  }

  const { budgetSol } = await req.json();
  if (!budgetSol || budgetSol <= 0) {
    return NextResponse.json(jsend.fail({ message: 'budgetSol is required' }), { status: 400 });
  }

  const pending = await prisma.payout.findMany({
    where: { status: 'PENDING' },
    include: {
      method: { select: { type: true, details: true } },
      user: { select: { address: true, profile: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { amount: 'asc' },
  });

  let remainingSol = budgetSol;
  const paid = [];
  const skipped = [];
  const failed = [];

  for (const payout of pending) {
    const solNeeded = parseFloat(payout.amount) * SOL_PER_USD;

    if (solNeeded > remainingSol) {
      skipped.push({ id: payout.id, amount: payout.amount, reason: 'exceeds_budget' });
      continue;
    }

    // Optimistic lock
    const updated = await prisma.payout.updateMany({
      where: { id: payout.id, status: 'PENDING' },
      data: { status: 'PROCESSING' },
    });
    if (updated.count === 0) continue;

    const recipientAddress = payout.method?.details?.address;
    if (!recipientAddress) {
      await prisma.payout.update({ where: { id: payout.id }, data: { status: 'FAILED', processedAt: new Date() } });
      await prisma.payoutLedgerEntry.deleteMany({ where: { payoutId: payout.id } });
      failed.push({ id: payout.id, reason: 'no_address' });
      continue;
    }

    const result = await sendSolReward(recipientAddress, solNeeded);

    if (result.success) {
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'COMPLETED', txHash: result.signature, processedAt: new Date() },
      });
      remainingSol -= solNeeded;
      paid.push({
        id: payout.id,
        user: `${payout.user?.profile?.firstName} ${payout.user?.profile?.lastName}`.trim(),
        amount: payout.amount,
        solSent: solNeeded,
        txHash: result.signature,
      });
    } else {
      await prisma.payout.update({ where: { id: payout.id }, data: { status: 'FAILED', processedAt: new Date() } });
      await prisma.payoutLedgerEntry.deleteMany({ where: { payoutId: payout.id } });
      failed.push({ id: payout.id, reason: result.error });
    }
  }

  return NextResponse.json(jsend.success({
    paid: paid.length,
    skipped: skipped.length,
    failed: failed.length,
    solUsed: (budgetSol - remainingSol).toFixed(4),
    solRemaining: remainingSol.toFixed(4),
    details: { paid, skipped, failed },
  }));
};
