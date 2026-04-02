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

    // Require KYC verification before payout
    const userKyc = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    if (userKyc?.kycStatus !== 'VERIFIED') {
      return NextResponse.json(
        jsend.fail({ message: 'Identity verification required before withdrawal. Please complete KYC in your profile settings.', code: 'KYC_REQUIRED' }),
        { status: 403 }
      );
    }

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

    // Calculate available balance (net of all credits and debits)
    const entries = await prisma.payoutLedgerEntry.findMany({
      where: { userId },
      select: { amount: true },
    });

    const availableBalance = Math.max(
      0,
      entries.reduce((sum, e) => sum + parseFloat(e.amount), 0)
    );

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

    // Create payout record — stays PENDING for 14 hours before processing
    const scheduledAt = new Date(Date.now() + 14 * 60 * 60 * 1000);
    const payout = await prisma.payout.create({
      data: {
        userId,
        methodId,
        amount: payoutAmount,
        currency: 'SOL',
        status: 'PENDING',
        note: `Scheduled for processing after ${scheduledAt.toISOString()}`,
      },
    });

    // Create debit ledger entry to reserve the funds
    await prisma.payoutLedgerEntry.create({
      data: {
        userId,
        payoutId: payout.id,
        type: 'PAYOUT_DEBIT',
        amount: -payoutAmount,
        currency: 'SOL',
        reference: payout.id,
        note: `Payout request #${payout.id.slice(0, 8)} — processes in ~14h`,
      },
    });

    return NextResponse.json(jsend.success({
      ...payout,
      message: 'Payout scheduled. Funds will be sent within 14 hours.',
    }), { status: 201 });
  },
  {
    requireAuth: true,
    bodySchema: requestSchema,
  }
);
