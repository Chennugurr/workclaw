import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const taskSchema = z.object({
  data: z.any(),
  instructions: z.string().optional().nullable(),
  rubric: z.any().optional().nullable(),
  examples: z.any().optional().nullable(),
  isGold: z.boolean().default(false),
  goldAnswer: z.any().optional().nullable(),
  priority: z.number().int().default(0),
});

const batchUploadSchema = z.object({
  batchName: z.string().min(1).max(200),
  tasks: z.array(taskSchema).min(1).max(5000),
});

/**
 * GET /api/orgs/:orgId/projects/:projectId/tasks
 * List tasks for a project (customer view).
 */
export const GET = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const status = url.searchParams.get('status');
    const batchId = url.searchParams.get('batchId');
    const skip = (page - 1) * limit;

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }

    const where = { projectId };
    if (status) where.status = status;
    if (batchId) where.batchId = batchId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          _count: { select: { submissions: true } },
          submissions: {
            select: { id: true, status: true, userId: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: tasks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.MEMBER] },
  }
);

/**
 * POST /api/orgs/:orgId/projects/:projectId/tasks
 * Batch upload tasks to a project.
 */
export const POST = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;
    const { batchName, tasks } = req.dto;

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true, taskType: true },
    });
    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }

    // Create batch and tasks in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.taskBatch.create({
        data: {
          projectId,
          name: batchName,
          taskCount: tasks.length,
          status: 'ACTIVE',
        },
      });

      const taskRecords = await tx.task.createMany({
        data: tasks.map((t) => ({
          projectId,
          batchId: batch.id,
          taskType: project.taskType,
          data: t.data,
          instructions: t.instructions || null,
          rubric: t.rubric || null,
          examples: t.examples || null,
          isGold: t.isGold || false,
          goldAnswer: t.goldAnswer || null,
          priority: t.priority || 0,
          status: 'AVAILABLE',
        })),
      });

      return { batch, created: taskRecords.count };
    });

    return NextResponse.json(
      jsend.success({
        batchId: result.batch.id,
        batchName: result.batch.name,
        tasksCreated: result.created,
      }),
      { status: 201 }
    );
  },
  (error, defaultErrorHandler) => {
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema: batchUploadSchema,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);
