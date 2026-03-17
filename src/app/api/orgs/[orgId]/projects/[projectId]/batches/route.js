import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/orgs/:orgId/projects/:projectId/batches
 * List task batches for a project.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }

    const batches = await prisma.taskBatch.findMany({
      where: { projectId },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get status breakdown for each batch
    const batchesWithStats = await Promise.all(
      batches.map(async (batch) => {
        const statusCounts = await prisma.task.groupBy({
          by: ['status'],
          where: { batchId: batch.id },
          _count: true,
        });
        return {
          ...batch,
          statusBreakdown: Object.fromEntries(
            statusCounts.map((s) => [s.status, s._count])
          ),
        };
      })
    );

    return NextResponse.json(jsend.success(batchesWithStats));
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.MEMBER] },
  }
);
