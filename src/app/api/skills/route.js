import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const POST = middleware(
  async (req) => {
    const skill = await prisma.skill.create({
      data: req.dto,
    });

    return NextResponse.json(jsend.success(skill), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return NextResponse.json(
        jsend.fail({ message: 'Skill with this name already exists' }),
        { status: 409 }
      );
    }
    return defaultErrorHandler();
  },
  { requireAuth: true, bodySchema }
);
