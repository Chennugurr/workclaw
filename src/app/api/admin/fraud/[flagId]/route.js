import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'CONFIRMED', 'DISMISSED']),
});

/**
 * PATCH /api/admin/fraud/:flagId
 * Update fraud flag status.
 */
export const PATCH = middleware(
  requireAdmin(async (req, { params }) => {
    const { flagId } = await params;

    const flag = await prisma.fraudFlag.update({
      where: { id: flagId },
      data: {
        status: req.dto.status,
        resolvedBy: ['CONFIRMED', 'DISMISSED'].includes(req.dto.status) ? req.user.id : undefined,
        resolvedAt: ['CONFIRMED', 'DISMISSED'].includes(req.dto.status) ? new Date() : undefined,
      },
      include: {
        user: {
          select: { id: true, address: true, profile: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    // If confirmed, reduce integrity score
    if (req.dto.status === 'CONFIRMED') {
      const severityPenalty = { LOW: 5, MEDIUM: 15, HIGH: 30, CRITICAL: 50 };
      const penalty = severityPenalty[flag.severity] || 10;

      await prisma.profile.updateMany({
        where: { userId: flag.userId },
        data: { integrityScore: { decrement: penalty } },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'FRAUD_FLAG_UPDATE',
        target: 'FraudFlag',
        targetId: flagId,
        details: { status: req.dto.status },
      },
    });

    return NextResponse.json(jsend.success(flag));
  }),
  { requireAuth: true, bodySchema: updateSchema }
);
