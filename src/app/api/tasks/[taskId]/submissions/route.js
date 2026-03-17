import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';
import { checkLowEffortSubmission, checkBenchmarkFailures, updateIntegrityScore } from '@/lib/fraud';

const MINIMUM_TIME_SECONDS = 10;

const submissionSchema = z.object({
  response: z.any(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  reasoning: z.string().optional().nullable(),
  isDraft: z.boolean().default(false),
  timeSpent: z.number().optional().nullable(),
});

/**
 * POST /api/tasks/:taskId/submissions
 * Create or update a submission (save draft or submit).
 */
export const POST = middleware(
  async (req, { params }) => {
    const { taskId } = await params;
    const { response, confidence, reasoning, isDraft, timeSpent } = req.dto;

    // Verify task exists and is assigned to user
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(jsend.fail({ message: 'Task not found' }), {
        status: 404,
      });
    }

    if (task.assignedTo !== req.user.id) {
      return NextResponse.json(jsend.fail({ message: 'Not assigned to you' }), {
        status: 403,
      });
    }

    if (!['ASSIGNED', 'IN_PROGRESS'].includes(task.status)) {
      return NextResponse.json(
        jsend.fail({ message: 'Task is no longer active' }),
        { status: 400 }
      );
    }

    // Speed detection for non-draft submissions
    const flags = [];
    if (!isDraft && timeSpent !== null && timeSpent !== undefined) {
      if (timeSpent < MINIMUM_TIME_SECONDS) {
        flags.push('IMPOSSIBLY_FAST');
      }
    }

    // Upsert submission
    const submission = await prisma.taskSubmission.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId: req.user.id,
        },
      },
      create: {
        taskId,
        userId: req.user.id,
        response,
        confidence: confidence ?? null,
        reasoning: reasoning ?? null,
        timeSpent: timeSpent ?? null,
        isDraft,
        status: isDraft ? 'DRAFT' : 'SUBMITTED',
        submittedAt: isDraft ? null : new Date(),
      },
      update: {
        response,
        confidence: confidence ?? null,
        reasoning: reasoning ?? null,
        timeSpent: timeSpent ?? null,
        isDraft,
        status: isDraft ? 'DRAFT' : 'SUBMITTED',
        submittedAt: isDraft ? undefined : new Date(),
      },
    });

    // Update task status on final submit
    if (!isDraft) {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'SUBMITTED' },
      });

      // Check gold task accuracy
      if (task.isGold && task.goldAnswer) {
        const isCorrect = checkGoldAnswer(task, response);
        // Log as reputation event
        await prisma.reputationEvent.create({
          data: {
            userId: req.user.id,
            eventType: isCorrect ? 'GOLD_TASK_CORRECT' : 'GOLD_TASK_INCORRECT',
            details: { taskId, projectId: task.projectId },
            scoreDelta: isCorrect ? 0.5 : -1,
          },
        });
      }

      // Flag speed anomaly
      if (flags.includes('IMPOSSIBLY_FAST')) {
        await prisma.reputationEvent.create({
          data: {
            userId: req.user.id,
            eventType: 'SPEED_ANOMALY',
            details: { taskId, timeSpent, projectId: task.projectId },
            scoreDelta: -0.5,
          },
        });
      }

      // Async fraud checks (fire-and-forget)
      checkLowEffortSubmission(submission).catch(() => {});
      checkBenchmarkFailures(req.user.id, task.projectId).catch(() => {});
      updateIntegrityScore(req.user.id).catch(() => {});
    }

    return NextResponse.json(jsend.success(submission), {
      status: isDraft ? 200 : 201,
    });
  },
  {
    requireAuth: true,
    bodySchema: submissionSchema,
  }
);

/**
 * Basic gold answer check — compares response structure against known answer.
 * Extensible per task type.
 */
function checkGoldAnswer(task, response) {
  try {
    const gold = task.goldAnswer;
    if (!gold || !response) return false;

    switch (task.taskType) {
      case 'SINGLE_RESPONSE_RATING':
        return gold.overallRating === response.overallRating;
      case 'PAIRWISE_COMPARISON':
        return gold.preferred === response.preferred;
      case 'MULTI_RESPONSE_RANKING':
        return JSON.stringify(gold.ranking) === JSON.stringify(response.ranking);
      case 'LABEL_CLASSIFICATION':
      case 'SCAM_CLASSIFICATION':
        return JSON.stringify(gold.selectedLabels?.sort()) === JSON.stringify(response.selectedLabels?.sort());
      case 'FACTUALITY_VERIFICATION':
        return gold.verdict === response.verdict;
      case 'SAFETY_REVIEW':
        return gold.safetyRating === response.safetyRating;
      default:
        return false;
    }
  } catch {
    return false;
  }
}
