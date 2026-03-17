import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

export const GET = middleware(
  async (req, { params }) => {
    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(jsend.fail({ message: 'User not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(jsend.success(user));
  },
  { withAuth: true }
);
