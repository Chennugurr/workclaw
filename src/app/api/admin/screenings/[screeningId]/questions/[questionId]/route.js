import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../../../middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  questionType: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'SCENARIO_BASED', 'MANUAL_REVIEW']).optional(),
  question: z.string().min(1).optional(),
  options: z.any().optional().nullable(),
  correctAnswer: z.any().optional().nullable(),
  points: z.number().optional(),
  order: z.number().int().optional(),
});

/**
 * PATCH /api/admin/screenings/:screeningId/questions/:questionId
 * Update a screening question.
 */
export const PATCH = middleware(
  requireAdmin(async (req, { params }) => {
    const { screeningId, questionId } = await params;

    // Verify question belongs to screening
    const existing = await prisma.screeningQuestion.findFirst({
      where: { id: questionId, screeningId },
    });

    if (!existing) {
      return NextResponse.json(
        jsend.fail({ message: 'Question not found' }),
        { status: 404 }
      );
    }

    const question = await prisma.screeningQuestion.update({
      where: { id: questionId },
      data: req.dto,
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'SCREENING_QUESTION_UPDATE',
        target: 'ScreeningQuestion',
        targetId: questionId,
        details: { screeningId, ...req.dto },
      },
    });

    return NextResponse.json(jsend.success(question));
  }),
  { requireAuth: true, bodySchema: updateSchema }
);

/**
 * DELETE /api/admin/screenings/:screeningId/questions/:questionId
 * Delete a screening question.
 */
export const DELETE = middleware(
  requireAdmin(async (req, { params }) => {
    const { screeningId, questionId } = await params;

    // Verify question belongs to screening
    const existing = await prisma.screeningQuestion.findFirst({
      where: { id: questionId, screeningId },
    });

    if (!existing) {
      return NextResponse.json(
        jsend.fail({ message: 'Question not found' }),
        { status: 404 }
      );
    }

    await prisma.screeningQuestion.delete({ where: { id: questionId } });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'SCREENING_QUESTION_DELETE',
        target: 'ScreeningQuestion',
        targetId: questionId,
        details: { screeningId },
      },
    });

    return NextResponse.json(jsend.success({ message: 'Deleted' }));
  }),
  { requireAuth: true }
);
