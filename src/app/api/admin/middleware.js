import jsend from 'jsend';
import { NextResponse } from 'next/server';

/**
 * Wraps an admin handler to verify the user has ADMIN role.
 * Must be used after the main middleware (which sets req.user).
 */
export function requireAdmin(handler) {
  return async (req, ...args) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json(
        jsend.fail({ message: 'Admin access required' }),
        { status: 403 }
      );
    }
    return handler(req, ...args);
  };
}
