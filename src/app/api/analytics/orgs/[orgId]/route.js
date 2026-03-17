import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { JobStatus, ProposalStatus } from '@prisma/client';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req, { params }) => {
    const { orgId } = params;

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json(
        jsend.fail({ message: 'Organization not found' }),
        { status: 404 }
      );
    }

    const [
      totalJobs,
      activeJobs,
      totalProposals,
      totalHires,
      totalSpent,
      topSkillsHired,
    ] = await prisma.$transaction([
      prisma.project.count({ where: { orgId } }),
      prisma.project.count({ where: { orgId, status: JobStatus.OPEN } }),
      prisma.application.count({ where: { job: { orgId } } }),
      prisma.application.count({
        where: { job: { orgId }, status: ProposalStatus.HIRED },
      }),
      prisma.project.aggregate({
        where: { orgId, status: JobStatus.COMPLETED },
        _sum: { budget: true },
      }),
      prisma.skillAssociation.groupBy({
        by: ['skillId'],
        where: {
          job: {
            orgId,
            proposals: {
              some: { status: ProposalStatus.HIRED },
            },
          },
        },
        _count: true,
      }),
    ]);

    const topSkills = await prisma.skill.findMany({
      where: {
        id: {
          in: topSkillsHired.map((s) => s.skillId),
        },
      },
      select: { id: true, name: true },
    });

    const orgAnalytics = {
      orgId,
      totalJobs,
      activeJobs,
      totalProposals,
      totalHires,
      totalSpent: totalSpent._sum.budget
        ? parseFloat(totalSpent._sum.budget.toFixed(4))
        : 0,
      topSkillsHired: topSkills.map((s) => ({ id: s.id, name: s.name })),
    };

    return NextResponse.json(jsend.success(orgAnalytics));
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.MEMBER] },
  }
);
