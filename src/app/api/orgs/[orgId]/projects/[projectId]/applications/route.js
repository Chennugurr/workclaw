import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/orgs/:orgId/projects/:projectId/applications
 * List applications for a project (customer view).
 */
export const GET = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }

    const where = { projectId };
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              address: true,
              tier: true,
              profile: {
                select: { firstName: true, lastName: true, pfp: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: applications,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.MEMBER] },
  }
);

const applySchema = z.object({
  note: z.string().optional(),
});

/**
 * POST /api/orgs/:orgId/projects/:projectId/applications
 * Apply to a project (contributor).
 */
export const POST = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;
    const { note } = req.dto;

    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId, status: { in: ['OPEN', 'INVITE_ONLY'] } },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        jsend.fail({ message: 'Project not found or not accepting applications' }),
        { status: 404 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } },
    });

    if (existing) {
      return NextResponse.json(
        jsend.fail({ message: 'You have already applied to this project' }),
        { status: 409 }
      );
    }

    // Auto-approve if the project's org has no human reviewers (internal/open projects)
    const staffCount = await prisma.organizationStaff.count({ where: { orgId } });
    const autoApprove = staffCount === 0;

    const application = await prisma.application.create({
      data: {
        userId: req.user.id,
        projectId,
        note: note || null,
        status: autoApprove ? 'APPROVED' : 'PENDING',
      },
      include: {
        user: {
          select: { id: true, address: true, tier: true },
        },
      },
    });

    return NextResponse.json(jsend.success(application), { status: 201 });
  },
  { requireAuth: true, bodySchema: applySchema }
);
