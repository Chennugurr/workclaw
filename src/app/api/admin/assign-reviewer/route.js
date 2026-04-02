import { NextResponse } from 'next/server';
import jsend from 'jsend';
import prisma from '@/lib/prisma';

function authCheck(req) {
  const secret = req.headers.get('x-admin-secret');
  return secret && secret === process.env.JWT_SECRET;
}

/**
 * POST /api/admin/assign-reviewer
 * Assign a user as reviewer for a project.
 * Body: { userId, projectId }
 */
export const POST = async (req) => {
  if (!authCheck(req)) {
    return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  }

  const { userId, projectId, allProjects } = await req.json();

  // Assign to all projects if allProjects flag is set
  if (allProjects) {
    const projects = await prisma.project.findMany({ select: { id: true } });
    const assignments = [];
    for (const project of projects) {
      const a = await prisma.reviewerAssignment.upsert({
        where: { userId_projectId: { userId, projectId: project.id } },
        create: { userId, projectId: project.id },
        update: {},
      });
      assignments.push(a);
    }
    return NextResponse.json(jsend.success({ assignments, count: assignments.length }));
  }

  const assignment = await prisma.reviewerAssignment.upsert({
    where: { userId_projectId: { userId, projectId } },
    create: { userId, projectId },
    update: {},
  });

  return NextResponse.json(jsend.success({ assignment }));
};

/**
 * DELETE /api/admin/assign-reviewer
 * Remove a reviewer from a project.
 * Body: { userId, projectId }
 */
export const DELETE = async (req) => {
  if (!authCheck(req)) {
    return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  }

  const { userId, projectId } = await req.json();

  await prisma.reviewerAssignment.deleteMany({
    where: { userId, projectId },
  });

  return NextResponse.json(jsend.success({ removed: true }));
};
