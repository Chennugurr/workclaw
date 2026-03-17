import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  budget: z.number().positive().optional(),
  statement: z.string().min(1),
});

export const POST = middleware(
  async (req, { params }) => {
    const { orgId, jobId } = params;
    const { budget, statement } = req.dto;

    // Check if the job belongs to the specified organization
    const job = await prisma.job.findUnique({
      where: { id: jobId, status: 'OPEN' },
    });

    if (!job || job.orgId !== orgId) {
      return NextResponse.json(
        jsend.fail({ message: 'Job not found in this organization' }),
        { status: 404 }
      );
    }

    // Check if the user has already submitted a proposal for this job
    const existingProposal = await prisma.proposal.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId,
        },
      },
    });

    if (existingProposal) {
      return NextResponse.json(
        jsend.fail({
          message: 'You have already submitted a proposal for this job',
        }),
        { status: 409 }
      );
    }

    const newProposal = await prisma.proposal.create({
      data: {
        userId: req.user.id,
        jobId,
        budget: budget ?? job.budget,
        statement,
        status: 'APPLIED', // Assuming the initial status is APPLIED
      },
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

    return NextResponse.json(jsend.success(newProposal), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2003') {
      return NextResponse.json(
        jsend.fail({ message: 'Invalid job ID or user ID' }),
        { status: 400 }
      );
    }
    return defaultErrorHandler();
  },
  { requireAuth: true, bodySchema }
);
