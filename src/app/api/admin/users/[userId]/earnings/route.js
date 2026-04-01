import jsend from 'jsend';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function authCheck(req) {
  const secret = req.headers.get('x-admin-secret');
  return secret && secret === process.env.JWT_SECRET;
}

/**
 * GET /api/admin/users/:userId/earnings
 * Debug endpoint: run earnings calculation for a user directly.
 */
export const GET = async (req, { params }) => {
  if (!authCheck(req)) return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  const { userId } = await params;

  const allEntries = await prisma.payoutLedgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const totalBalance = allEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const pendingBalance = Math.max(0, totalBalance);
  const paidOut = allEntries
    .filter((e) => e.type === 'PAYOUT_DEBIT')
    .reduce((sum, e) => sum + Math.abs(parseFloat(e.amount)), 0);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, address: true, role: true, tier: true },
  });

  return NextResponse.json(
    jsend.success({
      user,
      summary: {
        totalBalance: totalBalance.toFixed(2),
        pendingBalance: pendingBalance.toFixed(2),
        paidOut: paidOut.toFixed(2),
        entryCount: allEntries.length,
      },
      entries: allEntries,
    })
  );
};
