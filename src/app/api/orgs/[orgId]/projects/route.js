import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const jobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string(),
  budget: z.number().positive(),
  currency: z.enum(['USDC']).default('USDC'),
  duration: z.number().int().positive().optional().or(z.literal(null)),
  status: z.enum(['OPEN', 'CLOSED', 'CANCELED', 'COMPLETED']).default('OPEN'),
  position: z.enum([
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'TEMPORARY',
    'INTERNSHIP',
  ]),
  experience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  location: z.string().max(255),
  skills: z
    .array(
      z.object({
        name: z.string(),
        level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
      })
    )
    .optional(),
});

export const POST = middleware(
  async (req, { params }) => {
    const { orgId } = params;

    const newJob = await prisma.project.create({
      data: {
        ...req.dto,
        orgId,
        skills: {
          create: req.dto.skills?.map((skill) => ({
            skill: {
              connectOrCreate: {
                where: { name: skill.name },
                create: { name: skill.name },
              },
            },
            level: skill.level,
            ownerType: 'PROJECT',
          })),
        },
        recruiters: {
          create: {
            staff: {
              connect: {
                userId_orgId: {
                  userId: req.user.id,
                  orgId: orgId,
                },
              },
            },
          },
        },
      },
      include: {
        org: true,
      },
    });

    return NextResponse.json(jsend.success(newJob), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2003') {
      return NextResponse.json(
        jsend.fail({ message: 'Invalid organization ID or skill ID' }),
        { status: 400 }
      );
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
    bodySchema: jobSchema,
    role: { roles: [ROLE.ORGANIZATION.ADMIN] },
  }
);
