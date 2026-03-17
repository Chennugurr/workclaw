import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const projectUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  taskType: z.enum([
    'SINGLE_RESPONSE_RATING', 'PAIRWISE_COMPARISON', 'MULTI_RESPONSE_RANKING',
    'LABEL_CLASSIFICATION', 'TEXT_ANNOTATION', 'CODE_REVIEW',
    'FACTUALITY_VERIFICATION', 'SAFETY_REVIEW', 'SCAM_CLASSIFICATION',
    'CONTRACT_VALIDATION', 'RESEARCH_GRADING', 'AGENT_EVALUATION',
    'PROMPT_WRITING', 'TRANSLATION_REVIEW',
  ]).optional(),
  domain: z.array(z.string()).optional(),
  chainTags: z.array(z.string()).optional(),
  modelOrUseCase: z.string().optional().nullable(),
  payModel: z.enum(['PER_TASK', 'HOURLY']).optional(),
  rateAmount: z.number().positive().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  qualityThreshold: z.number().min(0).max(1).optional(),
  qualityBonusEligible: z.boolean().optional(),
  capacity: z.number().int().positive().optional().nullable(),
  taskVolume: z.number().int().positive().optional().nullable(),
  goldTaskRatio: z.number().min(0).max(1).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'SCREENING_SETUP', 'INVITE_ONLY', 'OPEN', 'PAUSED', 'FULL', 'ARCHIVED']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INVITE_ONLY']).optional(),
  regionLimits: z.array(z.string()).optional(),
  languageLimits: z.array(z.string()).optional(),
  requiredTier: z.enum(['NEW', 'VERIFIED', 'SKILLED', 'TRUSTED', 'EXPERT', 'ELITE_REVIEWER']).optional(),
  reviewPolicy: z.string().optional().nullable(),
  disputeRules: z.string().optional().nullable(),
  payoutRules: z.string().optional().nullable(),
});

/**
 * GET /api/orgs/:orgId/projects/:projectId
 * Get project details for customer management.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      include: {
        _count: { select: { applications: true, tasks: true, taskBatches: true } },
        taskBatches: { orderBy: { createdAt: 'desc' }, take: 5 },
        screenings: { select: { id: true, title: true, status: true, domain: true } },
        reviewerAssignments: {
          include: { user: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } } },
        },
      },
    });

    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }

    return NextResponse.json(jsend.success(project));
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.MEMBER] },
  }
);

/**
 * PATCH /api/orgs/:orgId/projects/:projectId
 * Update project.
 */
export const PATCH = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;
    const updateData = { ...req.dto };

    // Convert date strings to Date objects
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const project = await prisma.project.update({
      where: { id: projectId, orgId },
      data: updateData,
      include: {
        _count: { select: { applications: true, tasks: true, taskBatches: true } },
      },
    });

    return NextResponse.json(jsend.success(project));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema: projectUpdateSchema,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);

/**
 * DELETE /api/orgs/:orgId/projects/:projectId
 * Delete (archive) a project.
 */
export const DELETE = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { status: true, _count: { select: { tasks: true } } },
    });

    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }

    // If project has tasks, archive instead of delete
    if (project._count.tasks > 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'ARCHIVED' },
      });
      return NextResponse.json(jsend.success({ message: 'Project archived' }));
    }

    await prisma.project.delete({ where: { id: projectId } });
    return NextResponse.json(jsend.success({ message: 'Project deleted' }));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);
