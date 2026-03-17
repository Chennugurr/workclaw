import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const DELETE = middleware(
  async (req, { params }) => {
    const { orgId, jobId, recruiterId } = params;

    // Check if the job belongs to the specified organization
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { orgId: true },
    });

    if (!job || job.orgId !== orgId) {
      return NextResponse.json(
        jsend.fail({ message: 'Job not found in this organization' }),
        { status: 404 }
      );
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { id: recruiterId },
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

    await prisma.recruiter.delete({
      where: { id: recruiterId },
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
