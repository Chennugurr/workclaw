'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TASK_TYPE_LABELS } from '@/components/task-types';

const TASK_STATUS_COLORS = {
  AVAILABLE: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  SUBMITTED: 'bg-purple-100 text-purple-700',
  UNDER_REVIEW: 'bg-indigo-100 text-indigo-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
};

export default function Page() {
  const [selectedProject, setSelectedProject] = useState('all');

  const { data: projectsResult } = useAppSWR('/admin/projects?limit=100');
  const projects = projectsResult?.data || [];

  // Platform-wide task stats
  const { data: stats, isLoading } = useAppSWR('/admin/stats');

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Task Queues</h1>

      {isLoading ? (
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-24 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : (
        <>
          {/* Global Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <Card>
              <CardContent className='p-4 text-center'>
                <p className='text-2xl font-bold'>{stats?.tasks?.total || 0}</p>
                <p className='text-xs text-gray-500'>Total Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <p className='text-2xl font-bold'>{stats?.tasks?.completed || 0}</p>
                <p className='text-xs text-gray-500'>Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <p className='text-2xl font-bold'>{stats?.submissions?.total || 0}</p>
                <p className='text-xs text-gray-500'>Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <p className='text-2xl font-bold'>
                  {stats?.tasks?.total > 0
                    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
                    : 0}%
                </p>
                <p className='text-xs text-gray-500'>Completion Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Per-Project View */}
          <h3 className='font-semibold mb-3'>Projects Overview</h3>
          <div className='space-y-2'>
            {projects.map((project) => (
              <Card key={project.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='font-medium'>{project.title}</p>
                        <Badge variant='outline' className='text-xs'>
                          {TASK_TYPE_LABELS[project.taskType] || project.taskType}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-3 text-xs text-gray-500'>
                        <span>{project.organization?.name}</span>
                        <span>{project._count?.tasks || 0} tasks</span>
                        <span>{project._count?.taskBatches || 0} batches</span>
                        <Badge className={`text-xs ${
                          project.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
