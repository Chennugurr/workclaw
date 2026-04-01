import prisma from '@/lib/prisma';
import { sendSolReward, isRewardsConfigured } from '@/lib/token-rewards';

const DELAY_MS = 14 * 60 * 60 * 1000; // 14 hours
const SOL_PER_USD = 0.005;

/**
 * Process all PENDING payouts that are at least 14 hours old.
 * Safe to call multiple times concurrently — uses status transitions as locks.
 */
export async function processMaturedPayouts() {
  const cutoff = new Date(Date.now() - DELAY_MS);

  const pending = await prisma.payout.findMany({
    where: { status: 'PENDING', createdAt: { lte: cutoff } },
    include: { method: { select: { type: true, details: true } } },
  });

  if (pending.length === 0) return;

  for (const payout of pending) {
    // Mark as PROCESSING first to prevent double-processing
    const updated = await prisma.payout.updateMany({
      where: { id: payout.id, status: 'PENDING' },
      data: { status: 'PROCESSING' },
    });

    if (updated.count === 0) continue; // Already picked up by another request

    const recipientAddress = payout.method?.details?.address;

    if (!recipientAddress) {
      await prisma.payout.update({ where: { id: payout.id }, data: { status: 'FAILED', processedAt: new Date() } });
      await prisma.payoutLedgerEntry.deleteMany({ where: { payoutId: payout.id } });
      continue;
    }

    if (!isRewardsConfigured()) {
      // Leave as PROCESSING — admin must handle manually
      continue;
    }

    const solAmount = parseFloat(payout.amount) * SOL_PER_USD;
    const result = await sendSolReward(recipientAddress, solAmount);

    if (result.success) {
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'COMPLETED', txHash: result.signature, processedAt: new Date() },
      });
    } else {
      await prisma.payout.update({ where: { id: payout.id }, data: { status: 'FAILED', processedAt: new Date() } });
      await prisma.payoutLedgerEntry.deleteMany({ where: { payoutId: payout.id } });
    }
  }
}
