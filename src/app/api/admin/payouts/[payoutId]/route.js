import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../middleware';
import prisma from '@/lib/prisma';
import { NotificationTemplates } from '@/lib/notifications';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'DISPUTED', 'HELD']),
  txHash: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

/**
 * PATCH /api/admin/payouts/:payoutId
 * Update payout status (approve, process, complete, fail, hold).
 */
export const PATCH = middleware(
  requireAdmin(async (req, { params }) => {
    const { payoutId } = await params;
    const { status, txHash, note } = req.dto;

    const payout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status,
        txHash: txHash || undefined,
        note: note || undefined,
        processedAt: ['COMPLETED', 'FAILED'].includes(status) ? new Date() : undefined,
      },
      include: {
        user: {
          select: {
            id: true, address: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    // If payout failed, reverse the debit
    if (status === 'FAILED') {
      await prisma.payoutLedgerEntry.create({
        data: {
          userId: payout.userId,
          type: 'REVERSAL',
          amount: parseFloat(payout.amount),
          currency: 'USDC',
          reference: payoutId,
          note: `Payout failed — reversed #${payoutId.slice(0, 8)}`,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'PAYOUT_UPDATE',
        target: 'Payout',
        targetId: payoutId,
        details: { status, txHash, note },
      },
    });

    // Notify user
    const amount = parseFloat(payout.amount).toFixed(2);
    if (status === 'APPROVED') {
      NotificationTemplates.payoutApproved(payout.userId, amount).catch(() => {});
    } else if (status === 'COMPLETED') {
      NotificationTemplates.payoutCompleted(payout.userId, amount, txHash).catch(() => {});
    }

    return NextResponse.json(jsend.success(payout));
  }),
  { requireAuth: true, bodySchema: updateSchema }
);
