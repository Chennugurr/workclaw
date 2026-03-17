import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/analytics
 * Platform-wide analytics — GMV, active contributors, payout liabilities, trends.
 */
export const GET = middleware(
  requireAdmin(async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      // GMV — total earnings generated
      totalGMV,
      monthlyGMV,
      // Payouts
      totalPaidOut,
      pendingPayoutLiability,
      // Contributors
      totalContributors,
      activeContributors,
      // Tasks
      totalTasks,
      completedTasks,
      monthlyCompletedTasks,
      // Submissions
      totalSubmissions,
      monthlySubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      // Projects
      totalProjects,
      activeProjects,
      // Users by tier
      usersByTier,
      // Fraud
      openFraudFlags,
      confirmedFraudFlags,
      // Daily task completions (last 30 days)
      dailyCompletions,
    ] = await Promise.all([
      prisma.payoutLedgerEntry.aggregate({
        where: { type: 'TASK_EARNING' },
        _sum: { amount: true },
      }),
      prisma.payoutLedgerEntry.aggregate({
        where: { type: 'TASK_EARNING', createdAt: { gte: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
      prisma.payout.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payoutLedgerEntry.aggregate({
        where: {
          type: { in: ['TASK_EARNING', 'BONUS', 'STREAK_INCENTIVE', 'QUALITY_BONUS', 'REFERRAL_CREDIT'] },
        },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { role: 'CONTRIBUTOR' } }),
      prisma.taskSubmission.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: thirtyDaysAgo }, isDraft: false },
      }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'APPROVED' } }),
      prisma.task.count({ where: { status: 'APPROVED', updatedAt: { gte: thirtyDaysAgo } } }),
      prisma.taskSubmission.count({ where: { isDraft: false } }),
      prisma.taskSubmission.count({ where: { isDraft: false, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.taskSubmission.count({ where: { status: 'APPROVED' } }),
      prisma.taskSubmission.count({ where: { status: 'REJECTED' } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'OPEN' } }),
      prisma.user.groupBy({ by: ['tier'], _count: true }),
      prisma.fraudFlag.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.fraudFlag.count({ where: { status: 'CONFIRMED' } }),
      prisma.taskSubmission.groupBy({
        by: ['createdAt'],
        where: { isDraft: false, createdAt: { gte: thirtyDaysAgo } },
        _count: true,
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Aggregate daily completions into daily buckets
    const dailyBuckets = {};
    for (const entry of dailyCompletions) {
      const day = entry.createdAt.toISOString().slice(0, 10);
      dailyBuckets[day] = (dailyBuckets[day] || 0) + entry._count;
    }

    const totalPaid = parseFloat(totalPaidOut._sum.amount || 0);
    const totalEarnings = parseFloat(pendingPayoutLiability._sum.amount || 0);
    const outstandingLiability = Math.max(0, totalEarnings - totalPaid);

    const platformAcceptanceRate = (approvedSubmissions + rejectedSubmissions) > 0
      ? approvedSubmissions / (approvedSubmissions + rejectedSubmissions)
      : 0;

    return NextResponse.json(
      jsend.success({
        gmv: {
          total: parseFloat(totalGMV._sum.amount || 0),
          last30Days: parseFloat(monthlyGMV._sum.amount || 0),
        },
        payouts: {
          totalPaid,
          outstandingLiability,
        },
        contributors: {
          total: totalContributors,
          activeLast30Days: activeContributors.length,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completedLast30Days: monthlyCompletedTasks,
        },
        submissions: {
          total: totalSubmissions,
          last30Days: monthlySubmissions,
          approved: approvedSubmissions,
          rejected: rejectedSubmissions,
          acceptanceRate: platformAcceptanceRate,
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
        },
        usersByTier: Object.fromEntries(usersByTier.map((t) => [t.tier, t._count])),
        fraud: {
          openFlags: openFraudFlags,
          confirmedFlags: confirmedFraudFlags,
        },
        dailySubmissions: dailyBuckets,
      })
    );
  }),
  { requireAuth: true }
);
