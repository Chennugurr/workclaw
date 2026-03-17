import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const patchBodySchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});

export const PATCH = middleware(
  async (req, { params }) => {
    const { orgId, userId } = params;
    const { role } = req.dto;

    // Check if the current user is an OWNER
    const currentUserStaff = await prisma.organizationStaff.findUnique({
      where: {
        userId_orgId: {
          userId: req.user.id,
          orgId,
        },
      },
    });

    if (currentUserStaff.role !== 'OWNER' && role === 'OWNER') {
      return NextResponse.json(
        jsend.fail({
          message: 'You are not authorized to promote this staff member',
        }),
        { status: 403 }
      );
    }

    const updatedStaff = await prisma.organizationStaff.update({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
      data: {
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

    return NextResponse.json(jsend.success(updatedStaff));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'Staff member not found in this organization' }),
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
    const { orgId, userId } = params;

    // Check if the staff member to be deleted is an OWNER
    const staffMember = await prisma.organizationStaff.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
    });

    if (!staffMember) {
      return NextResponse.json(
        jsend.fail({ message: 'Staff member not found in this organization' }),
        { status: 404 }
      );
    }

    // Check if the current user is an OWNER
    const currentUserStaff = await prisma.organizationStaff.findUnique({
      where: {
        userId_orgId: {
          userId: req.user.id,
          orgId,
        },
      },
    });

    if (currentUserStaff.role !== 'OWNER' && staffMember.role === 'OWNER') {
      return NextResponse.json(
        jsend.fail({
          message: 'You are not authorized to delete this staff member',
        }),
        { status: 403 }
      );
    }

    if (staffMember.role === 'OWNER') {
      // Count the number of OWNER roles in the organization
      const ownerCount = await prisma.organizationStaff.count({
        where: {
          orgId,
          role: 'OWNER',
        },
      });

      if (ownerCount === 1) {
        return NextResponse.json(
          jsend.fail({
            message: 'Cannot remove the last OWNER of the organization',
          }),
          { status: 403 }
        );
      }
    }

    await prisma.organizationStaff.delete({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
    });

    return NextResponse.json(
      jsend.success({ message: 'Staff member removed successfully' }),
      { status: 200 }
    );
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'Staff member not found in this organization' }),
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
