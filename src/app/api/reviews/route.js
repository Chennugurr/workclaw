import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/reviews
 * Get the review queue for the authenticated reviewer.
 * Query params: status (pending|reviewed|all), projectId, page, limit
 */
export const GET = middleware(
  async (req) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    const projectId = url.searchParams.get('projectId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Find projects where user is a reviewer
    const assignments = await prisma.reviewerAssignment.findMany({
      where: {
        staff: { userId: req.user.id },
      },
      select: { projectId: true },
    });

    const reviewerProjectIds = assignments.map((a) => a.projectId);
    if (reviewerProjectIds.length === 0) {
      return NextResponse.json(
        jsend.success({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } })
      );
    }

    const where = {
      task: {
        projectId: projectId
          ? { equals: projectId }
          : { in: reviewerProjectIds },
      },
    };

    if (status === 'pending') {
      where.status = 'SUBMITTED';
      where.reviews = { none: {} };
    } else if (status === 'reviewed') {
      where.reviews = { some: { reviewerId: req.user.id } };
    }

    const [submissions, total] = await Promise.all([
      prisma.taskSubmission.findMany({
        where,
        include: {
          task: {
            select: {
              id: true,
              taskType: true,
              data: true,
              instructions: true,
              rubric: true,
              isGold: true,
              goldAnswer: true,
              project: {
                select: { id: true, title: true },
              },
            },
          },
          user: {
            select: {
              id: true,
              profile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          reviews: {
            where: { reviewerId: req.user.id },
            select: {
              id: true,
              verdict: true,
              score: true,
              comments: true,
              createdAt: true,
            },
          },
        },
        orderBy: { submittedAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.taskSubmission.count({ where }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  },
  { requireAuth: true }
);
