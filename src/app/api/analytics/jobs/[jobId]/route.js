import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req, { params }) => {
    const { jobId } = params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, orgId: true },
    });

    if (!job) {
      return NextResponse.json(jsend.fail({ message: 'Job not found' }), {
        status: 404,
      });
    }

    const [proposalCounts, topCandidateSkills] = await prisma.$transaction([
      prisma.proposal.groupBy({
        by: ['status'],
        where: { jobId },
        _count: true,
      }),
      prisma.skillAssociation.groupBy({
        by: ['skillId'],
        where: {
          user: {
            proposals: {
              some: { jobId },
            },
          },
        },
        _count: true,
      }),
    ]);

    const proposalStatus = {
      total: 0,
      applied: 0,
      withdrawn: 0,
      shortlisted: 0,
      archived: 0,
      hired: 0,
    };

    proposalCounts.forEach((count) => {
      proposalStatus[count.status.toLowerCase()] = count._count;
      proposalStatus.total += count._count;
    });

    const topSkills = await prisma.skill.findMany({
      where: {
        id: {
          in: topCandidateSkills.map((s) => s.skillId),
        },
      },
      select: { id: true, name: true },
    });

    const jobAnalytics = {
      jobId,
      proposals: proposalStatus,
      topCandidateSkills: topSkills.map((s) => ({ id: s.id, name: s.name })),
    };

    return NextResponse.json(jsend.success(jobAnalytics));
  },
  {
    requireAuth: true,
    role: {
      roles: [ROLE.ORGANIZATION.MEMBER],
      resolve: async (_, { params }) => {
        const { jobId } = params;
        const job = await prisma.job.findUnique({
          where: { id: jobId },
          select: { id: true, orgId: true },
        });
        return [job.orgId];
      },
    },
  }
);
