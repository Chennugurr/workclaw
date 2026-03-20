import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../../middleware';
import prisma from '@/lib/prisma';

const createSchema = z.object({
  questionType: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'SCENARIO_BASED', 'MANUAL_REVIEW']),
  question: z.string().min(1),
  options: z.any().optional().nullable(),
  correctAnswer: z.any().optional().nullable(),
  points: z.number().default(1),
  order: z.number().int(),
});

/**
 * POST /api/admin/screenings/:screeningId/questions
 * Add a question to a screening.
 */
export const POST = middleware(
  requireAdmin(async (req, { params }) => {
    const { screeningId } = await params;

    // Verify screening exists
    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
    });

    if (!screening) {
      return NextResponse.json(
        jsend.fail({ message: 'Screening not found' }),
        { status: 404 }
      );
    }

    const question = await prisma.screeningQuestion.create({
      data: {
        screeningId,
        ...req.dto,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'SCREENING_QUESTION_CREATE',
        target: 'ScreeningQuestion',
        targetId: question.id,
        details: { screeningId, questionType: req.dto.questionType },
      },
    });

    return NextResponse.json(jsend.success(question), { status: 201 });
  }),
  { requireAuth: true, bodySchema: createSchema }
);
