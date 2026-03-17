import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/earnings
 * Get contributor's earnings summary and ledger entries.
 * Query params: period (today|week|month|all), page, limit
 */
export const GET = middleware(
  async (req) => {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const userId = req.user.id;

    // Period filter
    const now = new Date();
    let periodFilter = {};
    if (period === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodFilter = { createdAt: { gte: start } };
    } else if (period === 'week') {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      periodFilter = { createdAt: { gte: start } };
    } else if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      periodFilter = { createdAt: { gte: start } };
    }

    // Fetch ledger entries
    const [entries, total] = await Promise.all([
      prisma.payoutLedgerEntry.findMany({
        where: { userId, ...periodFilter },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payoutLedgerEntry.count({
        where: { userId, ...periodFilter },
      }),
    ]);

    // Compute balances
    const allEntries = await prisma.payoutLedgerEntry.findMany({
      where: { userId },
      select: { amount: true, payoutId: true, type: true, createdAt: true },
    });

    const totalBalance = allEntries.reduce(
      (sum, e) => sum + parseFloat(e.amount), 0
    );
    const pendingBalance = allEntries
      .filter((e) => !e.payoutId && parseFloat(e.amount) > 0)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const paidOut = allEntries
      .filter((e) => e.type === 'PAYOUT_DEBIT')
      .reduce((sum, e) => sum + Math.abs(parseFloat(e.amount)), 0);

    // Period earnings
    const periodEntries = period !== 'all'
      ? allEntries.filter((e) => {
          const d = new Date(e.createdAt);
          if (period === 'today') {
            return d.toDateString() === now.toDateString();
          } else if (period === 'week') {
            const start = new Date(now);
            start.setDate(start.getDate() - start.getDay());
            start.setHours(0, 0, 0, 0);
            return d >= start;
          } else if (period === 'month') {
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }
          return true;
        })
      : allEntries;

    const periodEarnings = periodEntries
      .filter((e) => parseFloat(e.amount) > 0)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return NextResponse.json(
      jsend.success({
        summary: {
          totalBalance: totalBalance.toFixed(2),
          pendingBalance: pendingBalance.toFixed(2),
          paidOut: paidOut.toFixed(2),
          periodEarnings: periodEarnings.toFixed(2),
        },
        entries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  },
  { requireAuth: true }
);
