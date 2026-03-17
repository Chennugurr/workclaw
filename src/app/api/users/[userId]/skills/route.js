import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  skillId: z.string(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

export const POST = middleware(
  async (req, { params }) => {
    const { userId } = params;

    const newUserSkill = await prisma.skillAssociation.create({
      data: {
        ...req.dto,
        userId,
        ownerType: 'USER',
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json(jsend.success(newUserSkill), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2002') {
      return NextResponse.json(
        jsend.fail({ message: 'User already has this skill' }),
        { status: 409 }
      );
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    bodySchema,
    role: { roles: [ROLE.SELF] },
  }
);
