import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/orgs/:orgId/projects/:projectId/analytics
 * Get project analytics: throughput, quality, cost.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true, rateAmount: true, payModel: true },
    });
    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }

    const [
      taskStatusCounts,
      submissionStatusCounts,
      totalApplications,
      approvedApplications,
      avgConfidence,
      avgTimeSpent,
      reviewVerdictCounts,
    ] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
      }),
      prisma.taskSubmission.groupBy({
        by: ['status'],
        where: { task: { projectId } },
        _count: true,
      }),
      prisma.application.count({ where: { projectId } }),
      prisma.application.count({ where: { projectId, status: 'APPROVED' } }),
      prisma.taskSubmission.aggregate({
        where: { task: { projectId }, isDraft: false, confidence: { not: null } },
        _avg: { confidence: true },
      }),
      prisma.taskSubmission.aggregate({
        where: { task: { projectId }, isDraft: false, timeSpent: { not: null } },
        _avg: { timeSpent: true },
      }),
      prisma.taskReview.groupBy({
        by: ['verdict'],
        where: { submission: { task: { projectId } } },
        _count: true,
      }),
    ]);

    const taskStats = Object.fromEntries(taskStatusCounts.map((s) => [s.status, s._count]));
    const subStats = Object.fromEntries(submissionStatusCounts.map((s) => [s.status, s._count]));
    const reviewStats = Object.fromEntries(reviewVerdictCounts.map((v) => [v.verdict, v._count]));

    const totalTasks = Object.values(taskStats).reduce((a, b) => a + b, 0);
    const completedTasks = (taskStats.APPROVED || 0) + (taskStats.REJECTED || 0);
    const totalSubmissions = Object.values(subStats).reduce((a, b) => a + b, 0);
    const approvedSubmissions = subStats.APPROVED || 0;
    const acceptanceRate = totalSubmissions > 0 ? approvedSubmissions / totalSubmissions : 0;

    const rateAmount = parseFloat(project.rateAmount || 0);
    const totalCost = approvedSubmissions * rateAmount;

    return NextResponse.json(
      jsend.success({
        tasks: {
          total: totalTasks,
          ...taskStats,
          completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
        },
        submissions: {
          total: totalSubmissions,
          ...subStats,
          acceptanceRate,
          avgConfidence: avgConfidence._avg.confidence || 0,
          avgTimeSpent: Math.round(avgTimeSpent._avg.timeSpent || 0),
        },
        reviews: reviewStats,
        contributors: {
          totalApplications,
          approvedContributors: approvedApplications,
        },
        cost: {
          totalSpent: totalCost,
          costPerTask: rateAmount,
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
