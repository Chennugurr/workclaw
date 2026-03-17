import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/fraud
 * List fraud flags.
 */
export const GET = middleware(
  requireAdmin(async (req) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const status = url.searchParams.get('status');
    const severity = url.searchParams.get('severity');
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [flags, total] = await Promise.all([
      prisma.fraudFlag.findMany({
        where,
        include: {
          user: {
            select: {
              id: true, address: true, tier: true,
              profile: { select: { firstName: true, lastName: true, integrityScore: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.fraudFlag.count({ where }),
    ]);

    return NextResponse.json(
      jsend.success({
        data: flags,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  }),
  { requireAuth: true }
);
