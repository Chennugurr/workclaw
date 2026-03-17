'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import Markdown from 'markdown-to-jsx';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  User,
  Clock,
  Star,
  BookOpen,
  ListChecks,
} from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { getTaskComponent, TASK_TYPE_LABELS } from '@/components/task-types';

export default function Page({ params: paramsPromise }) {
  const router = useRouter();
  const [params, setParams] = useState(null);
  const [score, setScore] = useState(0.5);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    paramsPromise.then ? paramsPromise.then(setParams) : setParams(paramsPromise);
  }, [paramsPromise]);

  const submissionId = params?.submissionId;

  // We fetch the review queue item details via the reviews API
  const { data: result } = useAppSWR(
    submissionId ? `/reviews?status=all&limit=1` : null
  );

  // Fetch submission directly for full data
  const { data: submissions } = useAppSWR(
    submissionId ? `/reviews?status=all&limit=100` : null
  );

  const submission = submissions?.data?.find((s) => s.id === submissionId);
  const task = submission?.task;
  const hasExistingReview = submission?.reviews?.length > 0;
  const existingReview = submission?.reviews?.[0];

  const submitReview = async (verdict) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(`/reviews/${submissionId}`, {
        verdict,
        score,
        comments: comments || null,
        flags: [],
      });
      if (res.data.status === 'success') {
        toast.success(`Submission ${verdict.toLowerCase().replace(/_/g, ' ')}`);
        router.push('/app/reviewer/queue');
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!submission || !task) {
    return (
      <div className='space-y-4'>
        <div className='h-6 bg-gray-200 rounded w-48 animate-pulse' />
        <div className='h-64 bg-gray-100 rounded animate-pulse' />
      </div>
    );
  }

  const TaskComponent = getTaskComponent(task.taskType);
  const taskLabel = TASK_TYPE_LABELS[task.taskType] || task.taskType;
  const contributorName = submission.user?.profile
    ? `${submission.user.profile.firstName} ${submission.user.profile.lastName}`
    : 'Anonymous';

  return (
    <>
      <Link
        href='/app/reviewer/queue'
        className='inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        Back to Queue
      </Link>

      {/* Header */}
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h1 className='text-xl font-bold'>{task.project?.title}</h1>
          <div className='flex items-center gap-2 mt-1'>
            <Badge variant='outline' className='text-xs'>{taskLabel}</Badge>
            <span className='flex items-center gap-1 text-sm text-gray-500'>
              <User className='h-3.5 w-3.5' />
              {contributorName}
            </span>
            {task.isGold && (
              <Badge className='text-xs bg-yellow-100 text-yellow-700'>
                <Star className='h-3 w-3 mr-1' />
                Gold Task
              </Badge>
            )}
          </div>
        </div>
        {hasExistingReview && (
          <Badge className={`text-sm ${
            existingReview.verdict === 'APPROVED' ? 'bg-green-100 text-green-700'
              : existingReview.verdict === 'REJECTED' ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {existingReview.verdict.replace(/_/g, ' ')}
          </Badge>
        )}
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {/* Left: Instructions + Rubric */}
        <div className='space-y-4'>
          {task.instructions && (
            <Card>
              <CardContent className='p-4'>
                <h3 className='text-sm font-semibold flex items-center gap-2 mb-2'>
                  <BookOpen className='h-4 w-4' />
                  Instructions
                </h3>
                <div className='prose prose-sm max-w-none text-sm'>
                  <Markdown>{task.instructions}</Markdown>
                </div>
              </CardContent>
            </Card>
          )}

          {task.rubric && (
            <Card>
              <CardContent className='p-4'>
                <h3 className='text-sm font-semibold flex items-center gap-2 mb-2'>
                  <ListChecks className='h-4 w-4' />
                  Rubric
                </h3>
                <div className='text-sm space-y-2'>
                  {Object.entries(task.rubric).map(([key, value]) => (
                    <div key={key}>
                      <p className='font-medium capitalize'>{key.replace(/_/g, ' ')}</p>
                      <p className='text-gray-500 text-xs'>
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gold answer (for reviewer reference) */}
          {task.isGold && task.goldAnswer && (
            <Card className='border-yellow-200 bg-yellow-50'>
              <CardContent className='p-4'>
                <h3 className='text-sm font-semibold flex items-center gap-2 mb-2 text-yellow-800'>
                  <Star className='h-4 w-4' />
                  Gold Answer
                </h3>
                <pre className='text-xs bg-white p-3 rounded overflow-x-auto'>
                  {JSON.stringify(task.goldAnswer, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center + Right: Submission + Review Form */}
        <div className='xl:col-span-2 space-y-6'>
          {/* Contributor's submission (read-only) */}
          {TaskComponent ? (
            <TaskComponent
              task={task}
              submission={submission}
              onSave={() => {}}
              readOnly={true}
            />
          ) : (
            <Card>
              <CardContent className='p-5'>
                <h3 className='text-sm font-semibold mb-2'>Submission Response</h3>
                <pre className='text-xs bg-gray-50 p-4 rounded overflow-x-auto'>
                  {JSON.stringify(submission.response, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Contributor metadata */}
          <Card>
            <CardContent className='p-4'>
              <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                {submission.confidence != null && (
                  <span>Confidence: {(submission.confidence * 100).toFixed(0)}%</span>
                )}
                {submission.timeSpent != null && (
                  <span className='flex items-center gap-1'>
                    <Clock className='h-3.5 w-3.5' />
                    {Math.floor(submission.timeSpent / 60)}m {submission.timeSpent % 60}s
                  </span>
                )}
                {submission.reasoning && (
                  <div className='w-full'>
                    <p className='font-medium text-gray-700 mb-1'>Reasoning:</p>
                    <p className='text-sm'>{submission.reasoning}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Form */}
          {!hasExistingReview ? (
            <Card className='border-gray-900'>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Your Review</h3>

                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='text-sm font-medium'>Quality Score</label>
                    <span className='text-sm text-gray-500'>{(score * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[score * 100]}
                    onValueChange={([v]) => setScore(v / 100)}
                    max={100}
                    step={5}
                  />
                </div>

                <div className='mb-6'>
                  <label className='text-sm font-medium mb-2 block'>Comments</label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder='Feedback for the contributor...'
                    className='min-h-[80px]'
                  />
                </div>

                <div className='flex flex-wrap gap-2'>
                  <Button
                    onClick={() => submitReview('APPROVED')}
                    disabled={isSubmitting}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <CheckCircle2 className='h-4 w-4 mr-1' />
                    Approve
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => submitReview('REVISION_REQUESTED')}
                    disabled={isSubmitting}
                    className='text-yellow-700 border-yellow-300 hover:bg-yellow-50'
                  >
                    <AlertTriangle className='h-4 w-4 mr-1' />
                    Request Revision
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => submitReview('REJECTED')}
                    disabled={isSubmitting}
                    className='text-red-600 border-red-300 hover:bg-red-50'
                  >
                    <XCircle className='h-4 w-4 mr-1' />
                    Reject
                  </Button>
                  <Button
                    variant='ghost'
                    onClick={() => submitReview('ESCALATED')}
                    disabled={isSubmitting}
                  >
                    <ArrowUpRight className='h-4 w-4 mr-1' />
                    Escalate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className='border-green-200 bg-green-50'>
              <CardContent className='p-5'>
                <h3 className='font-semibold mb-2'>Your Review</h3>
                <Badge className={
                  existingReview.verdict === 'APPROVED' ? 'bg-green-100 text-green-700'
                    : existingReview.verdict === 'REJECTED' ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }>
                  {existingReview.verdict.replace(/_/g, ' ')}
                </Badge>
                {existingReview.score != null && (
                  <p className='text-sm text-gray-600 mt-2'>
                    Score: {(existingReview.score * 100).toFixed(0)}%
                  </p>
                )}
                {existingReview.comments && (
                  <p className='text-sm text-gray-600 mt-1'>{existingReview.comments}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
