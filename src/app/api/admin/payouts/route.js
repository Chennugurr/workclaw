import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import prisma from '@/lib/prisma';

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
