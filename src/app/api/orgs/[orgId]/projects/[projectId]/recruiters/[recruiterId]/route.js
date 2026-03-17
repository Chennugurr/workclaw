import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const DELETE = middleware(
  async (req, { params }) => {
    const { orgId, projectId, reviewerAssignmentId } = params;

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

    const recruiter = await prisma.reviewerAssignment.findUnique({
      where: { id: reviewerAssignmentId },
      include: {
        job: {
          select: { orgId: true },
        },
      },
    });

    if (!recruiter || recruiter.job.orgId !== orgId) {
      return NextResponse.json(
        jsend.fail({
          message: 'Recruiter not found for this job in this organization',
        }),
        { status: 404 }
      );
    }

    await prisma.reviewerAssignment.delete({
      where: { id: reviewerAssignmentId },
    });

    return NextResponse.json(
      jsend.success({ message: 'Recruiter removed from job successfully' }),
      { status: 200 }
    );
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'Recruiter not found for this job' }),
        { status: 404 }
      );
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);
