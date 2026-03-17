import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/orgs/:orgId/analytics
 * Organization-level dashboard analytics.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { orgId } = await params;

    const [
      projectStatusCounts,
      totalApplications,
      pendingApplications,
      taskStatusCounts,
      submissionStats,
    ] = await Promise.all([
      prisma.project.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true,
      }),
      prisma.application.count({
        where: { project: { orgId } },
      }),
      prisma.application.count({
        where: { project: { orgId }, status: 'PENDING' },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { project: { orgId } },
        _count: true,
      }),
      prisma.taskSubmission.aggregate({
        where: { task: { project: { orgId } }, isDraft: false },
        _count: true,
      }),
    ]);

    const projectStats = Object.fromEntries(projectStatusCounts.map((s) => [s.status, s._count]));
    const taskStats = Object.fromEntries(taskStatusCounts.map((s) => [s.status, s._count]));

    const totalProjects = Object.values(projectStats).reduce((a, b) => a + b, 0);
    const activeProjects = (projectStats.OPEN || 0) + (projectStats.INVITE_ONLY || 0);
    const totalTasks = Object.values(taskStats).reduce((a, b) => a + b, 0);
    const completedTasks = (taskStats.APPROVED || 0) + (taskStats.REJECTED || 0);

    // Cost calculation
    const projects = await prisma.project.findMany({
      where: { orgId },
      select: { id: true, rateAmount: true },
    });
    const approvedByProject = await prisma.task.groupBy({
      by: ['projectId'],
      where: { project: { orgId }, status: 'APPROVED' },
      _count: true,
    });
    const costMap = Object.fromEntries(projects.map((p) => [p.id, parseFloat(p.rateAmount || 0)]));
    const totalSpent = approvedByProject.reduce(
      (sum, g) => sum + (costMap[g.projectId] || 0) * g._count,
      0
    );

    return NextResponse.json(
      jsend.success({
        projects: {
          total: totalProjects,
          active: activeProjects,
          draft: projectStats.DRAFT || 0,
          paused: projectStats.PAUSED || 0,
          archived: projectStats.ARCHIVED || 0,
        },
        tasks: {
          total: totalTasks,
          available: taskStats.AVAILABLE || 0,
          inProgress: (taskStats.ASSIGNED || 0) + (taskStats.IN_PROGRESS || 0),
          completed: completedTasks,
          completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
        },
        contributors: {
          totalApplications,
          pendingApplications,
        },
        submissions: {
          total: submissionStats._count || 0,
        },
        cost: {
          totalSpent,
          currency: 'USDC',
        },
      })
    );
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.MEMBER] },
  }
);
