import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/screenings/:screeningId
 * Get screening details. If user is authenticated and starting, include questions.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { screeningId } = await params;
    const url = new URL(req.url);
    const includeQuestions = url.searchParams.get('start') === 'true';

    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
      include: {
        questions: includeQuestions
          ? {
              select: {
                id: true,
                questionType: true,
                question: true,
                options: true,
                points: true,
                order: true,
              },
              orderBy: { order: 'asc' },
            }
          : {
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
    });

    if (!screening) {
      return NextResponse.json(jsend.fail({ message: 'Screening not found' }), {
        status: 404,
      });
    }

    const result = {
      ...screening,
      questionCount: screening.questions.length,
      totalPoints: screening.questions.reduce((sum, q) => sum + q.points, 0),
    };

    // Don't expose correct answers
    if (includeQuestions) {
      result.questions = screening.questions.map((q) => ({
        id: q.id,
        questionType: q.questionType,
        question: q.question,
        options: q.options,
        points: q.points,
        order: q.order,
      }));
    } else {
      delete result.questions;
    }

    return NextResponse.json(jsend.success(result));
  },
  { withAuth: true }
);
