import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  status: z.enum(['WITHDRAWN']).optional(),
});

export const GET = middleware(
  async (req, { params }) => {
    const { orgId, projectId, applicationId } = params;

    // Ensure the authenticated user has permission to view this proposal
    const proposal = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            address: true,
            profile: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            orgId: true,
          },
        },
      },
    });

    if (!proposal || proposal.job.orgId !== orgId || proposal.projectId !== projectId) {
      return NextResponse.json(jsend.fail({ message: 'Proposal not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(jsend.success(proposal));
  },
  {
    requireAuth: true,
    role: {
      roles: [ROLE.SELF, ROLE.RECRUITER],
      resolve: async (_, { params }) => {
        const proposal = await prisma.application.findUnique({
          where: { id: params.applicationId },
        });
        return [proposal.userId, proposal.projectId];
      },
    },
  }
);

export const PATCH = middleware(
  async (req, { params }) => {
    const { orgId, projectId, applicationId } = params;

    // Ensure the authenticated user has permission to update this proposal
    const updatedProposal = await prisma.application.update({
      where: {
        id: applicationId,
        job: {
          id: projectId,
          orgId,
        },
      },
      data: req.dto,
      include: {
        user: {
          select: {
            id: true,
            address: true,
            profile: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            orgId: true,
          },
        },
      },
    });

    return NextResponse.json(jsend.success(updatedProposal));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(jsend.fail({ message: 'Proposal not found' }), {
        status: 404,
      });
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema: updateSchema,
    role: {
      roles: [ROLE.SELF],
      resolve: async (_, { params }) => {
        const proposal = await prisma.application.findUnique({
          where: { id: params.applicationId },
        });
        return [proposal.userId];
      },
    },
  }
);
