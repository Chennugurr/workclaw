import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/stats
 * Platform-wide admin dashboard stats.
 */
export const GET = middleware(
  requireAdmin(async (req) => {
    const [
      totalUsers,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      totalSubmissions,
      pendingPayouts,
      totalPayoutAmount,
      openFraudFlags,
      usersByTier,
      usersByRole,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'OPEN' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'APPROVED' } }),
      prisma.taskSubmission.count({ where: { isDraft: false } }),
      prisma.payout.count({ where: { status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] } } }),
      prisma.payout.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.fraudFlag.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.user.groupBy({ by: ['tier'], _count: true }),
      prisma.user.groupBy({ by: ['role'], _count: true }),
    ]);

    return NextResponse.json(
      jsend.success({
        users: {
          total: totalUsers,
          byTier: Object.fromEntries(usersByTier.map((t) => [t.tier, t._count])),
          byRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count])),
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
        },
        submissions: {
          total: totalSubmissions,
        },
        payouts: {
          pending: pendingPayouts,
          totalPaid: parseFloat(totalPayoutAmount._sum.amount || 0),
        },
        fraud: {
          openFlags: openFraudFlags,
        },
      })
    );
  }),
  { requireAuth: true }
);
