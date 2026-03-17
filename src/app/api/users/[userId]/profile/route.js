import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

const bodySchema = z.object({
  firstName: z.string().max(50),
  middleName: z.string().max(50).optional(),
  lastName: z.string().max(50),
  title: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHERS', 'UNDEFINED']).optional(),
  maritalStatus: z
    .enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])
    .optional(),
  education: z
    .enum([
      'HIGH_SCHOOL',
      'ASSOCIATE_DEGREE',
      'BACHELOR_DEGREE',
      'MASTER_DEGREE',
      'DOCTORATE',
      'PROFESSIONAL_CERTIFICATION',
      'VOCATIONAL_TRAINING',
      'OTHER',
    ])
    .optional(),
  experience: z
    .enum([
      'INTERNSHIP',
      'ENTRY_LEVEL',
      'MID_LEVEL',
      'SENIOR_LEVEL',
      'MANAGEMENT',
      'DIRECTOR',
      'EXECUTIVE',
      'CONSULTANT',
      'FREELANCE',
    ])
    .optional(),
  availability: z.enum(['AVAILABLE', 'UNAVAILABLE']).default('AVAILABLE'),
  bio: z.string().optional(),
  pfp: z.string().optional(),
});

export const POST = middleware(
  async (req) => {
    const newProfile = await prisma.profile.create({
      data: {
        ...req.dto,
        userId: req.user.id,
      },
    });

    // Create a new organization for the user
    await prisma.organization.create({
      data: {
        name: `${req.dto.firstName}'s Organization`,
        type: 'OTHER', // Default organization type
        teamSize: 'ONE_TO_TEN', // Default team size
        staffs: {
          create: {
            userId: req.user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return NextResponse.json(jsend.success(newProfile), { status: 201 });
  },
  (error, defaultErrorHandler) => {
    if (error.code === 'P2002' && error.meta.target.includes('userId')) {
      return NextResponse.json(
        jsend.fail({ message: 'Profile already exists' }),
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

export const GET = middleware(
  async (req, { params }) => {
    const { userId } = params;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!profile) {
      return NextResponse.json(jsend.fail({ message: 'Profile not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(jsend.success(profile));
  },
  { withAuth: true }
);

export const PATCH = middleware(
  async (req) => {
    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: req.dto,
    });

    return NextResponse.json(jsend.success(updatedProfile));
  },
  {
    requireAuth: true,
    bodySchema,
    role: { roles: [ROLE.SELF] },
  }
);
