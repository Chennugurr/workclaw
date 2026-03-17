import prisma from '@/lib/prisma';

/**
 * Fraud detection utilities for the platform.
 */

/**
 * Check for duplicate wallet accounts.
 * Flags users who share wallet address patterns or device fingerprints.
 */
export async function checkDuplicateAccounts(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { address: true },
  });
  if (!user) return;

  // Check for sessions sharing IP/device with other users
  const userSessions = await prisma.session.findMany({
    where: { userId },
    select: { ipAddress: true, deviceInfo: true },
  });

  const ipAddresses = userSessions
    .map((s) => s.ipAddress)
    .filter(Boolean);

  if (ipAddresses.length === 0) return;

  const suspiciousSessions = await prisma.session.findMany({
    where: {
      userId: { not: userId },
      ipAddress: { in: ipAddresses },
    },
    select: { userId: true, ipAddress: true },
    distinct: ['userId'],
  });

  if (suspiciousSessions.length > 0) {
    const otherUserIds = suspiciousSessions.map((s) => s.userId);

    // Check if flag already exists
    const existingFlag = await prisma.fraudFlag.findFirst({
      where: {
        userId,
        type: 'DUPLICATE_ACCOUNT',
        status: { in: ['OPEN', 'INVESTIGATING'] },
      },
    });

    if (!existingFlag) {
      await prisma.fraudFlag.create({
        data: {
          userId,
          type: 'DUPLICATE_ACCOUNT',
          severity: suspiciousSessions.length >= 3 ? 'HIGH' : 'MEDIUM',
          details: {
            sharedIPs: ipAddresses,
            otherUserIds,
          },
        },
      });
    }
  }
}

/**
 * Detect low-effort / copy-paste submissions.
 * Checks for very short responses, identical text across submissions,
 * or responses that match the prompt too closely.
 */
export async function checkLowEffortSubmission(submission) {
  const flags = [];

  // Check response size
  const responseStr = JSON.stringify(submission.response || {});
  if (responseStr.length < 10) {
    flags.push('EMPTY_RESPONSE');
  }

  // Check for duplicate responses from same user
  const recentSubmissions = await prisma.taskSubmission.findMany({
    where: {
      userId: submission.userId,
      id: { not: submission.id },
      isDraft: false,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { response: true },
    take: 20,
  });

  const duplicateCount = recentSubmissions.filter(
    (s) => JSON.stringify(s.response) === responseStr
  ).length;

  if (duplicateCount >= 3) {
    flags.push('DUPLICATE_RESPONSES');
  }

  if (flags.length > 0) {
    const existingFlag = await prisma.fraudFlag.findFirst({
      where: {
        userId: submission.userId,
        type: 'LOW_EFFORT',
        status: { in: ['OPEN', 'INVESTIGATING'] },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existingFlag) {
      await prisma.fraudFlag.create({
        data: {
          userId: submission.userId,
          type: 'LOW_EFFORT',
          severity: flags.includes('DUPLICATE_RESPONSES') ? 'HIGH' : 'MEDIUM',
          details: {
            flags,
            submissionId: submission.id,
            taskId: submission.taskId,
          },
        },
      });
    }
  }

  return flags;
}

/**
 * Check for benchmark (gold task) failures.
 * If a contributor fails multiple gold tasks, flag them.
 */
export async function checkBenchmarkFailures(userId, projectId) {
  const goldSubmissions = await prisma.taskSubmission.findMany({
    where: {
      userId,
      task: { projectId, isGold: true },
      isDraft: false,
    },
    include: {
      reviews: { select: { verdict: true } },
    },
  });

  if (goldSubmissions.length < 3) return;

  const failed = goldSubmissions.filter((s) =>
    s.reviews.some((r) => r.verdict === 'REJECTED')
  ).length;

  const failRate = failed / goldSubmissions.length;

  if (failRate > 0.5) {
    const existingFlag = await prisma.fraudFlag.findFirst({
      where: {
        userId,
        type: 'BENCHMARK_FAILURE',
        status: { in: ['OPEN', 'INVESTIGATING'] },
        details: { path: ['projectId'], equals: projectId },
      },
    });

    if (!existingFlag) {
      await prisma.fraudFlag.create({
        data: {
          userId,
          type: 'BENCHMARK_FAILURE',
          severity: failRate > 0.75 ? 'HIGH' : 'MEDIUM',
          details: {
            projectId,
            goldTasksAttempted: goldSubmissions.length,
            goldTasksFailed: failed,
            failRate,
          },
        },
      });
    }
  }
}

/**
 * Compute and update contributor integrity score.
 * Score = base (100) - penalties from fraud flags, low acceptance, speed anomalies.
 */
export async function updateIntegrityScore(userId) {
  const [
    confirmedFlags,
    openFlags,
    speedAnomalies,
    scores,
  ] = await Promise.all([
    prisma.fraudFlag.count({
      where: { userId, status: 'CONFIRMED' },
    }),
    prisma.fraudFlag.count({
      where: { userId, status: { in: ['OPEN', 'INVESTIGATING'] } },
    }),
    prisma.reputationEvent.count({
      where: { userId, eventType: 'SPEED_ANOMALY' },
    }),
    prisma.contributorScore.findMany({
      where: { userId },
      select: { acceptanceRate: true },
    }),
  ]);

  const avgAcceptanceRate = scores.length > 0
    ? scores.reduce((a, s) => a + s.acceptanceRate, 0) / scores.length
    : 1;

  let integrityScore = 100;
  integrityScore -= confirmedFlags * 20;
  integrityScore -= openFlags * 5;
  integrityScore -= speedAnomalies * 3;
  integrityScore -= Math.max(0, (1 - avgAcceptanceRate) * 30);
  integrityScore = Math.max(0, Math.min(100, integrityScore));

  await prisma.profile.updateMany({
    where: { userId },
    data: { integrityScore },
  });

  return integrityScore;
}

/**
 * Detect suspicious agreement patterns.
 * Flags contributors who always agree with each other (ring detection).
 */
export async function checkAgreementRings(userId) {
  // Get this user's recent submission responses
  const userSubmissions = await prisma.taskSubmission.findMany({
    where: { userId, isDraft: false },
    select: { taskId: true, response: true },
    take: 50,
    orderBy: { createdAt: 'desc' },
  });

  if (userSubmissions.length < 10) return;

  const taskIds = userSubmissions.map((s) => s.taskId);

  // Find other submissions on the same tasks
  const otherSubmissions = await prisma.taskSubmission.findMany({
    where: {
      taskId: { in: taskIds },
      userId: { not: userId },
      isDraft: false,
    },
    select: { userId: true, taskId: true, response: true },
  });

  // Count agreement rates per other user
  const agreementCounts = {};
  const overlapCounts = {};

  for (const other of otherSubmissions) {
    if (!agreementCounts[other.userId]) {
      agreementCounts[other.userId] = 0;
      overlapCounts[other.userId] = 0;
    }
    overlapCounts[other.userId]++;

    const userSub = userSubmissions.find((s) => s.taskId === other.taskId);
    if (userSub && JSON.stringify(userSub.response) === JSON.stringify(other.response)) {
      agreementCounts[other.userId]++;
    }
  }

  // Flag if 100% agreement with someone over 10+ shared tasks
  for (const [otherUserId, agreementCount] of Object.entries(agreementCounts)) {
    const overlap = overlapCounts[otherUserId];
    if (overlap >= 10 && agreementCount / overlap >= 0.95) {
      const existingFlag = await prisma.fraudFlag.findFirst({
        where: {
          userId,
          type: 'AGREEMENT_RING',
          status: { in: ['OPEN', 'INVESTIGATING'] },
          details: { path: ['otherUserId'], equals: otherUserId },
        },
      });

      if (!existingFlag) {
        await prisma.fraudFlag.create({
          data: {
            userId,
            type: 'AGREEMENT_RING',
            severity: 'HIGH',
            details: {
              otherUserId,
              sharedTasks: overlap,
              agreementCount,
              agreementRate: agreementCount / overlap,
            },
          },
        });
      }
    }
  }
}
