import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req, { params }) => {
    const { skillId } = params;

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      select: { name: true },
    });

    if (!skill) {
      return NextResponse.json(jsend.fail({ message: 'Skill not found' }), {
        status: 404,
      });
    }

    const [
      totalUsers,
      totalJobs,
      proficiency,
      recentJobTrend,
      previousMonthJobCount,
    ] = await prisma.$transaction([
      prisma.skillAssociation.count({
        where: { skillId, ownerType: 'USER' },
      }),
      prisma.skillAssociation.count({
        where: { skillId, ownerType: 'JOB' },
      }),
      prisma.skillAssociation.groupBy({
        by: ['level'],
        where: { skillId, ownerType: 'USER' },
        _count: true,
      }),
      prisma.job.count({
        where: {
          skills: {
            some: {
              skillId,
            },
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.job.count({
        where: {
          skills: {
            some: {
              skillId,
            },
          },
          createdAt: {
            gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Last 60 days
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    let demandTrend;
    if (recentJobTrend > previousMonthJobCount) {
      demandTrend = 'increasing';
    } else if (recentJobTrend < previousMonthJobCount) {
      demandTrend = 'decreasing';
    } else {
      demandTrend = 'stable';
    }

    const skillAnalytics = {
      skillId,
      skillName: skill.name,
      totalUsers,
      totalJobs,
      proficiency: Object.fromEntries(
        proficiency.map(({ level, _count }) => [level, _count])
      ),
      demandTrend,
      recentJobCount: recentJobTrend,
      previousMonthJobCount,
    };

    return NextResponse.json(jsend.success(skillAnalytics));
  },
  { withAuth: true }
);
