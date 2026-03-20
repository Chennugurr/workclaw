import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  domain: z.string().min(1).optional(),
  passingScore: z.number().min(0).max(1).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  timeLimitMins: z.number().int().min(1).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  projectId: z.string().optional().nullable(),
});

/**
 * GET /api/admin/screenings/:screeningId
 * Get a single screening with all questions.
 */
export const GET = middleware(
  requireAdmin(async (req, { params }) => {
    const { screeningId } = await params;

    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        project: { select: { id: true, title: true } },
        _count: { select: { attempts: true } },
      },
    });

    if (!screening) {
      return NextResponse.json(
        jsend.fail({ message: 'Screening not found' }),
        { status: 404 }
      );
    }

    return NextResponse.json(jsend.success(screening));
  }),
  { requireAuth: true }
);

/**
 * PATCH /api/admin/screenings/:screeningId
 * Update screening metadata.
 */
export const PATCH = middleware(
  requireAdmin(async (req, { params }) => {
    const { screeningId } = await params;

    const screening = await prisma.screening.update({
      where: { id: screeningId },
      data: req.dto,
      include: {
        questions: { orderBy: { order: 'asc' } },
        project: { select: { id: true, title: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'SCREENING_UPDATE',
        target: 'Screening',
        targetId: screeningId,
        details: req.dto,
      },
    });

    return NextResponse.json(jsend.success(screening));
  }),
  { requireAuth: true, bodySchema: updateSchema }
);

/**
 * DELETE /api/admin/screenings/:screeningId
 * Delete a screening and all its questions (cascade).
 */
export const DELETE = middleware(
  requireAdmin(async (req, { params }) => {
    const { screeningId } = await params;
    await prisma.screening.delete({ where: { id: screeningId } });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'SCREENING_DELETE',
        target: 'Screening',
        targetId: screeningId,
        details: {},
      },
    });

    return NextResponse.json(jsend.success({ message: 'Deleted' }));
  }),
  { requireAuth: true }
);
