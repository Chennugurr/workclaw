import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/payouts
 * List all payouts across all users.
 */
export const GET = middleware(
  requireAdmin(async (req) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const status = url.searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        include: {
          user: {
            select: {
              id: true, address: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          method: { select: { type: true, details: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payout.count({ where }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: payouts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  }),
  { requireAuth: true }
);
