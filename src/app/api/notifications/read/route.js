import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

const readSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

/**
 * POST /api/notifications/read
 * Mark notifications as read.
 */
export const POST = middleware(
  async (req) => {
    const { notificationIds, all } = req.dto;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, read: false },
        data: { read: true, readAt: new Date() },
      });
    } else if (notificationIds?.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: req.user.id,
        },
        data: { read: true, readAt: new Date() },
      });
    }

    return NextResponse.json(jsend.success({ message: 'Marked as read' }));
  },
  { requireAuth: true, bodySchema: readSchema }
);
