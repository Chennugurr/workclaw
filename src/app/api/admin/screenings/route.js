import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import prisma from '@/lib/prisma';

const questionSchema = z.object({
  questionType: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'SCENARIO_BASED', 'MANUAL_REVIEW']),
  question: z.string().min(1),
  options: z.any().optional().nullable(),
  correctAnswer: z.any().optional().nullable(),
  points: z.number().default(1),
  order: z.number().int(),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  domain: z.string().min(1),
  passingScore: z.number().min(0).max(1).default(0.7),
  maxAttempts: z.number().int().min(1).default(3),
  timeLimitMins: z.number().int().min(1).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  projectId: z.string().optional().nullable(),
  questions: z.array(questionSchema).optional().default([]),
});

/**
 * GET /api/admin/screenings
 * List all screenings with question counts.
 */
export const GET = middleware(
  requireAdmin(async (req) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const status = url.searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [screenings, total] = await Promise.all([
      prisma.screening.findMany({
        where,
        include: {
          project: { select: { id: true, title: true } },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.screening.count({ where }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: screenings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  }),
  { requireAuth: true }
);

function adminSecretAuth(req) {
  const secret = req.headers.get('x-admin-secret');
  return secret && secret === process.env.JWT_SECRET;
}

/**
 * POST /api/admin/screenings
 * Create a new screening with optional inline questions.
 * Accepts either JWT admin session or x-admin-secret header.
 */
export const POST = middleware(
  async (req) => {
    if (!adminSecretAuth(req) && (!req.user || req.user.role !== 'ADMIN')) {
      return NextResponse.json(jsend.fail({ message: 'Admin access required' }), { status: 403 });
    }
    const { questions, ...screeningData } = req.dto;
    const actorId = req.user?.id || 'system';

    const screening = await prisma.screening.create({
      data: {
        ...screeningData,
        questions: questions.length > 0
          ? { create: questions }
          : undefined,
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
        project: { select: { id: true, title: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actorId,
        action: 'SCREENING_CREATE',
        target: 'Screening',
        targetId: screening.id,
        details: { title: screeningData.title, questionCount: questions.length },
      },
    });

    return NextResponse.json(jsend.success(screening), { status: 201 });
  }),
  { requireAuth: true, bodySchema: createSchema }
);
