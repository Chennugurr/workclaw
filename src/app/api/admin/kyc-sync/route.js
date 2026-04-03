import { NextResponse } from 'next/server';
import jsend from 'jsend';
import prisma from '@/lib/prisma';
import { getApplicantByExternalId, mapSumsubStatus } from '@/lib/sumsub';

function authCheck(req) {
  const secret = req.headers.get('x-admin-secret');
  return secret && secret === process.env.JWT_SECRET;
}

/**
 * POST /api/admin/kyc-sync
 * Pull KYC status from Sumsub for all users and update DB.
 */
export const POST = async (req) => {
  if (!authCheck(req)) {
    return NextResponse.json(jsend.error('Unauthorized'), { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, kycStatus: true },
  });

  const results = { verified: 0, pending: 0, rejected: 0, notFound: 0, failed: 0, unchanged: 0 };
  const errors = [];

  for (const user of users) {
    try {
      const applicant = await getApplicantByExternalId(user.id);
      const review = applicant?.review;
      const kycStatus = mapSumsubStatus(review?.reviewResult, review?.reviewStatus);

      if (!kycStatus) {
        results.notFound++;
        continue;
      }

      if (kycStatus === user.kycStatus) {
        results.unchanged++;
        continue;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { kycStatus },
      });

      if (kycStatus === 'VERIFIED') results.verified++;
      else if (kycStatus === 'PENDING') results.pending++;
      else if (kycStatus === 'REJECTED') results.rejected++;
    } catch (e) {
      // 404 means user never started KYC on Sumsub — not a real error
      if (e.message?.includes('404')) {
        results.notFound++;
      } else {
        results.failed++;
        if (errors.length < 3) errors.push({ userId: user.id, error: e.message });
      }
    }
  }

  return NextResponse.json(jsend.success({ total: users.length, ...results, sampleErrors: errors }));
};
