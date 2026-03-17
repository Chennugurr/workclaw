import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/tasks
 * Get tasks for the authenticated contributor.
 * Query params: status (active|completed|all), projectId, page, limit
 */
export const GET = middleware(
  async (req) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'active';
    const projectId = url.searchParams.get('projectId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where = { assignedTo: req.user.id };

    if (status === 'active') {
      where.status = { in: ['ASSIGNED', 'IN_PROGRESS'] };
    } else if (status === 'completed') {
      where.status = { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] };
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: {
            select: { id: true, title: true, taskType: true, payModel: true, rateAmount: true },
          },
          submissions: {
            where: { userId: req.user.id },
            select: {
              id: true,
              status: true,
              isDraft: true,
              response: true,
              confidence: true,
              reasoning: true,
              timeSpent: true,
              submittedAt: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    const result = tasks.map((t) => ({
      ...t,
      submission: t.submissions[0] || null,
      submissions: undefined,
    }));

    return NextResponse.json(
      jsend.success({
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  },
  { requireAuth: true }
);

/**
 * POST /api/tasks
 * Claim the next available task for a project.
 * Body: { projectId }
 */
export const POST = middleware(
  async (req) => {
    const { projectId } = req.dto;

    // Verify contributor has access (accepted application + passed screenings)
    const application = await prisma.application.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId,
        },
        status: 'ACCEPTED',
      },
    });

    if (!application) {
      return NextResponse.json(
        jsend.fail({ message: 'You must be accepted to this project first.' }),
        { status: 403 }
      );
    }

    // Check if user already has an active task for this project
    const activeTask = await prisma.task.findFirst({
      where: {
        assignedTo: req.user.id,
        projectId,
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
      },
    });

    if (activeTask) {
      return NextResponse.json(jsend.success(activeTask));
    }

    // Find next available task
    const task = await prisma.task.findFirst({
      where: {
        projectId,
        status: 'AVAILABLE',
        assignedTo: null,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    if (!task) {
      return NextResponse.json(
        jsend.fail({ message: 'No tasks available right now.' }),
        { status: 404 }
      );
    }

    // Assign task
    const assigned = await prisma.task.update({
      where: { id: task.id },
      data: {
        assignedTo: req.user.id,
        assignedAt: new Date(),
        status: 'ASSIGNED',
      },
      include: {
        project: {
          select: { id: true, title: true, taskType: true },
        },
      },
    });

    return NextResponse.json(jsend.success(assigned), { status: 201 });
  },
  {
    requireAuth: true,
    bodySchema: (await import('zod')).z.object({
      projectId: (await import('zod')).z.string().min(1),
    }),
  }
);
