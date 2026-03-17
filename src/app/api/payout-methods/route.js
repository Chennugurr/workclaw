import { z } from 'zod';
import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';

const methodSchema = z.object({
  type: z.enum(['SOLANA_WALLET', 'ETHEREUM_WALLET', 'FIAT_PLACEHOLDER', 'PAYPAL_PLACEHOLDER']),
  details: z.object({
    address: z.string().optional(),
    email: z.string().email().optional(),
    label: z.string().optional(),
  }),
  isPrimary: z.boolean().default(false),
});

/**
 * GET /api/payout-methods
 * List user's payout methods.
 */
export const GET = middleware(
  async (req) => {
    const methods = await prisma.payoutMethod.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(jsend.success(methods));
  },
  { requireAuth: true }
);

/**
 * POST /api/payout-methods
 * Add a new payout method.
 */
export const POST = middleware(
  async (req) => {
    const { type, details, isPrimary } = req.dto;

    // If setting as primary, unset others
    if (isPrimary) {
      await prisma.payoutMethod.updateMany({
        where: { userId: req.user.id },
        data: { isPrimary: false },
      });
    }

    const method = await prisma.payoutMethod.create({
      data: {
        userId: req.user.id,
        type,
        details,
        isPrimary,
      },
    });

    return NextResponse.json(jsend.success(method), { status: 201 });
  },
  {
    requireAuth: true,
    bodySchema: methodSchema,
  }
);
