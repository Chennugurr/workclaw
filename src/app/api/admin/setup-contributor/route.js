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

  const { userId, projectId, taskCount = 10 } = await req.json();

  // Upsert application as APPROVED
  const application = await prisma.application.upsert({
    where: { userId_projectId: { userId, projectId } },
    create: { userId, projectId, status: 'APPROVED', note: 'Admin test access' },
    update: { status: 'APPROVED' },
  });

  // Reset tasks to AVAILABLE (unassign submitted/completed ones)
  const reset = await prisma.task.updateMany({
    where: {
      projectId,
      status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] },
      assignedTo: userId,
    },
    data: { status: 'AVAILABLE', assignedTo: null, assignedAt: null },
  });

  // Also reset any stuck ASSIGNED tasks for this user in this project
  await prisma.task.updateMany({
    where: { projectId, status: { in: ['ASSIGNED', 'IN_PROGRESS'] }, assignedTo: userId },
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
