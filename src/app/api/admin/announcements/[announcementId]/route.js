import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import { requireAdmin } from '../../middleware';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

/**
 * PATCH /api/admin/announcements/:announcementId
 */
export const PATCH = middleware(
  requireAdmin(async (req, { params }) => {
    const { announcementId } = await params;
    const data = { ...req.dto };
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data,
    });

    return NextResponse.json(jsend.success(announcement));
  }),
  { requireAuth: true, bodySchema: updateSchema }
);

/**
 * DELETE /api/admin/announcements/:announcementId
 */
export const DELETE = middleware(
  requireAdmin(async (req, { params }) => {
    const { announcementId } = await params;
    await prisma.announcement.delete({ where: { id: announcementId } });
    return NextResponse.json(jsend.success({ message: 'Deleted' }));
  }),
  { requireAuth: true }
);
