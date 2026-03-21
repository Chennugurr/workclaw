import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/tasks/available-projects
 * Returns projects where the user has an APPROVED application
 * and there are AVAILABLE tasks to claim.
 */
export const GET = middleware(
  async (req) => {
    // Find projects where user has an approved application
    const applications = await prisma.application.findMany({
      where: {
        userId: req.user.id,
        status: 'APPROVED',
      },
      select: { projectId: true },
    });

    if (applications.length === 0) {
      return NextResponse.json(jsend.success([]));
    }

    const projectIds = applications.map((a) => a.projectId);

    // Find projects that have available (unclaimed) tasks
    const projects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        tasks: {
          some: {
            status: 'AVAILABLE',
            assignedTo: null,
          },
        },
      },
      select: {
        id: true,
        title: true,
        taskType: true,
        rateAmount: true,
        payModel: true,
      },
    });

    // Also check user doesn't already have an active task for each project
    const activeTasks = await prisma.task.findMany({
      where: {
        assignedTo: req.user.id,
        projectId: { in: projectIds },
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
      },
      select: { projectId: true },
    });

    const activeProjectIds = new Set(activeTasks.map((t) => t.projectId));

    // Filter out projects where user already has an active task
    const available = projects.filter((p) => !activeProjectIds.has(p.id));

    return NextResponse.json(jsend.success(available));
  },
  { requireAuth: true }
);
