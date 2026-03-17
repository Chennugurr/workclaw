import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/users
 * List all users with filtering.
 */
export const GET = middleware(
  requireAdmin(async (req) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const role = url.searchParams.get('role');
    const tier = url.searchParams.get('tier');
    const search = url.searchParams.get('search');
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (tier) where.tier = tier;
    if (search) {
      where.OR = [
        { address: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        { profile: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              firstName: true, lastName: true, email: true, pfp: true,
              trustScore: true, reviewerScore: true, integrityScore: true,
            },
          },
          _count: { select: { taskSubmissions: true, applications: true, fraudFlags: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  }),
  { requireAuth: true }
);
