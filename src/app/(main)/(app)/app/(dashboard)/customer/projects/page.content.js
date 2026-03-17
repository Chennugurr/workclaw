'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import {
  Plus,
  MoreVertical,
  Eye,
  Settings2,
  Users,
  Upload,
  BarChart3,
  Pause,
  Play,
  Archive,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  SCREENING_SETUP: { label: 'Screening Setup', color: 'bg-yellow-100 text-yellow-700' },
  INVITE_ONLY: { label: 'Invite Only', color: 'bg-blue-100 text-blue-700' },
  OPEN: { label: 'Open', color: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Paused', color: 'bg-orange-100 text-orange-700' },
  FULL: { label: 'Full', color: 'bg-purple-100 text-purple-700' },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-500' },
};

const PAY_MODEL_LABELS = { PER_TASK: 'per task', HOURLY: 'per hour' };

export default function PageContent() {
  const { organization: org } = useAppState();
  const [statusFilter, setStatusFilter] = useState('all');

  const url = statusFilter === 'all'
    ? `/orgs/${org.selected.id}/projects`
    : `/orgs/${org.selected.id}/projects?status=${statusFilter}`;

  const { data: result, isLoading, mutate } = useAppSWR(
    org?.selected?.id ? url : null
  );

  const projects = result?.data || [];

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const res = await axios.patch(`/orgs/${org.selected.id}/projects/${projectId}`, {
        status: newStatus,
      });
      if (res.data.status === 'success') {
        toast.success(`Project ${newStatus.toLowerCase()}`);
        mutate();
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to update status');
    }
  };

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Projects</h1>
          <p className='text-gray-500'>Manage your AI work projects.</p>
        </div>
        <Button asChild>
          <Link href='/app/customer/projects/new'>
            <Plus className='h-4 w-4 mr-1' /> New Project
          </Link>
        </Button>
      </div>

      <div className='flex gap-3 mb-6'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Projects</SelectItem>
            <SelectItem value='DRAFT'>Drafts</SelectItem>
            <SelectItem value='OPEN'>Open</SelectItem>
            <SelectItem value='PAUSED'>Paused</SelectItem>
            <SelectItem value='ARCHIVED'>Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-24 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className='space-y-3'>
          {projects.map((project) => {
            const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.DRAFT;
            return (
              <Card key={project.id} className='hover:shadow-sm transition-shadow'>
                <CardContent className='p-5'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <Link
                          href={`/app/customer/projects/${project.id}/edit`}
                          className='text-base font-semibold hover:underline truncate'
                        >
                          {project.title}
                        </Link>
                        <Badge className={`text-xs shrink-0 ${statusCfg.color}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-4 text-sm text-gray-500'>
                        <span>{TASK_TYPE_LABELS[project.taskType] || project.taskType}</span>
                        <span>${parseFloat(project.rateAmount || 0).toFixed(2)} USDC {PAY_MODEL_LABELS[project.payModel]}</span>
                        <span>{dayjs(project.createdAt).format('MMM D, YYYY')}</span>
                      </div>
                      <div className='flex items-center gap-4 mt-2 text-xs text-gray-400'>
                        <span>{project._count?.applications || 0} applications</span>
                        <span>{project._count?.tasks || 0} tasks</span>
                        <span>{project._count?.taskBatches || 0} batches</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                          <Link href={`/app/customer/projects/${project.id}/edit`}>
                            <Settings2 className='mr-2 h-4 w-4' /> Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/app/customer/projects/${project.id}/applications`}>
                            <Users className='mr-2 h-4 w-4' /> Applications
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/app/contributor/opportunities/${project.id}`} target='_blank'>
                            <Eye className='mr-2 h-4 w-4' /> Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {project.status === 'DRAFT' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'OPEN')}>
                            <Play className='mr-2 h-4 w-4' /> Publish
                          </DropdownMenuItem>
                        )}
                        {project.status === 'OPEN' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'PAUSED')}>
                            <Pause className='mr-2 h-4 w-4' /> Pause
                          </DropdownMenuItem>
                        )}
                        {project.status === 'PAUSED' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'OPEN')}>
                            <Play className='mr-2 h-4 w-4' /> Resume
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
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <p className='text-gray-500 mb-4'>No projects yet. Create your first AI work project.</p>
            <Button asChild>
              <Link href='/app/customer/projects/new'>
                <Plus className='h-4 w-4 mr-1' /> Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
