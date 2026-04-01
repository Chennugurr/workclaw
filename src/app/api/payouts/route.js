import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';
import { sendSolReward, isRewardsConfigured } from '@/lib/token-rewards';

const MINIMUM_PAYOUT = {
  SOLANA_WALLET: 10,
  ETHEREUM_WALLET: 50,
  FIAT_PLACEHOLDER: 25,
  PAYPAL_PLACEHOLDER: 25,
};

const requestSchema = z.object({
  methodId: z.string().min(1),
  amount: z.number().positive().optional(),
});

/**
 * GET /api/payouts
 * List user's payout history.
 */
export const GET = middleware(
  async (req) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where: { userId: req.user.id },
        include: {
          method: { select: { type: true, details: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payout.count({ where: { userId: req.user.id } }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: payouts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  },
  { requireAuth: true }
);

/**
 * POST /api/payouts
 * Request a payout.
 */
export const POST = middleware(
  async (req) => {
    const { methodId, amount: requestedAmount } = req.dto;
    const userId = req.user.id;

    // Verify method belongs to user
    const method = await prisma.payoutMethod.findFirst({
      where: { id: methodId, userId },
    });

    if (!method) {
      return NextResponse.json(
        jsend.fail({ message: 'Payout method not found' }),
        { status: 404 }
      );
    }

    // Calculate available balance (credits not yet in a payout)
    const entries = await prisma.payoutLedgerEntry.findMany({
      where: { userId },
      select: { amount: true, payoutId: true },
    });

    const availableBalance = entries
      .filter((e) => !e.payoutId && parseFloat(e.amount) > 0)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const payoutAmount = requestedAmount || availableBalance;
    const minimum = MINIMUM_PAYOUT[method.type] || 10;

    if (payoutAmount < minimum) {
      return NextResponse.json(
        jsend.fail({ message: `Minimum payout is $${minimum} for this method.` }),
        { status: 400 }
      );
    }

    if (payoutAmount > availableBalance) {
      return NextResponse.json(
        jsend.fail({ message: 'Insufficient balance.' }),
        { status: 400 }
      );
    }

    // Check for pending payouts
    const pendingPayout = await prisma.payout.findFirst({
      where: { userId, status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] } },
    });

    if (pendingPayout) {
      return NextResponse.json(
        jsend.fail({ message: 'You already have a pending payout.' }),
        { status: 400 }
      );
    }

    // Get recipient wallet address from payout method
    const recipientAddress = method.details?.address;
    if (!recipientAddress) {
      return NextResponse.json(
        jsend.fail({ message: 'Payout method has no wallet address.' }),
        { status: 400 }
      );
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        userId,
        methodId,
        amount: payoutAmount,
        currency: 'SOL',
        status: 'PROCESSING',
      },
    });

    // Create debit ledger entry
    await prisma.payoutLedgerEntry.create({
      data: {
        userId,
        payoutId: payout.id,
        type: 'PAYOUT_DEBIT',
        amount: -payoutAmount,
        currency: 'SOL',
        reference: payout.id,
        note: `Payout request #${payout.id.slice(0, 8)}`,
      },
    });

    // Execute on-chain SOL transfer if configured
    if (isRewardsConfigured()) {
      // Convert USD amount to SOL — use a fixed rate of 1 USD = 0.005 SOL (~$200/SOL)
      // In production this should use a live price feed
      const SOL_PER_USD = 0.005;
      const solAmount = payoutAmount * SOL_PER_USD;

      const result = await sendSolReward(recipientAddress, solAmount);

      if (result.success) {
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: 'COMPLETED', txHash: result.signature, processedAt: new Date() },
        });
        return NextResponse.json(jsend.success({ ...payout, status: 'COMPLETED', txHash: result.signature }), { status: 201 });
      } else {
        // Transfer failed — reverse the debit and mark payout failed
        await prisma.payout.update({ where: { id: payout.id }, data: { status: 'FAILED' } });
        await prisma.payoutLedgerEntry.deleteMany({ where: { payoutId: payout.id } });
        return NextResponse.json(jsend.fail({ message: `Transfer failed: ${result.error}` }), { status: 500 });
      }
    }

    return NextResponse.json(jsend.success(payout), { status: 201 });
  },
  {
    requireAuth: true,
    bodySchema: requestSchema,
  }
);
