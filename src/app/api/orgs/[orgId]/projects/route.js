import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  taskType: z.enum([
    'SINGLE_RESPONSE_RATING',
    'PAIRWISE_COMPARISON',
    'MULTI_RESPONSE_RANKING',
    'LABEL_CLASSIFICATION',
    'TEXT_ANNOTATION',
    'CODE_REVIEW',
    'FACTUALITY_VERIFICATION',
    'SAFETY_REVIEW',
    'SCAM_CLASSIFICATION',
    'CONTRACT_VALIDATION',
    'RESEARCH_GRADING',
    'AGENT_EVALUATION',
    'PROMPT_WRITING',
    'TRANSLATION_REVIEW',
  ]),
  domain: z.array(z.string()).default([]),
  chainTags: z.array(z.string()).default([]),
  modelOrUseCase: z.string().optional().nullable(),
  payModel: z.enum(['PER_TASK', 'HOURLY']),
  rateAmount: z.number().positive(),
  currency: z.enum(['USDC']).default('USDC'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
  qualityThreshold: z.number().min(0).max(1).default(0.8),
  qualityBonusEligible: z.boolean().default(false),
  capacity: z.number().int().positive().optional().nullable(),
  taskVolume: z.number().int().positive().optional().nullable(),
  goldTaskRatio: z.number().min(0).max(1).default(0.05),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'OPEN']).default('DRAFT'),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INVITE_ONLY']).default('PUBLIC'),
  regionLimits: z.array(z.string()).default([]),
  languageLimits: z.array(z.string()).default([]),
  requiredTier: z.enum(['NEW', 'VERIFIED', 'SKILLED', 'TRUSTED', 'EXPERT', 'ELITE_REVIEWER']).default('NEW'),
  reviewPolicy: z.string().optional().nullable(),
  disputeRules: z.string().optional().nullable(),
  payoutRules: z.string().optional().nullable(),
  rubric: z.any().optional().nullable(),
  instructions: z.string().optional().nullable(),
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100);
}

/**
 * GET /api/orgs/:orgId/projects
 * List organization's projects.
 */
export const GET = middleware(
  async (req, { params }) => {
    const { orgId } = await params;
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where = { orgId };
    if (status) where.status = status;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          _count: { select: { applications: true, tasks: true, taskBatches: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: projects,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.MEMBER] },
  }
);

/**
 * POST /api/orgs/:orgId/projects
 * Create a new project.
 */
export const POST = middleware(
  async (req, { params }) => {
    const { orgId } = await params;
    const data = req.dto;

    // Generate unique slug
    const baseSlug = slugify(data.title);
    let slug = baseSlug;
    let counter = 0;
    while (await prisma.project.findUnique({ where: { slug } })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const project = await prisma.project.create({
      data: {
        orgId,
        title: data.title,
        slug,
        description: data.description,
        taskType: data.taskType,
        domain: data.domain,
        chainTags: data.chainTags,
        modelOrUseCase: data.modelOrUseCase || null,
        payModel: data.payModel,
        rateAmount: data.rateAmount,
        currency: data.currency,
        difficulty: data.difficulty,
        qualityThreshold: data.qualityThreshold,
        qualityBonusEligible: data.qualityBonusEligible,
        capacity: data.capacity || null,
        taskVolume: data.taskVolume || null,
        goldTaskRatio: data.goldTaskRatio,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        visibility: data.visibility,
        regionLimits: data.regionLimits,
        languageLimits: data.languageLimits,
        requiredTier: data.requiredTier,
        reviewPolicy: data.reviewPolicy || null,
        disputeRules: data.disputeRules || null,
        payoutRules: data.payoutRules || null,
      },
      include: {
        organization: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(jsend.success(project), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2002') {
      return NextResponse.json(
        jsend.fail({ message: 'A project with this slug already exists' }),
        { status: 400 }
      );
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema: projectSchema,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);
