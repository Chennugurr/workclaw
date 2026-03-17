import jsend from 'jsend';
import jwt from 'jsonwebtoken';
import { getClientIp } from 'request-ip';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';
import { hashToken } from '@/lib/hash-token';
import { getLocationFromIP } from '@/lib/geolocation';
import { getDeviceInfo } from '@/lib/device-info';

export const POST = middleware(async (req) => {
  const { token } = await req.json();

  // Hash the incoming refresh token
  const hashedRefreshToken = hashToken(token);

  // Find the session in the database
  const session = await prisma.session.findUnique({
    where: { refreshToken: hashedRefreshToken },
  });

  // Check if the session exists
  if (!session) {
    return NextResponse.json(jsend.error('Invalid refresh token'), {
      status: 401,
    });
  }

  // Check if the session is active
  if (session.status !== 'ACTIVE') {
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'EXPIRED' },
    });
    return NextResponse.json(jsend.error('Expired session'), { status: 401 });
  }

  // Check if the refresh token has expired
  if (new Date(session.expiresAt) < new Date()) {
    return NextResponse.json(jsend.error('Refresh token has expired'), {
      status: 401,
    });
  }

  // Generate a new access token and refresh token
  const newAccessToken = jwt.sign(
    { uid: session.userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const newRefreshToken = jwt.sign(
    { uid: session.userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Hash the new tokens before saving
  const hashedNewAccessToken = hashToken(newAccessToken);
  const hashedNewRefreshToken = hashToken(newRefreshToken);
  const ipAddress = getClientIp(req) || req.ip;
  const userAgent = req.headers.get('user-agent');
  const location = await getLocationFromIP(ipAddress);

  // Update the existing session with new tokens and expiration
  await prisma.session.update({
    where: { id: session.id },
    data: {
      accessToken: hashedNewAccessToken,
      refreshToken: hashedNewRefreshToken,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress,
      userAgent,
      location: location?.country,
      deviceInfo: JSON.stringify({
        ...getDeviceInfo(req),
        location,
      }),
    },
  });

  return NextResponse.json(
    jsend.success({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  );
});
