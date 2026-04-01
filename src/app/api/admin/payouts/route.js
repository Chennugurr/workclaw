import jsend from 'jsend';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSolReward, isRewardsConfigured } from '@/lib/token-rewards';

/**
 * POST /api/admin/payouts
 * Cancel all pending/processing payouts and restore balances.
 * Authenticated via x-admin-secret header matching JWT_SECRET.
 */
export const POST = async (req) => {
  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.JWT_SECRET) {
    return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  }

  const stuck = await prisma.payout.findMany({
    where: { status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] } },
  });

  for (const payout of stuck) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: 'FAILED', processedAt: new Date() },
    });
    await prisma.payoutLedgerEntry.deleteMany({ where: { payoutId: payout.id } });
  }

  return NextResponse.json(jsend.success({ cancelled: stuck.length }));
};

/**
 * GET /api/admin/payouts
 * List all payouts across all users.
 */
export const GET = async (req) => {
  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.JWT_SECRET) {
    return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const status = url.searchParams.get('status');
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;

  const [payouts, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      include: {
        user: {
          select: {
            id: true, address: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        method: { select: { type: true, details: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payout.count({ where }),
  ]);

  return NextResponse.json(
    jsend.success({
      data: payouts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
};

/**
 * PATCH /api/admin/payouts
 * Process all PENDING payouts that are at least 14 hours old.
 * Called by cron or manually by admin.
 */
export const PATCH = async (req) => {
  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.JWT_SECRET) {
    return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  }

  const DELAY_MS = 14 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - DELAY_MS);

  const pending = await prisma.payout.findMany({
    where: { status: 'PENDING', createdAt: { lte: cutoff } },
    include: { method: { select: { type: true, details: true } } },
  });

  const results = [];

  for (const payout of pending) {
    const recipientAddress = payout.method?.details?.address;

    if (!recipientAddress) {
      await prisma.payout.update({ where: { id: payout.id }, data: { status: 'FAILED', processedAt: new Date() } });
      results.push({ id: payout.id, status: 'FAILED', reason: 'No wallet address' });
      continue;
    }

    if (isRewardsConfigured()) {
      const SOL_PER_USD = 0.005;
      const solAmount = parseFloat(payout.amount) * SOL_PER_USD;
      const result = await sendSolReward(recipientAddress, solAmount);

      if (result.success) {
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: 'COMPLETED', txHash: result.signature, processedAt: new Date() },
        });
        results.push({ id: payout.id, status: 'COMPLETED', txHash: result.signature });
      } else {
        await prisma.payout.update({ where: { id: payout.id }, data: { status: 'FAILED', processedAt: new Date() } });
        await prisma.payoutLedgerEntry.deleteMany({ where: { payoutId: payout.id } });
        results.push({ id: payout.id, status: 'FAILED', reason: result.error });
      }
    } else {
      // Rewards not configured — mark as PROCESSING for manual handling
      await prisma.payout.update({ where: { id: payout.id }, data: { status: 'PROCESSING', processedAt: new Date() } });
      results.push({ id: payout.id, status: 'PROCESSING', reason: 'Rewards not configured' });
    }
  }

  return NextResponse.json(jsend.success({ processed: results.length, results }));
};
