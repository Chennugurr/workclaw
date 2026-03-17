import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';
import { BADGES, BADGE_MAP } from '@/constants/badges';

/**
 * GET /api/contributors/:userId/badges
 * Get earned badges and check for newly earned ones.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { badges: true },
    });

    if (!user) {
      return NextResponse.json(jsend.fail({ message: 'User not found' }), {
        status: 404,
      });
    }

    const earned = user.badges.map((id) => BADGE_MAP[id]).filter(Boolean);
    return NextResponse.json(jsend.success(earned));
  },
  { requireAuth: true }
);

/**
 * POST /api/contributors/:userId/badges
 * Check and award any newly earned badges.
 */
export const POST = middleware(
  async (req, { params }) => {
    const { userId } = await params;

    // Only allow self or admin
    if (req.user.id !== userId) {
      return NextResponse.json(jsend.fail({ message: 'Forbidden' }), { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { badges: true },
    });

    if (!user) {
      return NextResponse.json(jsend.fail({ message: 'User not found' }), {
        status: 404,
      });
    }

    const currentBadges = new Set(user.badges);
    const newBadges = [];

    // Fetch stats needed for badge evaluation
    const [
      approvedCount,
      totalSubmitted,
      passedScreenings,
      goldTasksCorrect,
      goldTasksTotal,
    ] = await Promise.all([
      prisma.taskSubmission.count({ where: { userId, status: 'APPROVED' } }),
      prisma.taskSubmission.count({ where: { userId, status: { not: 'DRAFT' } } }),
      prisma.screeningAttempt.findMany({
        where: { userId, passed: true },
        select: { screening: { select: { domain: true } } },
        distinct: ['screeningId'],
      }),
      prisma.reputationEvent.count({
        where: { userId, eventType: 'GOLD_TASK_CORRECT' },
      }),
      prisma.reputationEvent.count({
        where: {
          userId,
          eventType: { in: ['GOLD_TASK_CORRECT', 'GOLD_TASK_INCORRECT'] },
        },
      }),
    ]);

    const acceptanceRate = totalSubmitted > 0 ? approvedCount / totalSubmitted : 0;
    const passedDomains = new Set(passedScreenings.map((s) => s.screening.domain));
    const goldAccuracy = goldTasksTotal > 0 ? goldTasksCorrect / goldTasksTotal : 0;

    for (const badge of BADGES) {
      if (currentBadges.has(badge.id)) continue;

      let earned = false;
      const c = badge.criteria;

      switch (c.type) {
        case 'screening_passed':
          earned = passedDomains.has(c.domain);
          break;
        case 'tasks_approved':
          earned = approvedCount >= c.count;
          break;
        case 'acceptance_rate':
          earned = totalSubmitted >= (c.minTasks || 0) && acceptanceRate >= c.rate;
          break;
        case 'gold_accuracy':
          earned = goldTasksTotal >= (c.minGoldTasks || 0) && goldAccuracy >= c.rate;
          break;
        case 'screenings_passed':
          earned = passedDomains.size >= c.count;
          break;
      }

      if (earned) {
        newBadges.push(badge.id);
      }
    }

    if (newBadges.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          badges: { push: newBadges },
        },
      });

      // Log reputation events for new badges
      await prisma.reputationEvent.createMany({
        data: newBadges.map((badgeId) => ({
          userId,
          eventType: 'BADGE_EARNED',
          details: { badgeId, badgeName: BADGE_MAP[badgeId]?.name },
          scoreDelta: 1,
        })),
      });
    }

    const allBadges = [...user.badges, ...newBadges].map((id) => BADGE_MAP[id]).filter(Boolean);
    return NextResponse.json(
      jsend.success({ badges: allBadges, newlyEarned: newBadges.map((id) => BADGE_MAP[id]) })
    );
  },
  { requireAuth: true }
);
