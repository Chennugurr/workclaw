import { NextResponse } from 'next/server';
import jsend from 'jsend';
import prisma from '@/lib/prisma';

/**
 * GET /api/stats
 * Public endpoint returning platform stats for the landing page.
 */
export const GET = async () => {
  const userCount = await prisma.user.count();
  return NextResponse.json(jsend.success({ userCount }));
};
