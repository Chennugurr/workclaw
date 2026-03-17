import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const userId = req.user.id;

    const [
      totalProposals,
      proposalStatuses,
      completedJobs,
      earningsInUSDC,
      topSkills,
    ] = await prisma.$transaction([
      prisma.application.count({
        where: { userId },
      }),
      prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.project.findMany({
        where: {
          proposals: {
            some: {
              userId,
              status: 'HIRED',
            },
          },
          status: 'COMPLETED',
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.project.aggregate({
        where: {
          proposals: {
            some: {
              userId,
              status: 'HIRED',
            },
          },
          status: 'COMPLETED',
          currency: 'USDC',
        },
        _sum: { budget: true },
      }),
      prisma.skillAssociation.findMany({
        where: { userId },
        select: {
          skill: { select: { name: true } },
          level: true,
        },
        orderBy: { level: 'desc' },
        take: 5,
      }),
    ]);

    const proposalStatusCounts = Object.fromEntries(
      proposalStatuses.map(({ status, _count }) => [status, _count])
    );

    const averageJobDuration =
      completedJobs.length > 0
        ? completedJobs.reduce(
            (sum, job) => sum + (job.updatedAt - job.createdAt),
            0
          ) /
          completedJobs.length /
          (24 * 60 * 60 * 1000)
        : 0;

    const candidateAnalytics = {
      candidateId: userId,
      totalProposals,
      proposalStatuses: proposalStatusCounts,
      proposalSuccessRate:
        (proposalStatusCounts.HIRED || 0) / totalProposals || 0,
      completedJobs: completedJobs.length,
      averageJobDuration: Math.round(averageJobDuration),
      earnings: {
        USDC: earningsInUSDC._sum.budget
          ? parseFloat(earningsInUSDC._sum.budget.toFixed(4))
          : 0,
      },
      topSkills: topSkills.map(({ skill, level }) => ({
        name: skill.name,
        level,
      })),
    };

    return NextResponse.json(jsend.success(candidateAnalytics));
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.SELF] },
  }
);
