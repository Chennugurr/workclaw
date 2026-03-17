import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { JobStatus, ProposalStatus } from '@prisma/client';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  status: z.enum(['APPLIED', 'WITHDRAWN', 'SHORTLISTED', 'ARCHIVED', 'HIRED']),
});

export const PATCH = middleware(
  async (req, { params }) => {
    const { orgId, projectId, applicationId } = params;
    const { status } = req.dto;

    // Check if the job belongs to the specified organization
    const job = await prisma.project.findUnique({
      where: { id: projectId },
      select: { orgId: true },
    });

    if (!job || job.orgId !== orgId) {
      return NextResponse.json(
        jsend.fail({ message: 'Job not found in this organization' }),
        { status: 404 }
      );
    }

    const updatedProposal = await prisma.application.update({
      where: {
        id: applicationId,
        job: {
          id: projectId,
          orgId,
        },
        status: {
          not: {
            in: ['WITHDRAWN', 'HIRED'],
          },
        },
      },
      data: { status },
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

    // Update job status if a proposal is HIRED
    if (status === ProposalStatus.HIRED) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: JobStatus.CLOSED },
      });
    }

    // If the job was previously closed and the new status is not HIRED,
    // check if there are any other HIRED proposals
    if (status !== ProposalStatus.HIRED) {
      const hiredProposalsCount = await prisma.application.count({
        where: {
          projectId,
          status: ProposalStatus.HIRED,
        },
      });

      // If there are no HIRED proposals, reopen the job
      if (hiredProposalsCount === 0) {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: JobStatus.OPEN },
        });
      }
    }

    // TODO: Implement notification logic for the user

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
      roles: [ROLE.RECRUITER],
      resolve: (_, { params }) => [params.projectId],
    },
  }
);
