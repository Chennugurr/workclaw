import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../middleware';
import prisma from '@/lib/prisma';

function authCheck(req) {
  const secret = req.headers.get('x-admin-secret');
  return secret && secret === process.env.JWT_SECRET;
}

/**
 * GET /api/admin/users/:userId
 * Returns ledger entries + net balance for a user.
 */
export const GET = async (req, { params }) => {
  if (!authCheck(req)) return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  const { userId } = await params;
  const entries = await prisma.payoutLedgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const total = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  return NextResponse.json(jsend.success({ entries, total: total.toFixed(2), count: entries.length }));
};

/**
 * POST /api/admin/users/:userId
 * Add a manual ledger adjustment for a user.
 */
export const POST = async (req, { params }) => {
  if (!authCheck(req)) return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  const { userId } = await params;
  const { amount, note } = await req.json();
  const entry = await prisma.payoutLedgerEntry.create({
    data: {
      userId,
      type: 'MANUAL_ADJUSTMENT',
      amount: parseFloat(amount),
      currency: 'USD',
      reference: userId,
      note: note || 'Manual adjustment',
    },
  });
  return NextResponse.json(jsend.success(entry), { status: 201 });
};

const updateSchema = z.object({
  role: z.enum(['CONTRIBUTOR', 'CUSTOMER', 'REVIEWER', 'ADMIN']).optional(),
  tier: z.enum(['NEW', 'VERIFIED', 'SKILLED', 'TRUSTED', 'EXPERT', 'ELITE_REVIEWER']).optional(),
  kycStatus: z.enum(['NONE', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
  badges: z.array(z.string()).optional(),
});

/**
 * PATCH /api/admin/users/:userId
 * Update user role, tier, KYC status, or badges.
 */
export const PATCH = middleware(
  requireAdmin(async (req, { params }) => {
    const { userId } = await params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: req.dto,
      include: {
        profile: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'USER_UPDATE',
        target: 'User',
        targetId: userId,
        details: req.dto,
      },
    });

    return NextResponse.json(jsend.success(user));
  }),
  { requireAuth: true, bodySchema: updateSchema }
);
