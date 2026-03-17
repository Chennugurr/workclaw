import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/screenings
 * List all active screenings. If authenticated, includes the user's attempt history.
 */
export const GET = middleware(
  async (req) => {
    const screenings = await prisma.screening.findMany({
      where: { status: 'ACTIVE' },
      include: {
        questions: {
          select: { id: true, points: true },
        },
        ...(req.user
          ? {
              attempts: {
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' },
                select: {
                  id: true,
                  score: true,
                  passed: true,
                  createdAt: true,
                  completedAt: true,
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = screenings.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      domain: s.domain,
      passingScore: s.passingScore,
      maxAttempts: s.maxAttempts,
      timeLimitMins: s.timeLimitMins,
      questionCount: s.questions.length,
      totalPoints: s.questions.reduce((sum, q) => sum + q.points, 0),
      attempts: s.attempts || [],
    }));

    return NextResponse.json(jsend.success(result));
  },
  { withAuth: true }
);
