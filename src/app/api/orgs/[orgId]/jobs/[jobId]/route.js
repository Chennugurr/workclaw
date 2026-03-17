import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { JobStatus } from '@prisma/client';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const jobUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  duration: z.number().int().positive().optional().or(z.literal(null)),
  position: z
    .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP'])
    .optional(),
  experience: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .optional(),
  location: z.string().max(255).optional(),
  skills: z
    .array(
      z.object({
        name: z.string(),
        level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
      })
    )
    .optional(),
});

export const PATCH = middleware(
  async (req, { params }) => {
    const { orgId, jobId } = params;
    const updateData = req.dto;

    // First, update the job without skills
    let job = await prisma.job.update({
      where: { id: jobId, orgId, status: JobStatus.OPEN },
      data: {
        ...updateData,
        skills: undefined,
      },
      include: {
        org: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    // If skills are provided in the update, handle them separately
    if (updateData.skills) {
      // Get the current skill association IDs
      const currentSkillAssociationIds = job.skills.map((skill) => skill.id);

      // Identify skill association IDs to remove (present in current but not in update)
      const skillAssociationIdsToRemove = currentSkillAssociationIds.filter(
        (id) => !updateData.skills.some((skill) => skill.id === id)
      );

      // Remove skill associations that are no longer present
      await prisma.skillAssociation.deleteMany({
        where: {
          id: {
            in: skillAssociationIdsToRemove,
          },
        },
      });

      // Update or create skills
      const skills = await prisma.skill.findMany({
        where: {
          name: {
            in: updateData.skills.map((skill) => skill.name),
          },
        },
      });
      for (const skill of skills) {
        const association = updateData.skills.find(
          (s) => s.name === skill.name
        );
        await prisma.skillAssociation.upsert({
          where: {
            jobId_skillId: {
              jobId,
              skillId: skill.id,
            },
          },
          update: {
            level: association.level,
          },
          create: {
            level: association.level,
            ownerType: 'JOB',
            job: {
              connect: {
                id: jobId,
              },
            },
            skill: {
              connectOrCreate: {
                where: { name: skill.name },
                create: { name: skill.name },
              },
            },
          },
        });
      }

      // Fetch the updated job with new skills
      const updatedJobWithSkills = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          org: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      job = updatedJobWithSkills;
    }

    return NextResponse.json(jsend.success(job));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(jsend.fail({ message: 'Job not found' }), {
        status: 404,
      });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        jsend.fail({ message: 'Invalid input data', errors: error.errors }),
        { status: 400 }
      );
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema: jobUpdateSchema,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);

export const DELETE = middleware(
  async (req, { params }) => {
    const { orgId, jobId } = params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.orgId !== orgId) {
      return NextResponse.json(
        jsend.fail({ message: 'Job not found in this organization' }),
        { status: 404 }
      );
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    return NextResponse.json(
      jsend.success({ message: 'Job deleted successfully' }),
      { status: 200 }
    );
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(jsend.fail({ message: 'Job not found' }), {
        status: 404,
      });
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);
