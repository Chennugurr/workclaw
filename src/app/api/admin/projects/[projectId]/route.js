import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  status: z.enum(['DRAFT', 'SCREENING_SETUP', 'INVITE_ONLY', 'OPEN', 'PAUSED', 'FULL', 'ARCHIVED']).optional(),
});

/**
 * PATCH /api/admin/projects/:projectId
 * Admin project management (status changes).
 */
export const PATCH = middleware(
  requireAdmin(async (req, { params }) => {
    const { projectId } = await params;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: req.dto,
      include: {
        organization: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'PROJECT_UPDATE',
        target: 'Project',
        targetId: projectId,
        details: req.dto,
      },
    });

    return NextResponse.json(jsend.success(project));
  }),
  { requireAuth: true, bodySchema: updateSchema }
);
