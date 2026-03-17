import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/contributors/:userId/scores
 * Get contributor quality scores and reputation history.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { userId } = await params;

    const [scores, events, user] = await Promise.all([
      prisma.contributorScore.findMany({
        where: { userId },
        include: {
          user: false,
        },
      }),
      prisma.reputationEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          tier: true,
          profile: {
            select: { trustScore: true, reviewerScore: true, integrityScore: true },
          },
        },
      }),
    ]);

    // Aggregate stats
    const [totalSubmitted, totalApproved, totalRejected] = await Promise.all([
      prisma.taskSubmission.count({ where: { userId, status: { not: 'DRAFT' } } }),
      prisma.taskSubmission.count({ where: { userId, status: 'APPROVED' } }),
      prisma.taskSubmission.count({ where: { userId, status: 'REJECTED' } }),
    ]);

    return NextResponse.json(
      jsend.success({
        tier: user?.tier || 'NEW',
        trustScore: user?.profile?.trustScore || 0,
        reviewerScore: user?.profile?.reviewerScore || 0,
        integrityScore: user?.profile?.integrityScore || 100,
        stats: {
          totalSubmitted,
          totalApproved,
          totalRejected,
          acceptanceRate: totalSubmitted > 0 ? totalApproved / totalSubmitted : 0,
        },
        projectScores: scores,
        recentEvents: events,
      })
    );
  },
  { requireAuth: true }
);
