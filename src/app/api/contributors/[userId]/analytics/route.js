import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/contributors/:userId/analytics
 * Contributor performance analytics — quality trends, earnings, task breakdown.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { userId } = await params;

    // Only allow self-access
    if (req.user.id !== userId) {
      return NextResponse.json(jsend.fail({ message: 'Forbidden' }), { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      revisionSubmissions,
      recentSubmissions,
      scores,
      earningsResult,
      recentEarnings,
      reputationEvents,
      badges,
      screeningsPassed,
    ] = await Promise.all([
      prisma.taskSubmission.count({ where: { userId, isDraft: false } }),
      prisma.taskSubmission.count({ where: { userId, status: 'APPROVED' } }),
      prisma.taskSubmission.count({ where: { userId, status: 'REJECTED' } }),
      prisma.taskSubmission.count({ where: { userId, status: 'REVISION_REQUESTED' } }),
      prisma.taskSubmission.findMany({
        where: { userId, isDraft: false, createdAt: { gte: thirtyDaysAgo } },
        select: { status: true, createdAt: true, confidence: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.contributorScore.findMany({
        where: { userId },
        include: { project: { select: { title: true, taskType: true } } },
      }),
      prisma.payoutLedgerEntry.aggregate({
        where: { userId, type: 'TASK_EARNING' },
        _sum: { amount: true },
      }),
      prisma.payoutLedgerEntry.findMany({
        where: { userId, type: 'TASK_EARNING', createdAt: { gte: thirtyDaysAgo } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.reputationEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { eventType: true, scoreDelta: true, createdAt: true, details: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { badges: true },
      }),
      prisma.screeningAttempt.count({ where: { userId, passed: true } }),
    ]);

    // Aggregate daily earnings for chart
    const dailyEarnings = {};
    for (const entry of recentEarnings) {
      const day = entry.createdAt.toISOString().slice(0, 10);
      dailyEarnings[day] = (dailyEarnings[day] || 0) + parseFloat(entry.amount);
    }

    // Aggregate daily submissions for chart
    const dailySubmissions = {};
    for (const sub of recentSubmissions) {
      const day = sub.createdAt.toISOString().slice(0, 10);
      if (!dailySubmissions[day]) {
        dailySubmissions[day] = { total: 0, approved: 0, rejected: 0 };
      }
      dailySubmissions[day].total++;
      if (sub.status === 'APPROVED') dailySubmissions[day].approved++;
      if (sub.status === 'REJECTED') dailySubmissions[day].rejected++;
    }

    const acceptanceRate = totalSubmissions > 0
      ? approvedSubmissions / (approvedSubmissions + rejectedSubmissions || 1)
      : 0;

    return NextResponse.json(
      jsend.success({
        overview: {
          totalSubmissions,
          approvedSubmissions,
          rejectedSubmissions,
          revisionSubmissions,
          acceptanceRate,
          totalEarnings: parseFloat(earningsResult._sum.amount || 0),
          screeningsPassed,
          badgeCount: badges?.badges?.length || 0,
        },
        projectScores: scores.map((s) => ({
          projectId: s.projectId,
          projectTitle: s.project?.title || 'Unknown',
          taskType: s.project?.taskType,
          acceptanceRate: s.acceptanceRate,
          goldTaskAccuracy: s.goldTaskAccuracy,
          overallScore: s.overallScore,
          speedScore: s.speedScore,
        })),
        dailyEarnings,
        dailySubmissions,
        recentReputation: reputationEvents,
      })
    );
  },
  { requireAuth: true }
);
