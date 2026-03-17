import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  description: z.string().optional(),
  icon: z.string().optional(),
  verified: z.boolean().optional(),
});

export const GET = middleware(
  async (req, { params }) => {
    const { skillId } = params;

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return NextResponse.json(jsend.fail({ message: 'Skill not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(jsend.success(skill));
  },
  { withAuth: true }
);

export const PATCH = middleware(
  async (req, { params }) => {
    const { skillId } = params;

    const updatedSkill = await prisma.skill.update({
      where: { id: skillId },
      data: req.dto,
    });

    return NextResponse.json(jsend.success(updatedSkill));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(jsend.fail({ message: 'Skill not found' }), {
        status: 404,
      });
    }
    return defaultErrorHandler();
  },
  { requireAuth: true, bodySchema }
);

export const DELETE = middleware(
  async (req, { params }) => {
    const { skillId } = params;

    await prisma.skill.delete({
      where: { id: skillId },
    });

    return NextResponse.json(
      jsend.success({ message: 'Skill deleted successfully' })
    );
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(jsend.fail({ message: 'Skill not found' }), {
        status: 404,
      });
    }
    return defaultErrorHandler();
  },
  { requireAuth: true }
);
