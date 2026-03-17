import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  staffId: z.string().min(1),
});

export const POST = middleware(
  async (req, { params }) => {
    const { orgId, jobId } = params;
    const { staffId } = req.dto;

    // Check if the job belongs to the specified organization
    const job = await prisma.job.findUnique({
      where: { id: jobId, orgId },
    });

    if (!job) {
      return NextResponse.json(
        jsend.fail({ message: 'Job not found in this organization' }),
        { status: 404 }
      );
    }

    // Check if the staff member belongs to the organization
    const staff = await prisma.organizationStaff.findUnique({
      where: {
        userId_orgId: {
          userId: staffId,
          orgId,
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        jsend.fail({ message: 'Staff member not found in this organization' }),
        { status: 404 }
      );
    }

    const newRecruiter = await prisma.recruiter.create({
      data: {
        staffId: staff.id,
        jobId,
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                address: true,
                profile: true,
              },
            },
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

    return NextResponse.json(jsend.success(newRecruiter), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2002') {
      return NextResponse.json(
        jsend.fail({
          message: 'This staff member is already a recruiter for this job',
        }),
        { status: 409 }
      );
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        jsend.fail({ message: 'Invalid job ID or staff ID' }),
        { status: 400 }
      );
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);
