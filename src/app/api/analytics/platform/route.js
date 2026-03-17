import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const [
      totalUsers,
      totalOrganizations,
      totalJobs,
      totalProposals,
      activeUsers,
      completedJobs,
      totalCompletedJobs,
      totalSkills,
      averageJobBudget,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.project.count(),
      prisma.application.count(),
      prisma.session.count({
        where: {
          lastSeenAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in the last 30 days
          },
        },
      }),
      prisma.project.count({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Completed in the last year
          },
        },
      }),
      prisma.project.count({
        where: {
          status: 'COMPLETED',
        },
      }),
      prisma.skill.count(),
      prisma.project.aggregate({
        _avg: {
          budget: true,
        },
      }),
    ]);

    const jobSuccessRate =
      totalCompletedJobs > 0 ? completedJobs / totalCompletedJobs : 0;

    const statistics = {
      totalUsers,
      totalOrganizations,
      totalJobs,
      totalProposals,
      activeUsers,
      jobSuccessRate: parseFloat(jobSuccessRate.toFixed(2)),
      totalSkills,
      averageJobBudget: averageJobBudget._avg.budget
        ? parseFloat(averageJobBudget._avg.budget.toFixed(2))
        : 0,
    };

    return NextResponse.json(jsend.success(statistics));
  },
  { withAuth: true }
);
