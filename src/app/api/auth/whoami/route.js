import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';

export const GET = middleware(
  async (req) => NextResponse.json(jsend.success(req.user)),
  { requireAuth: true }
);
