import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  foundedIn: z.date().optional(),
  type: z.enum([
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
  ]),
  teamSize: z.enum([
    'ONE_TO_TEN',
    'ELEVEN_TO_FIFTY',
    'FIFTY_ONE_TO_TWO_HUNDRED',
    'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
    'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND',
    'OVER_ONE_THOUSAND',
  ]),
  bio: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
});

export const POST = middleware(
  async (req) => {
    const org = await prisma.organization.create({
      data: {
        ...req.dto,
        staffs: {
          create: [
            {
              userId: req.user.id,
              role: 'OWNER',
            },
          ],
        },
      },
    });

    return NextResponse.json(jsend.success(org), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        jsend.fail({ message: 'Organization with this email already exists' }),
        { status: 409 }
      );
    }
    return defaultErrorHandler();
  },
  { requireAuth: true, bodySchema }
);
