import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  name: z.string().min(1),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

export const POST = middleware(
  async (req, { params }) => {
    const { orgId, jobId } = params;

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

    const newJobSkill = await prisma.skillAssociation.create({
      data: {
        jobId,
        level: req.dto.level,
        ownerType: 'JOB',
      },
      include: {
        skill: {
          connectOrCreate: {
            where: { name: req.dto.name },
            create: { name: req.dto.name },
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

    return NextResponse.json(jsend.success(newJobSkill), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2002') {
      return NextResponse.json(
        jsend.fail({
          message: 'This skill is already associated with the job',
        }),
        { status: 409 }
      );
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        jsend.fail({ message: 'Invalid job ID or skill ID' }),
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
