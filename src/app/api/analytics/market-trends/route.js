import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req) => {
    const [topSkills, emergingSkills, mostDemandedPositions, jobTrends] =
      await prisma.$transaction([
        // Query for top skills
        prisma.skillAssociation.groupBy({
          by: ['skillId'],
          where: {
            job: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
          _count: true,
          orderBy: {
            skillId: 'desc',
          },
          take: 10,
        }),

        // Query for emerging skills (skills with recent rapid growth)
        prisma.skillAssociation.groupBy({
          by: ['skillId'],
          where: {
            job: {
              createdAt: {
                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
              },
            },
          },
          _count: true,
          orderBy: {
            skillId: 'desc',
          },
          take: 10,
        }),

        // Query for most demanded positions
        prisma.job.groupBy({
          by: ['position'],
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          _count: true,
          orderBy: {
            position: 'desc',
          },
          take: 10,
        }),

        // Query for job trends
        prisma.job.groupBy({
          by: ['status'],
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          _count: true,
          orderBy: {
            status: 'desc',
          },
          take: 10,
        }),
      ]);

    // Fetch skill names for top skills and emerging skills
    const skillIds = [...topSkills, ...emergingSkills].map((s) => s.skillId);
    const skills = await prisma.skill.findMany({
      where: {
        id: {
          in: skillIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const skillMap = new Map(skills.map((s) => [s.id, s.name]));

    const marketTrends = {
      topSkills: topSkills.map((s) => ({
        name: skillMap.get(s.skillId),
        count: s._count,
      })),
      emergingSkills: emergingSkills.map((s) => ({
        name: skillMap.get(s.skillId),
        count: s._count,
      })),
      mostDemandedPositions: mostDemandedPositions.map((p) => ({
        position: p.position,
        count: p._count,
      })),
      jobTrends: Object.fromEntries(
        jobTrends.map((j) => [j.status.toLowerCase(), j._count])
      ),
    };

    return NextResponse.json(jsend.success(marketTrends));
  },
  { withAuth: true }
);
