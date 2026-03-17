import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  foundedIn: z.date().optional(),
  type: z
    .enum([
      'STARTUP',
      'SMALL_BUSINESS',
      'CORPORATION',
      'NON_PROFIT',
      'GOVERNMENT',
      'EDUCATIONAL',
      'HEALTHCARE',
      'FINTECH',
      'ECOMMERCE',
      'TECHNOLOGY',
      'CONSULTING',
      'OTHER',
    ])
    .optional(),
  teamSize: z
    .enum([
      'ONE_TO_TEN',
      'ELEVEN_TO_FIFTY',
      'FIFTY_ONE_TO_TWO_HUNDRED',
      'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
      'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND',
      'OVER_ONE_THOUSAND',
    ])
    .optional(),
  bio: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
});

export const GET = middleware(
  async (req, { params }) => {
    const { orgId } = params;

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        socials: {
          select: {
            id: true,
            platform: true,
            handleOrUrl: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        jsend.fail({ message: 'Organization not found' }),
        { status: 404 }
      );
    }

    return NextResponse.json(jsend.success(organization));
  },
  { withAuth: true }
);

export const PATCH = middleware(
  async (req, { params }) => {
    const { orgId } = params;

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: req.dto,
    });

    return NextResponse.json(jsend.success(updatedOrg));
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'Organization not found' }),
        { status: 404 }
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

export const DELETE = middleware(
  async (req, { params }) => {
    const { orgId } = params;

    await prisma.organization.delete({
      where: { id: orgId },
    });

    return NextResponse.json(
      jsend.success({ message: 'Organization deleted successfully' }),
      { status: 200 }
    );
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2025') {
      return NextResponse.json(
        jsend.fail({ message: 'Organization not found' }),
        { status: 404 }
      );
    }
    return defaultErrorHandler();
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.OWNER] },
  }
);
