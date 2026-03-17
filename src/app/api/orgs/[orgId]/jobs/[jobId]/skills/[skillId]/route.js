import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const patchBodySchema = z.object({
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

export const PATCH = middleware(
  async (req, { params }) => {
    const { orgId, jobId, skillId } = params;
    const { level } = req.dto;

    const job = await prisma.job.findUnique({
      where: { id: jobId, orgId },
    });

    if (!job) {
      return NextResponse.json(
        jsend.fail({ message: 'Job not found in this organization' }),
        { status: 404 }
      );
    }

    const updatedJobSkill = await prisma.skillAssociation.update({
      where: {
        jobId_skillId: {
          jobId,
          skillId,
        },
      },
      data: {
        level,
      },
      include: {
        skill: true,
        job: {
          select: {
            id: true,
            title: true,
            orgId: true,
          },
        },
      },
    });

    return NextResponse.json(jsend.success(updatedJobSkill));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'Skill not found for this job' }),
        { status: 404 }
      );
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema: patchBodySchema,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);

export const DELETE = middleware(
  async (req, { params }) => {
    const { orgId, jobId, skillId } = params;

    const job = await prisma.job.findUnique({
      where: { id: jobId, orgId },
    });

    if (!job) {
      return NextResponse.json(
        jsend.fail({ message: 'Job not found in this organization' }),
        { status: 404 }
      );
    }

    await prisma.skillAssociation.delete({
      where: {
        jobId_skillId: {
          jobId,
          skillId,
        },
      },
    });

    return NextResponse.json(
      jsend.success({ message: 'Skill removed from job successfully' })
    );
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'Skill not found for this job' }),
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
