'use client';

import { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ClipboardList,
  ChevronRight,
  Clock,
  CheckCircle2,
  User,
  Eye,
} from 'lucide-react';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TASK_TYPE_LABELS } from '@/components/task-types';

dayjs.extend(relativeTime);

const TABS = [
  { key: 'pending', label: 'Pending Review' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'all', label: 'All' },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState('pending');
  const { data: result, isLoading } = useAppSWR(
    `/reviews?status=${activeTab}&limit=50`
  );

  const submissions = result?.data || [];

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-1'>Review Queue</h1>
        <p className='text-gray-500'>Review contributor submissions for quality.</p>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className='p-5'>
                <div className='h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse' />
                <div className='h-4 bg-gray-100 rounded w-1/2 animate-pulse' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : submissions.length > 0 ? (
        <div className='space-y-3'>
          {submissions.map((sub) => {
            const taskLabel = TASK_TYPE_LABELS[sub.task?.taskType] || sub.task?.taskType;
            const hasReview = sub.reviews?.length > 0;
            const contributorName = sub.user?.profile
              ? `${sub.user.profile.firstName} ${sub.user.profile.lastName}`
              : 'Anonymous';

            return (
              <Card key={sub.id} className='hover:shadow-md transition-shadow'>
                <Link href={`/app/reviewer/queue/${sub.id}`}>
                  <CardContent className='p-5'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-gray-900 truncate'>
                          {sub.task?.project?.title || 'Untitled'}
                        </h3>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge variant='outline' className='text-xs'>{taskLabel}</Badge>
                          <span className='flex items-center gap-1 text-xs text-gray-500'>
                            <User className='h-3 w-3' />
                            {contributorName}
                          </span>
                          <span className='flex items-center gap-1 text-xs text-gray-400'>
                            <Clock className='h-3 w-3' />
                            {sub.submittedAt ? dayjs(sub.submittedAt).fromNow() : 'pending'}
                          </span>
                          {sub.task?.isGold && (
                            <Badge className='text-xs bg-yellow-100 text-yellow-700'>Gold</Badge>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {hasReview ? (
                          <Badge className={`text-xs ${
                            sub.reviews[0].verdict === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : sub.reviews[0].verdict === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {sub.reviews[0].verdict.replace(/_/g, ' ')}
                          </Badge>
                        ) : (
                          <Badge className='text-xs bg-blue-100 text-blue-700'>
                            <Eye className='h-3 w-3 mr-1' />
                            Needs Review
                          </Badge>
                        )}
                        <ChevronRight className='h-4 w-4 text-gray-400' />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <ClipboardList className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>
              {activeTab === 'pending' ? 'No submissions to review' : 'No reviews yet'}
            </h3>
            <p className='text-sm text-gray-500'>
              {activeTab === 'pending'
                ? 'All submissions have been reviewed. Check back later.'
                : 'Your reviewed submissions will appear here.'}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
