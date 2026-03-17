'use client';

import Link from 'next/link';
import {
  FolderKanban,
  Users,
  ClipboardList,
  DollarSign,
  ChevronRight,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PageContent() {
  const { organization: org } = useAppState();
  const { data: analytics, isLoading } = useAppSWR(
    org?.selected?.id ? `/orgs/${org.selected.id}/analytics` : null
  );
  const { data: projectsResult } = useAppSWR(
    org?.selected?.id ? `/orgs/${org.selected.id}/projects?limit=5` : null
  );

  const projects = projectsResult?.data || [];

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='h-24 bg-gray-100 rounded-lg animate-pulse' />
        ))}
      </div>
    );
  }

  const stats = analytics || {
    projects: { total: 0, active: 0 },
    tasks: { total: 0, completed: 0, inProgress: 0, completionRate: 0 },
    contributors: { totalApplications: 0, pendingApplications: 0 },
    cost: { totalSpent: 0 },
  };

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Dashboard</h1>
          <p className='text-gray-500'>Welcome back, {org?.selected?.name}</p>
        </div>
        <Button asChild>
          <Link href='/app/customer/projects/new'>
            <Plus className='h-4 w-4 mr-1' /> New Project
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <SummaryCard
          icon={FolderKanban}
          iconBg='bg-blue-50'
          iconColor='text-blue-600'
          label='Active Projects'
          value={stats.projects.active}
          sub={`${stats.projects.total} total`}
        />
        <SummaryCard
          icon={ClipboardList}
          iconBg='bg-green-50'
          iconColor='text-green-600'
          label='Tasks Completed'
          value={stats.tasks.completed}
          sub={`${stats.tasks.total} total`}
        />
        <SummaryCard
          icon={Users}
          iconBg='bg-purple-50'
          iconColor='text-purple-600'
          label='Applications'
          value={stats.contributors.totalApplications}
          sub={`${stats.contributors.pendingApplications} pending`}
        />
        <SummaryCard
          icon={DollarSign}
          iconBg='bg-yellow-50'
          iconColor='text-yellow-600'
          label='Total Spent'
          value={`$${stats.cost.totalSpent.toFixed(2)}`}
          sub='USDC'
        />
      </div>

      {/* Task Throughput */}
      <Card className='mb-6'>
        <CardContent className='p-5'>
          <h3 className='font-semibold mb-4'>Task Throughput</h3>
          <div className='grid grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <Clock className='h-4 w-4 text-orange-500' />
                <span className='text-2xl font-bold'>{stats.tasks.inProgress}</span>
              </div>
              <p className='text-xs text-gray-500'>In Progress</p>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <CheckCircle2 className='h-4 w-4 text-green-500' />
                <span className='text-2xl font-bold'>{stats.tasks.completed}</span>
              </div>
              <p className='text-xs text-gray-500'>Completed</p>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <TrendingUp className='h-4 w-4 text-blue-500' />
                <span className='text-2xl font-bold'>
                  {Math.round(stats.tasks.completionRate * 100)}%
                </span>
              </div>
              <p className='text-xs text-gray-500'>Completion Rate</p>
            </div>
          </div>
          {stats.tasks.total > 0 && (
            <div className='mt-4'>
              <Progress value={stats.tasks.completionRate * 100} className='h-2' />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold'>Recent Projects</h3>
        <Button variant='link' size='sm' asChild>
          <Link href='/app/customer/projects'>
            View all <ChevronRight className='h-4 w-4 ml-1' />
          </Link>
        </Button>
      </div>
      {projects.length > 0 ? (
        <div className='space-y-2'>
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Link
                      href={`/app/customer/projects/${project.id}/edit`}
                      className='font-medium hover:underline'
                    >
                      {project.title}
                    </Link>
                    <div className='flex items-center gap-3 text-xs text-gray-500 mt-1'>
                      <span>{project._count?.tasks || 0} tasks</span>
                      <span>{project._count?.applications || 0} applications</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        project.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                        project.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <Button variant='ghost' size='sm' asChild>
                    <Link href={`/app/customer/projects/${project.id}/edit`}>
                      <ChevronRight className='h-4 w-4' />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='p-8 text-center'>
            <p className='text-gray-500 mb-3'>No projects yet.</p>
            <Button asChild>
              <Link href='/app/customer/projects/new'>
                <Plus className='h-4 w-4 mr-1' /> Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function SummaryCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs text-gray-500'>{label}</p>
            <p className='text-xl font-bold mt-1'>{value}</p>
            {sub && <p className='text-xs text-gray-400'>{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
