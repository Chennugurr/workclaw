'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'sonner';
import {
  ClipboardList,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Play,
  Eye,
  Zap,
} from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TASK_TYPE_LABELS } from '@/components/task-types';

dayjs.extend(relativeTime);

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
];

const STATUS_CONFIG = {
  ASSIGNED: { label: 'Assigned', color: 'bg-blue-100 text-blue-700', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: Play },
  SUBMITTED: { label: 'Submitted', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-orange-100 text-orange-700', icon: Eye },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: AlertCircle },
};

function TaskCard({ task }) {
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.ASSIGNED;
  const StatusIcon = statusCfg.icon;
  const taskLabel = TASK_TYPE_LABELS[task.taskType] || task.taskType;
  const isActive = ['ASSIGNED', 'IN_PROGRESS'].includes(task.status);
  const hasDraft = task.submission?.isDraft;

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <Link href={`/app/contributor/tasks/${task.id}`}>
        <CardContent className='p-5'>
          <div className='flex items-start justify-between mb-3'>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 truncate'>
                {task.project?.title || 'Untitled Project'}
              </h3>
              <div className='flex items-center gap-2 mt-1'>
                <Badge variant='outline' className='text-xs'>{taskLabel}</Badge>
                {hasDraft && (
                  <Badge variant='secondary' className='text-xs'>Draft saved</Badge>
                )}
              </div>
            </div>
            <Badge className={`text-xs ${statusCfg.color} gap-1 shrink-0`}>
              <StatusIcon className='h-3 w-3' />
              {statusCfg.label}
            </Badge>
          </div>

          <div className='flex items-center gap-4 text-sm text-gray-500'>
            {task.project?.rateAmount && (
              <div className='flex items-center gap-1'>
                <DollarSign className='h-3.5 w-3.5' />
                <span>
                  ${Number(task.project.rateAmount).toFixed(2)}
                  {task.project.payModel === 'PER_TASK' ? '/task' : '/hr'}
                </span>
              </div>
            )}
            <div className='flex items-center gap-1'>
              <Clock className='h-3.5 w-3.5' />
              <span>
                {task.assignedAt
                  ? dayjs(task.assignedAt).fromNow()
                  : dayjs(task.createdAt).fromNow()}
              </span>
            </div>
            {task.submission?.timeSpent && (
              <span className='text-xs'>
                {Math.floor(task.submission.timeSpent / 60)}m {task.submission.timeSpent % 60}s spent
              </span>
            )}
          </div>

          {/* Review feedback preview */}
          {task.submission?.reviews?.length > 0 && (
            <div className='mt-3 pt-3 border-t'>
              <p className='text-xs text-gray-500'>
                Review: {task.submission.reviews[0].verdict.replace(/_/g, ' ')}
                {task.submission.reviews[0].score != null &&
                  ` · ${(task.submission.reviews[0].score * 100).toFixed(0)}%`}
              </p>
            </div>
          )}

          {isActive && (
            <div className='flex items-center justify-end mt-3 text-sm font-medium text-gray-900'>
              {hasDraft ? 'Continue' : 'Start'}
              <ChevronRight className='h-4 w-4 ml-1' />
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

function ClaimTaskCard({ project, onClaimed }) {
  const [claiming, setClaiming] = useState(false);
  const router = useRouter();
  const taskLabel = TASK_TYPE_LABELS[project.taskType] || project.taskType;

  const claimTask = async () => {
    setClaiming(true);
    try {
      const res = await axios.post('/tasks', { projectId: project.id });
      const task = res.data.data;
      toast.success('Task claimed!');
      router.push(`/app/contributor/tasks/${task.id}`);
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to claim task.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardContent className='p-5 flex items-center justify-between'>
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-gray-900 truncate'>{project.title}</h3>
          <div className='flex items-center gap-2 mt-1'>
            <Badge variant='outline' className='text-xs'>{taskLabel}</Badge>
            {project.rateAmount && (
              <span className='text-xs text-gray-500 flex items-center gap-1'>
                <DollarSign className='h-3 w-3' />
                ${Number(project.rateAmount).toFixed(2)}/task
              </span>
            )}
          </div>
        </div>
        <Button size='sm' onClick={claimTask} disabled={claiming}>
          <Zap className='h-3.5 w-3.5 mr-1' />
          {claiming ? 'Claiming...' : 'Claim Task'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PageContent() {
  const [activeTab, setActiveTab] = useState('active');
  const router = useRouter();
  const { data: result, isLoading, mutate } = useAppSWR(
    `/tasks?status=${activeTab}&limit=50`
  );
  const { data: approvedProjects } = useAppSWR('/tasks/available-projects');

  const tasks = result?.data || [];
  const pagination = result?.pagination;

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-1'>My Tasks</h1>
        <p className='text-gray-500'>Your assigned and completed work.</p>
      </div>

      {/* Available Projects — Claim Tasks */}
      {approvedProjects?.length > 0 && activeTab === 'active' && (
        <div className='mb-6'>
          <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3'>
            Claim New Tasks
          </h2>
          <div className='space-y-2'>
            {approvedProjects.map((project) => (
              <ClaimTaskCard key={project.id} project={project} onClaimed={mutate} />
            ))}
          </div>
        </div>
      )}

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

      {/* Task List */}
      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className='p-5'>
                <div className='h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse' />
                <div className='h-4 bg-gray-100 rounded w-1/2 mb-2 animate-pulse' />
                <div className='h-3 bg-gray-100 rounded w-1/3 animate-pulse' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className='space-y-3'>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <ClipboardList className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>
              {activeTab === 'active'
                ? 'No active tasks'
                : activeTab === 'completed'
                ? 'No completed tasks yet'
                : 'No tasks yet'}
            </h3>
            <p className='text-sm text-gray-500 max-w-md mx-auto mb-4'>
              {activeTab === 'active' && !approvedProjects?.length
                ? 'Apply to a project and get accepted to start receiving tasks.'
                : activeTab === 'active'
                ? 'Claim a task from your approved projects above.'
                : 'Complete tasks to see them here.'}
            </p>
            {activeTab === 'active' && !approvedProjects?.length && (
              <Button asChild>
                <Link href='/app/contributor/opportunities'>
                  Browse Opportunities
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
