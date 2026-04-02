import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebhookSignature, mapSumsubStatus } from '@/lib/sumsub';

/**
 * POST /api/kyc/webhook
 * Receive Sumsub verification status webhooks.
 * https://developers.sumsub.com/api-reference/#webhook-types
 */
export const POST = async (req) => {
  const rawBody = await req.text();
  const signature = req.headers.get('x-payload-digest');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const { externalUserId, reviewResult, reviewStatus, type } = payload;

  // Only handle applicant review events
  if (type !== 'applicantReviewed' && type !== 'applicantPending') {
    return NextResponse.json({ ok: true });
  }

  const kycStatus = mapSumsubStatus(reviewResult, reviewStatus);
  if (!kycStatus) return NextResponse.json({ ok: true });

  const user = await prisma.user.findUnique({
    where: { id: externalUserId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: externalUserId },
    data: { kycStatus },
  });

  await prisma.auditLog.create({
    data: {
      actorId: 'sumsub',
      action: 'KYC_STATUS_UPDATE',
      target: 'User',
      targetId: externalUserId,
      details: { kycStatus, reviewStatus, reviewResult },
    },
  });

  return NextResponse.json({ ok: true });
};
