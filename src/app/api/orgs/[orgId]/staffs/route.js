import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  userId: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});

export const POST = middleware(
  async (req, { params }) => {
    const { orgId } = params;
    const { userId, role } = req.dto;

    const newStaff = await prisma.organizationStaff.create({
      data: {
        userId,
        orgId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            address: true,
            profile: true,
          },
        },
        org: true,
      },
    });

    return NextResponse.json(jsend.success(newStaff), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2002') {
      return NextResponse.json(
        jsend.fail({
          message: 'User is already a staff member of this organization',
        }),
        { status: 409 }
      );
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        jsend.fail({ message: 'Invalid organization ID or user ID' }),
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
