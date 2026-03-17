import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
});

export const PATCH = middleware(
  async (req, { params }) => {
    const { orgId, projectId, applicationId } = await params;
    const { status } = req.dto;

    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        jsend.fail({ message: 'Project not found' }),
        { status: 404 }
      );
    }

    const application = await prisma.application.update({
      where: { id: applicationId, projectId },
      data: { status },
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
    });

    return NextResponse.json(jsend.success(application));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(jsend.fail({ message: 'Application not found' }), {
        status: 404,
      });
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema: updateSchema,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);
