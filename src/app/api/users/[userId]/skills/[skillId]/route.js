import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

export const PATCH = middleware(
  async (req, { params }) => {
    const { userId, skillId } = params;

    const updatedUserSkill = await prisma.skillAssociation.update({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
      data: req.dto,
      include: {
        skill: true,
      },
    });

    return NextResponse.json(jsend.success(updatedUserSkill));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'User skill not found' }),
        { status: 404 }
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

export const DELETE = middleware(
  async (req, { params }) => {
    const { userId, skillId } = params;

    await prisma.skillAssociation.delete({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });

    return NextResponse.json(
      jsend.success({ message: 'User skill removed successfully' })
    );
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'User skill not found' }),
        { status: 404 }
      );
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.SELF] },
  }
);
