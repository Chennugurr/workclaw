import jsend from 'jsend';
import jwt from 'jsonwebtoken';
import { SiwsMessage } from 'siws';
import { NextResponse } from 'next/server';
import { middleware } from '@/api/middleware';
import prisma from '@/lib/prisma';
import { hashToken } from '@/lib/hash-token';
import { getLocationFromIP } from '@/lib/geolocation';
import { getDeviceInfo } from '@/lib/device-info';
import { headers } from 'next/headers';

function getClientIpFromHeaders(headerList) {
  return (
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    headerList.get('cf-connecting-ip') ||
    'unknown'
  );
}

export const POST = middleware(async (req) => {
  const headerList = await headers();
  const token = headerList.get('x-siws-token');

  if (!token) {
    return NextResponse.json(jsend.error('Missing SIWS token'), {
      status: 400,
    });
  }

  let fields;
  try {
    fields = new SiwsMessage({}).decode(token);
  } catch (err) {
    console.error('SIWS decode error:', err);
    return NextResponse.json(jsend.error('Invalid SIWS token format'), {
      status: 400,
    });
  }

  if (!fields.validate()) {
    return NextResponse.json(jsend.error('Invalid signature'), {
      status: 400,
    });
  }

  // Check if the message is not too old (e.g., 5 minutes)
  const message = fields.message;
  const issuedAtMatch = message?.match(/Issued At: (.*)/);
  if (issuedAtMatch) {
    const issuedAt = new Date(issuedAtMatch[1]);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (issuedAt < fiveMinutesAgo) {
      return NextResponse.json(jsend.error('Message is too old'), {
        status: 400,
      });
    }
  }

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { address: fields.address },
    include: { profile: true },
  });

  // If the user doesn't exist, create them
  if (!user) {
    user = await prisma.user.create({
      data: {
        address: fields.address,
      },
      include: { profile: true },
    });
  }

  // Generate JWT tokens (Access Token and Refresh Token)
  const accessToken = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { uid: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Hash the tokens before saving
  const hashedAccessToken = hashToken(accessToken);
  const hashedRefreshToken = hashToken(refreshToken);
  const ipAddress = getClientIpFromHeaders(headerList);
  const userAgent = req.headers.get('user-agent');
  const location = await getLocationFromIP(ipAddress);

  // Create a new session
  await prisma.session.create({
    data: {
      userId: user.id,
      accessToken: hashedAccessToken,
      refreshToken: hashedRefreshToken,
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
      accessToken,
      refreshToken,
    })
  );
});
