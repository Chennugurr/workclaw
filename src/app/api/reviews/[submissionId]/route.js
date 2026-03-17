import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';
import { checkAgreementRings, updateIntegrityScore } from '@/lib/fraud';
import { NotificationTemplates } from '@/lib/notifications';

const reviewSchema = z.object({
  verdict: z.enum(['APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'ESCALATED']),
  score: z.number().min(0).max(1).optional().nullable(),
  comments: z.string().optional().nullable(),
  flags: z.array(z.string()).optional(),
});

/**
 * POST /api/reviews/:submissionId
 * Submit a review for a task submission.
 */
export const POST = middleware(
  async (req, { params }) => {
    const { submissionId } = await params;
    const { verdict, score, comments, flags } = req.dto;

    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: { select: { id: true, projectId: true, isGold: true } },
      },
    });

    if (!submission) {
      return NextResponse.json(jsend.fail({ message: 'Submission not found' }), {
        status: 404,
      });
    }

    // Verify reviewer has access to this project
    const hasAccess = await prisma.reviewerAssignment.findFirst({
      where: {
        projectId: submission.task.projectId,
        staff: { userId: req.user.id },
      },
    });

    if (!hasAccess) {
      return NextResponse.json(jsend.fail({ message: 'Not authorized to review' }), {
        status: 403,
      });
    }

    // Create review
    const review = await prisma.taskReview.create({
      data: {
        submissionId,
        reviewerId: req.user.id,
        verdict,
        score: score ?? null,
        comments: comments ?? null,
        flags: flags || [],
      },
    });

    // Update submission status
    const statusMap = {
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      REVISION_REQUESTED: 'REVISION_REQUESTED',
      ESCALATED: 'UNDER_REVIEW',
    };

    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: { status: statusMap[verdict] || 'UNDER_REVIEW' },
    });

    // Update task status for final verdicts
    if (verdict === 'APPROVED' || verdict === 'REJECTED') {
      await prisma.task.update({
        where: { id: submission.taskId },
        data: { status: verdict },
      });

      // Notify contributor
      const projectInfo = await prisma.project.findUnique({
        where: { id: submission.task.projectId },
        select: { title: true },
      });
      NotificationTemplates.reviewCompleted(
        submission.userId, verdict, projectInfo?.title || 'Unknown'
      ).catch(() => {});
    }

    // Create earnings ledger entry on approval
    if (verdict === 'APPROVED') {
      const project = await prisma.project.findUnique({
        where: { id: submission.task.projectId },
        select: { rateAmount: true, payModel: true, title: true },
      });

      if (project?.rateAmount) {
        await prisma.payoutLedgerEntry.create({
          data: {
            userId: submission.userId,
            type: 'TASK_EARNING',
            amount: parseFloat(project.rateAmount),
            currency: 'USDC',
            reference: submission.taskId,
            note: `Task approved — ${project.title}`,
          },
        });
      }
    }

    // Log reputation event
    const scoreDelta =
      verdict === 'APPROVED' ? 1 :
      verdict === 'REJECTED' ? -2 :
      verdict === 'REVISION_REQUESTED' ? -0.5 : 0;

    await prisma.reputationEvent.create({
      data: {
        userId: submission.userId,
        eventType: `REVIEW_${verdict}`,
        details: {
          taskId: submission.taskId,
          projectId: submission.task.projectId,
          reviewerId: req.user.id,
          score,
        },
        scoreDelta,
      },
    });

    // Update contributor score for the project
    await updateContributorScore(submission.userId, submission.task.projectId);

    // Async fraud checks (fire-and-forget)
    checkAgreementRings(submission.userId).catch(() => {});
    updateIntegrityScore(submission.userId).catch(() => {});

    return NextResponse.json(jsend.success(review), { status: 201 });
  },
  {
    requireAuth: true,
    bodySchema: reviewSchema,
  }
);

/**
 * Recompute a contributor's quality scores for a project.
 */
async function updateContributorScore(userId, projectId) {
  // Get all submissions for this user+project
  const submissions = await prisma.taskSubmission.findMany({
    where: {
      userId,
      task: { projectId },
      status: { in: ['APPROVED', 'REJECTED'] },
    },
    include: {
      reviews: { select: { verdict: true, score: true } },
      task: { select: { isGold: true, goldAnswer: true, taskType: true } },
    },
  });

  if (submissions.length === 0) return;

  const total = submissions.length;
  const approved = submissions.filter((s) => s.status === 'APPROVED').length;
  const acceptanceRate = approved / total;

  // Gold task accuracy
  const goldSubs = submissions.filter((s) => s.task.isGold);
  const goldCorrect = goldSubs.filter((s) => s.status === 'APPROVED').length;
  const goldTaskAccuracy = goldSubs.length > 0 ? goldCorrect / goldSubs.length : 0;

  // Average review score
  const scores = submissions
    .flatMap((s) => s.reviews)
    .map((r) => r.score)
    .filter((s) => s !== null && s !== undefined);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // Speed score — get from reputation events
  const speedAnomalies = await prisma.reputationEvent.count({
    where: {
      userId,
      eventType: 'SPEED_ANOMALY',
      details: { path: ['projectId'], equals: projectId },
    },
  });
  const speedScore = Math.max(0, 1 - speedAnomalies * 0.1);

  const overallScore = (acceptanceRate * 0.4 + goldTaskAccuracy * 0.3 + avgScore * 0.2 + speedScore * 0.1);

  await prisma.contributorScore.upsert({
    where: {
      userId_projectId: { userId, projectId },
    },
    create: {
      userId,
      projectId,
      acceptanceRate,
      goldTaskAccuracy,
      overallScore,
      speedScore,
    },
    update: {
      acceptanceRate,
      goldTaskAccuracy,
      overallScore,
      speedScore,
    },
  });

  // Check for tier upgrades
  await checkTierUpgrade(userId);
}

/**
 * Check if a contributor qualifies for a tier upgrade based on quality milestones.
 */
async function checkTierUpgrade(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });

  if (!user) return;

  // Get aggregate stats
  const totalApproved = await prisma.taskSubmission.count({
    where: { userId, status: 'APPROVED' },
  });

  const scores = await prisma.contributorScore.findMany({
    where: { userId },
    select: { overallScore: true, acceptanceRate: true },
  });

  const avgOverall = scores.length > 0
    ? scores.reduce((a, s) => a + s.overallScore, 0) / scores.length
    : 0;

  const screeningsPassed = await prisma.screeningAttempt.count({
    where: { userId, passed: true },
  });

  // Tier thresholds
  const TIERS = [
    { tier: 'ELITE_REVIEWER', minTasks: 500, minScore: 0.95, minScreenings: 5 },
    { tier: 'EXPERT', minTasks: 200, minScore: 0.9, minScreenings: 4 },
    { tier: 'TRUSTED', minTasks: 100, minScore: 0.85, minScreenings: 3 },
    { tier: 'SKILLED', minTasks: 50, minScore: 0.75, minScreenings: 2 },
    { tier: 'VERIFIED', minTasks: 10, minScore: 0.6, minScreenings: 1 },
  ];

  const TIER_ORDER = ['NEW', 'VERIFIED', 'SKILLED', 'TRUSTED', 'EXPERT', 'ELITE_REVIEWER'];
  const currentIdx = TIER_ORDER.indexOf(user.tier || 'NEW');

  for (const t of TIERS) {
    const tierIdx = TIER_ORDER.indexOf(t.tier);
    if (tierIdx > currentIdx &&
        totalApproved >= t.minTasks &&
        avgOverall >= t.minScore &&
        screeningsPassed >= t.minScreenings) {
      await prisma.user.update({
        where: { id: userId },
        data: { tier: t.tier },
      });

      await prisma.reputationEvent.create({
        data: {
          userId,
          eventType: 'TIER_UPGRADE',
          details: { from: user.tier, to: t.tier },
          scoreDelta: 5,
        },
      });

      NotificationTemplates.tierUpgrade(userId, user.tier || 'NEW', t.tier).catch(() => {});
      break;
    }
  }
}
