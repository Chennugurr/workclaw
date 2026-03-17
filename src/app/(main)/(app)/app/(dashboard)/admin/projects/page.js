'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { toast } from 'sonner';
import { MoreHorizontal, Play, Pause, Archive } from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TASK_TYPE_LABELS } from '@/components/task-types';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700',
  OPEN: 'bg-green-100 text-green-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
  FULL: 'bg-purple-100 text-purple-700',
  SCREENING_SETUP: 'bg-yellow-100 text-yellow-700',
  INVITE_ONLY: 'bg-blue-100 text-blue-700',
};

export default function Page() {
  const [statusFilter, setStatusFilter] = useState('all');
  const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';

  const { data: result, isLoading, mutate } = useAppSWR(`/admin/projects${query}`);
  const projects = result?.data || [];

  const handleStatusChange = async (projectId, status) => {
    try {
      const res = await axios.patch(`/admin/projects/${projectId}`, { status });
      if (res.data.status === 'success') {
        toast.success(`Project ${status.toLowerCase()}`);
        mutate();
      }
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Project Management</h1>

      <div className='mb-6'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            {Object.keys(STATUS_COLORS).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-20 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : (
        <div className='space-y-2'>
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <p className='font-medium'>{project.title}</p>
                      <Badge className={`text-xs ${STATUS_COLORS[project.status]}`}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className='flex items-center gap-3 text-xs text-gray-500'>
                      <span>{project.organization?.name}</span>
                      <span>{TASK_TYPE_LABELS[project.taskType] || project.taskType}</span>
                      <span>${parseFloat(project.rateAmount || 0).toFixed(2)} USDC</span>
                      <span>{project._count?.tasks || 0} tasks</span>
                      <span>{project._count?.applications || 0} applications</span>
                      <span>{dayjs(project.createdAt).format('MMM D, YYYY')}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      {project.status !== 'OPEN' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'OPEN')}>
                          <Play className='mr-2 h-4 w-4' /> Open
                        </DropdownMenuItem>
                      )}
                      {project.status === 'OPEN' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'PAUSED')}>
                          <Pause className='mr-2 h-4 w-4' /> Pause
                        </DropdownMenuItem>
                      )}
                      {project.status !== 'ARCHIVED' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'ARCHIVED')}>
                          <Archive className='mr-2 h-4 w-4' /> Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
