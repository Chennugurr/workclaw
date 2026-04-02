import { NextResponse } from 'next/server';
import jsend from 'jsend';
import prisma from '@/lib/prisma';

function authCheck(req) {
  const secret = req.headers.get('x-admin-secret');
  return secret && secret === process.env.JWT_SECRET;
}

/**
 * POST /api/admin/backfill-earnings
 * Create TASK_EARNING ledger entries for all SUBMITTED/APPROVED task submissions
 * that don't already have one. Safe to run multiple times (idempotent).
 */
export const POST = async (req) => {
  if (!authCheck(req)) {
    return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  }

  // Get all non-draft submissions that could have earnings
  const submissions = await prisma.taskSubmission.findMany({
    where: {
      isDraft: false,
      status: { in: ['SUBMITTED', 'APPROVED', 'UNDER_REVIEW', 'REVISION_REQUESTED'] },
    },
    include: {
      task: {
        include: {
          project: { select: { id: true, title: true, rateAmount: true } },
        },
      },
    },
  });

  // Get all existing TASK_EARNING entries keyed by reference (taskId)
  const existing = await prisma.payoutLedgerEntry.findMany({
    where: { type: 'TASK_EARNING' },
    select: { reference: true, userId: true },
  });

  // Build a set of "userId:taskId" that already have an entry
  const existingSet = new Set(existing.map((e) => `${e.userId}:${e.reference}`));

  let created = 0;
  let skipped = 0;
  const details = [];

  for (const sub of submissions) {
    const rateAmount = parseFloat(sub.task.project?.rateAmount || 0);

    if (rateAmount <= 0) {
      skipped++;
      continue;
    }

    const key = `${sub.userId}:${sub.taskId}`;
    if (existingSet.has(key)) {
      skipped++;
      continue;
    }

    await prisma.payoutLedgerEntry.create({
      data: {
        userId: sub.userId,
        type: 'TASK_EARNING',
        amount: rateAmount,
        currency: 'USD',
        reference: sub.taskId,
        note: `Task completed: ${sub.task.project?.title || 'Project'} [backfilled]`,
      },
    });

    existingSet.add(key); // prevent duplicates within same run
    created++;
    details.push({ userId: sub.userId, taskId: sub.taskId, amount: rateAmount });
  }

  return NextResponse.json(
    jsend.success({
      created,
      skipped,
      totalProcessed: submissions.length,
      details,
    })
  );
};
