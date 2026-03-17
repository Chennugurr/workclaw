import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/tasks/:taskId
 * Get a single task with submission data.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            taskType: true,
            payModel: true,
            rateAmount: true,
          },
        },
        submissions: {
          where: { userId: req.user.id },
          include: {
            reviews: {
              select: {
                id: true,
                verdict: true,
                score: true,
                comments: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(jsend.fail({ message: 'Task not found' }), {
        status: 404,
      });
    }

    // Verify assignment
    if (task.assignedTo !== req.user.id) {
      return NextResponse.json(jsend.fail({ message: 'Not assigned to you' }), {
        status: 403,
      });
    }

    // Don't expose gold answers
    const result = { ...task };
    delete result.goldAnswer;
    delete result.isGold;

    result.submission = task.submissions[0] || null;
    delete result.submissions;

    // Mark as in progress if just assigned
    if (task.status === 'ASSIGNED') {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' },
      });
      result.status = 'IN_PROGRESS';
    }

    return NextResponse.json(jsend.success(result));
  },
  { requireAuth: true }
);
