import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  role: z.enum(['CONTRIBUTOR', 'CUSTOMER', 'REVIEWER', 'ADMIN']).optional(),
  tier: z.enum(['NEW', 'VERIFIED', 'SKILLED', 'TRUSTED', 'EXPERT', 'ELITE_REVIEWER']).optional(),
  kycStatus: z.enum(['NONE', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
  badges: z.array(z.string()).optional(),
});

/**
 * GET /api/admin/users/:userId
 * Get full user details.
 */
export const GET = middleware(
  requireAdmin(async (req, { params }) => {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        contributorScores: true,
        reputationEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
        fraudFlags: { orderBy: { createdAt: 'desc' } },
        payoutMethods: true,
        _count: {
          select: {
            taskSubmissions: true,
            applications: true,
            payouts: true,
            screeningAttempts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(jsend.fail({ message: 'User not found' }), { status: 404 });
    }

    return NextResponse.json(jsend.success(user));
  }),
  { requireAuth: true }
);

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

    // Log audit event
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
