import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../middleware';
import prisma from '@/lib/prisma';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  expiresAt: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/admin/announcements
 * List all announcements.
 */
export const GET = middleware(
  requireAdmin(async (req) => {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(jsend.success(announcements));
  }),
  { requireAuth: true }
);

/**
 * POST /api/admin/announcements
 * Create a new announcement.
 */
export const POST = middleware(
  requireAdmin(async (req) => {
    const { title, body, expiresAt } = req.dto;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        createdBy: req.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'ANNOUNCEMENT_CREATE',
        target: 'Announcement',
        targetId: announcement.id,
        details: { title },
      },
    });

    return NextResponse.json(jsend.success(announcement), { status: 201 });
  }),
  { requireAuth: true, bodySchema: createSchema }
);
