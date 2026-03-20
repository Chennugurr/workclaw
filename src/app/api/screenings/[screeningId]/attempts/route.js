import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

const submitSchema = z.object({
  answers: z.record(z.string(), z.any()),
});

/**
 * POST /api/screenings/:screeningId/attempts
 * Submit a screening attempt with answers.
 */
export const POST = middleware(
  async (req, { params }) => {
    const { screeningId } = await params;
    const { answers } = req.dto;

    // Fetch screening with questions
    const screening = await prisma.screening.findUnique({
      where: { id: screeningId, status: 'ACTIVE' },
      include: {
        questions: true,
        attempts: {
          where: { userId: req.user.id },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!screening) {
      return NextResponse.json(jsend.fail({ message: 'Screening not found' }), {
        status: 404,
      });
    }

    // Check max attempts
    const attemptCount = screening.attempts.length;
    if (attemptCount >= screening.maxAttempts) {
      return NextResponse.json(
        jsend.fail({ message: 'Maximum attempts reached' }),
        { status: 400 }
      );
    }

    // Check cooldown (24 hours between attempts)
    if (attemptCount > 0) {
      const lastAttempt = screening.attempts[0];
      const cooldownMs = 24 * 60 * 60 * 1000;
      const timeSince = Date.now() - new Date(lastAttempt.createdAt).getTime();
      if (timeSince < cooldownMs) {
        const hoursLeft = Math.ceil((cooldownMs - timeSince) / (60 * 60 * 1000));
        return NextResponse.json(
          jsend.fail({
            message: `Cooldown active. Try again in ${hoursLeft} hour(s).`,
          }),
          { status: 400 }
        );
      }
    }

    // Auto-grade MCQ and scenario-based questions
    let earnedPoints = 0;
    let totalPoints = 0;
    let hasManualQuestions = false;

    for (const question of screening.questions) {
      totalPoints += question.points;
      const answer = answers[question.id];

      if (
        question.questionType === 'MULTIPLE_CHOICE' ||
        question.questionType === 'SCENARIO_BASED'
      ) {
        const correctValue = typeof question.correctAnswer === 'string'
          ? question.correctAnswer
          : question.correctAnswer?.id || question.correctAnswer;
        if (
          correctValue &&
          answer &&
          answer === correctValue
        ) {
          earnedPoints += question.points;
        }
      } else if (
        question.questionType === 'SHORT_ANSWER' ||
        question.questionType === 'MANUAL_REVIEW'
      ) {
        hasManualQuestions = true;
      }
    }

    const autoScore = totalPoints > 0 ? earnedPoints / totalPoints : 0;
    const isFullyGraded = !hasManualQuestions;
    const passed = isFullyGraded ? autoScore >= screening.passingScore : null;

    const attempt = await prisma.screeningAttempt.create({
      data: {
        screeningId,
        userId: req.user.id,
        answers,
        score: isFullyGraded ? autoScore : null,
        passed,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(
      jsend.success({
        id: attempt.id,
        score: attempt.score,
        passed: attempt.passed,
        pendingReview: hasManualQuestions,
        attemptsRemaining: screening.maxAttempts - (attemptCount + 1),
      }),
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    bodySchema: submitSchema,
  }
);

/**
 * GET /api/screenings/:screeningId/attempts
 * Get current user's attempts for this screening.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { screeningId } = await params;

    const attempts = await prisma.screeningAttempt.findMany({
      where: {
        screeningId,
        userId: req.user.id,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        score: true,
        passed: true,
        createdAt: true,
        completedAt: true,
      },
    });

    return NextResponse.json(jsend.success(attempts));
  },
  { requireAuth: true }
);
