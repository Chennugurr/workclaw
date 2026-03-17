import jsend from 'jsend';
import { NextResponse } from 'next/server';
import { middleware, ROLE } from '@/api/middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/orgs/:orgId/projects/:projectId/export
 * Export completed task results as JSON.
 * Query params: format (json|csv), status (APPROVED|all), batchId
 */
export const GET = middleware(
  async (req, { params }) => {
    const { orgId, projectId } = await params;
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';
    const statusFilter = url.searchParams.get('status') || 'APPROVED';
    const batchId = url.searchParams.get('batchId');

    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true, title: true, taskType: true },
    });
    if (!project) {
      return NextResponse.json(jsend.fail({ message: 'Project not found' }), { status: 404 });
    }

    const taskWhere = { projectId };
    if (statusFilter !== 'all') taskWhere.status = statusFilter;
    if (batchId) taskWhere.batchId = batchId;

    const tasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        submissions: {
          where: { isDraft: false },
          include: {
            user: { select: { id: true, tier: true, profile: { select: { firstName: true, lastName: true } } } },
            reviews: { select: { verdict: true, score: true, comments: true } },
          },
        },
        batch: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const exportData = tasks.map((task) => ({
      taskId: task.id,
      batchName: task.batch?.name || null,
      taskType: task.taskType,
      status: task.status,
      isGold: task.isGold,
      data: task.data,
      submissions: task.submissions.map((sub) => ({
        submissionId: sub.id,
        contributorId: sub.userId,
        contributorTier: sub.user.tier,
        response: sub.response,
        confidence: sub.confidence,
        reasoning: sub.reasoning,
        timeSpent: sub.timeSpent,
        submittedAt: sub.submittedAt,
        status: sub.status,
        reviews: sub.reviews.map((r) => ({
          verdict: r.verdict,
          score: r.score,
          comments: r.comments,
        })),
      })),
    }));

    if (format === 'csv') {
      // Flatten to CSV rows
      const rows = [];
      rows.push([
        'task_id', 'batch_name', 'task_type', 'task_status', 'is_gold',
        'submission_id', 'contributor_id', 'contributor_tier',
        'response', 'confidence', 'reasoning', 'time_spent',
        'submitted_at', 'submission_status', 'review_verdict', 'review_score',
      ].join(','));

      for (const task of exportData) {
        if (task.submissions.length === 0) {
          rows.push([
            task.taskId, task.batchName || '', task.taskType, task.status, task.isGold,
            '', '', '', '', '', '', '', '', '', '', '',
          ].map(csvEscape).join(','));
        } else {
          for (const sub of task.submissions) {
            const review = sub.reviews[0] || {};
            rows.push([
              task.taskId, task.batchName || '', task.taskType, task.status, task.isGold,
              sub.submissionId, sub.contributorId, sub.contributorTier,
              JSON.stringify(sub.response), sub.confidence || '', sub.reasoning || '',
              sub.timeSpent || '', sub.submittedAt || '', sub.status,
              review.verdict || '', review.score ?? '',
            ].map(csvEscape).join(','));
          }
        }
      }

      return new NextResponse(rows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}_export.csv"`,
        },
      });
    }

    return NextResponse.json(
      jsend.success({
        project: { id: project.id, title: project.title, taskType: project.taskType },
        totalTasks: exportData.length,
        data: exportData,
      })
    );
  },
  {
    requireAuth: true,
    role: { roles: [ROLE.ORGANIZATION.MEMBER] },
  }
);

function csvEscape(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
