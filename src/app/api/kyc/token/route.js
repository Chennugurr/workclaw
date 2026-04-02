import { NextResponse } from 'next/server';
import jsend from 'jsend';
import { middleware } from '@/api/middleware';
import { generateSdkToken } from '@/lib/sumsub';

/**
 * POST /api/kyc/token
 * Generate a Sumsub WebSDK access token for the authenticated user.
 */
export const POST = middleware(
  async (req) => {
    const token = await generateSdkToken(req.user.id);
    return NextResponse.json(jsend.success({ token: token.token }));
  },
  { requireAuth: true }
);
