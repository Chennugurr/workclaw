import prisma from '@/lib/prisma';

/**
 * Create a notification for a user.
 * This is the central notification creation function used by all systems.
 */
export async function notify(userId, { type, title, body, data }) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body: body || null,
      data: data || null,
    },
  });
}

/**
 * Predefined notification templates.
 */
export const NotificationTemplates = {
  applicationApproved: (userId, projectTitle) =>
    notify(userId, {
      type: 'APPLICATION_APPROVED',
      title: 'Application Approved',
      body: `Your application to "${projectTitle}" has been approved. You can now start working on tasks.`,
    }),

  applicationRejected: (userId, projectTitle) =>
    notify(userId, {
      type: 'APPLICATION_REJECTED',
      title: 'Application Rejected',
      body: `Your application to "${projectTitle}" was not accepted at this time.`,
    }),

  taskAssigned: (userId, taskId, projectTitle) =>
    notify(userId, {
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      body: `A new task has been assigned to you in "${projectTitle}".`,
      data: { taskId },
    }),

  reviewCompleted: (userId, verdict, projectTitle) =>
    notify(userId, {
      type: 'REVIEW_COMPLETED',
      title: `Submission ${verdict}`,
      body: `Your submission in "${projectTitle}" was ${verdict.toLowerCase()}.`,
    }),

  payoutApproved: (userId, amount) =>
    notify(userId, {
      type: 'PAYOUT_APPROVED',
      title: 'Payout Approved',
      body: `Your payout of $${amount} USDC has been approved and is being processed.`,
    }),

  payoutCompleted: (userId, amount, txHash) =>
    notify(userId, {
      type: 'PAYOUT_COMPLETED',
      title: 'Payout Completed',
      body: `Your payout of $${amount} USDC has been sent.`,
      data: { txHash },
    }),

  tierUpgrade: (userId, fromTier, toTier) =>
    notify(userId, {
      type: 'TIER_UPGRADE',
      title: 'Tier Upgrade!',
      body: `Congratulations! You've been promoted from ${fromTier} to ${toTier}.`,
    }),

  badgeEarned: (userId, badgeName) =>
    notify(userId, {
      type: 'BADGE_EARNED',
      title: 'Badge Earned!',
      body: `You've earned the "${badgeName}" badge.`,
    }),

  fraudWarning: (userId, flagType) =>
    notify(userId, {
      type: 'FRAUD_WARNING',
      title: 'Account Warning',
      body: `A ${flagType.replace(/_/g, ' ').toLowerCase()} flag has been raised on your account. Please review your recent activity.`,
    }),

  announcement: (userId, announcementTitle) =>
    notify(userId, {
      type: 'ANNOUNCEMENT',
      title: announcementTitle,
      body: 'A new platform announcement has been posted.',
    }),
};
