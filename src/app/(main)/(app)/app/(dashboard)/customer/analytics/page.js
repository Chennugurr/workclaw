'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Target,
} from 'lucide-react';
import { useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TASK_TYPE_LABELS } from '@/components/task-types';

export default function Page() {
  const { organization: org } = useAppState();
  const [selectedProject, setSelectedProject] = useState('all');

  const { data: orgAnalytics, isLoading: orgLoading } = useAppSWR(
    org?.selected?.id ? `/orgs/${org.selected.id}/analytics` : null
  );
  const { data: projectsResult } = useAppSWR(
    org?.selected?.id ? `/orgs/${org.selected.id}/projects?limit=100` : null
  );
  const { data: projectAnalytics, isLoading: projLoading } = useAppSWR(
    selectedProject !== 'all' && org?.selected?.id
      ? `/orgs/${org.selected.id}/projects/${selectedProject}/analytics`
      : null
  );

  const projects = projectsResult?.data || [];
  const stats = selectedProject === 'all' ? orgAnalytics : projectAnalytics;
  const isLoading = selectedProject === 'all' ? orgLoading : projLoading;

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-24 bg-gray-100 rounded-lg animate-pulse' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Analytics</h1>
          <p className='text-gray-500'>Performance metrics and insights.</p>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className='w-64'>
            <SelectValue placeholder='All Projects' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {stats ? (
        <>
          {/* Overview Cards */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <MetricCard
              icon={Target}
              iconColor='text-blue-600'
              label='Total Tasks'
              value={stats.tasks?.total || 0}
            />
            <MetricCard
              icon={CheckCircle2}
              iconColor='text-green-600'
              label='Completed'
              value={stats.tasks?.completed || 0}
            />
            <MetricCard
              icon={Users}
              iconColor='text-purple-600'
              label={selectedProject === 'all' ? 'Applications' : 'Contributors'}
              value={selectedProject === 'all'
                ? stats.contributors?.totalApplications || 0
                : stats.contributors?.approvedContributors || 0
              }
            />
            <MetricCard
              icon={DollarSign}
              iconColor='text-yellow-600'
              label='Total Spent'
              value={`$${(stats.cost?.totalSpent || 0).toFixed(2)}`}
            />
          </div>

          {/* Task Breakdown */}
          <Card className='mb-6'>
            <CardContent className='p-5'>
              <h3 className='font-semibold mb-4'>Task Status Breakdown</h3>
              <div className='space-y-3'>
                {selectedProject !== 'all' && stats.tasks ? (
                  <>
                    <StatusRow label='Available' count={stats.tasks.AVAILABLE || 0} total={stats.tasks.total} color='bg-blue-500' />
                    <StatusRow label='Assigned / In Progress' count={(stats.tasks.ASSIGNED || 0) + (stats.tasks.IN_PROGRESS || 0)} total={stats.tasks.total} color='bg-yellow-500' />
                    <StatusRow label='Submitted / Under Review' count={(stats.tasks.SUBMITTED || 0) + (stats.tasks.UNDER_REVIEW || 0)} total={stats.tasks.total} color='bg-purple-500' />
                    <StatusRow label='Approved' count={stats.tasks.APPROVED || 0} total={stats.tasks.total} color='bg-green-500' />
                    <StatusRow label='Rejected' count={stats.tasks.REJECTED || 0} total={stats.tasks.total} color='bg-red-500' />
                  </>
                ) : (
                  <>
                    <StatusRow label='Available' count={stats.tasks?.available || 0} total={stats.tasks?.total || 1} color='bg-blue-500' />
                    <StatusRow label='In Progress' count={stats.tasks?.inProgress || 0} total={stats.tasks?.total || 1} color='bg-yellow-500' />
                    <StatusRow label='Completed' count={stats.tasks?.completed || 0} total={stats.tasks?.total || 1} color='bg-green-500' />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submission Quality (project-level only) */}
          {selectedProject !== 'all' && stats.submissions && (
            <Card className='mb-6'>
              <CardContent className='p-5'>
                <h3 className='font-semibold mb-4'>Submission Quality</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>
                      {Math.round((stats.submissions.acceptanceRate || 0) * 100)}%
                    </p>
                    <p className='text-xs text-gray-500'>Acceptance Rate</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>
                      {Math.round((stats.submissions.avgConfidence || 0) * 100)}%
                    </p>
                    <p className='text-xs text-gray-500'>Avg Confidence</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>
                      {stats.submissions.avgTimeSpent || 0}s
                    </p>
                    <p className='text-xs text-gray-500'>Avg Time Spent</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold'>{stats.submissions.total || 0}</p>
                    <p className='text-xs text-gray-500'>Total Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Verdicts (project-level only) */}
          {selectedProject !== 'all' && stats.reviews && Object.keys(stats.reviews).length > 0 && (
            <Card className='mb-6'>
              <CardContent className='p-5'>
                <h3 className='font-semibold mb-4'>Review Verdicts</h3>
                <div className='flex gap-4'>
                  {Object.entries(stats.reviews).map(([verdict, count]) => (
                    <div key={verdict} className='text-center'>
                      <p className='text-xl font-bold'>{count}</p>
                      <p className='text-xs text-gray-500'>{verdict.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost */}
          <Card>
            <CardContent className='p-5'>
              <h3 className='font-semibold mb-4'>Cost Summary</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-xs text-gray-500'>Total Spent</p>
                  <p className='text-2xl font-bold'>${(stats.cost?.totalSpent || 0).toFixed(2)}</p>
                  <p className='text-xs text-gray-400'>USDC</p>
                </div>
                {selectedProject !== 'all' && (
                  <div>
                    <p className='text-xs text-gray-500'>Cost Per Task</p>
                    <p className='text-2xl font-bold'>${(stats.cost?.costPerTask || 0).toFixed(2)}</p>
                    <p className='text-xs text-gray-400'>USDC</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <BarChart3 className='h-12 w-12 mx-auto text-gray-300 mb-3' />
            <p className='text-gray-500'>No analytics data available yet.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function MetricCard({ icon: Icon, iconColor, label, value }) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center gap-3'>
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <div>
            <p className='text-xs text-gray-500'>{label}</p>
            <p className='text-xl font-bold'>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className='flex items-center gap-3'>
      <span className='text-sm text-gray-600 w-40'>{label}</span>
      <div className='flex-1'>
        <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className='text-sm font-medium w-12 text-right'>{count}</span>
    </div>
  );
}
