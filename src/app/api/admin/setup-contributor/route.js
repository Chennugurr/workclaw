import jsend from 'jsend';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function authCheck(req) {
  const secret = req.headers.get('x-admin-secret');
  return secret && secret === process.env.JWT_SECRET;
}

/**
 * POST /api/admin/setup-contributor
 * Give a user an approved application + reset N tasks to AVAILABLE for a project.
 * Body: { userId, projectId, taskCount? }
 */
export const POST = async (req) => {
  if (!authCheck(req)) return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });

  const { userId, projectId } = await req.json();

  // Upsert application as APPROVED
  const application = await prisma.application.upsert({
    where: { userId_projectId: { userId, projectId } },
    create: { userId, projectId, status: 'APPROVED', note: 'Admin test access' },
    update: { status: 'APPROVED' },
  });

  // Reset ALL non-AVAILABLE tasks in the project back to AVAILABLE
  // (unassign from everyone so they can be claimed fresh)
  const reset = await prisma.task.updateMany({
    where: {
      projectId,
      status: { not: 'AVAILABLE' },
    },
    data: { status: 'AVAILABLE', assignedTo: null, assignedAt: null },
  });

  // Count available tasks
  const available = await prisma.task.count({
    where: { projectId, status: 'AVAILABLE', assignedTo: null },
  });

  return NextResponse.json(jsend.success({
    application: { id: application.id, status: application.status },
    tasksReset: reset.count,
    tasksAvailable: available,
  }));
};
