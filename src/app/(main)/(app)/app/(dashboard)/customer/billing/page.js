'use client';

import { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  FileText,
  Download,
} from 'lucide-react';
import { useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TASK_TYPE_LABELS } from '@/components/task-types';

export default function Page() {
  const { organization: org } = useAppState();

  const { data: analytics, isLoading } = useAppSWR(
    org?.selected?.id ? `/orgs/${org.selected.id}/analytics` : null
  );
  const { data: projectsResult } = useAppSWR(
    org?.selected?.id ? `/orgs/${org.selected.id}/projects?limit=100` : null
  );

  const projects = projectsResult?.data || [];
  const stats = analytics || { cost: { totalSpent: 0 }, tasks: { completed: 0 } };

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
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Billing</h1>
        <p className='text-gray-500'>View spending and manage billing settings.</p>
      </div>

      {/* Spending Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card>
          <CardContent className='p-5'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-green-50'>
                <DollarSign className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Total Spent</p>
                <p className='text-2xl font-bold'>${stats.cost.totalSpent.toFixed(2)}</p>
                <p className='text-xs text-gray-400'>USDC</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-5'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-50'>
                <TrendingUp className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Tasks Completed</p>
                <p className='text-2xl font-bold'>{stats.tasks.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-5'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-purple-50'>
                <Wallet className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Avg Cost / Task</p>
                <p className='text-2xl font-bold'>
                  ${stats.tasks.completed > 0
                    ? (stats.cost.totalSpent / stats.tasks.completed).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Project Breakdown */}
      <Card className='mb-6'>
        <CardContent className='p-5'>
          <h3 className='font-semibold mb-4'>Spending by Project</h3>
          {projects.length > 0 ? (
            <div className='space-y-3'>
              {projects.map((project) => {
                const rate = parseFloat(project.rateAmount || 0);
                const taskCount = project._count?.tasks || 0;
                const estimated = rate * taskCount;
                return (
                  <div key={project.id} className='flex items-center justify-between py-2 border-b last:border-0'>
                    <div>
                      <p className='text-sm font-medium'>{project.title}</p>
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <span>{TASK_TYPE_LABELS[project.taskType] || project.taskType}</span>
                        <span>${rate.toFixed(2)} / task</span>
                        <span>{taskCount} tasks</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>${estimated.toFixed(2)}</p>
                      <p className='text-xs text-gray-400'>estimated</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className='text-sm text-gray-400 text-center py-4'>No projects yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardContent className='p-5'>
          <h3 className='font-semibold mb-4 flex items-center gap-2'>
            <CreditCard className='h-4 w-4' />
            Payment Method
          </h3>
          <div className='bg-gray-50 rounded-lg p-4 text-center'>
            <Wallet className='h-8 w-8 mx-auto text-gray-400 mb-2' />
            <p className='text-sm text-gray-600 font-medium'>Connected Wallet</p>
            <p className='text-xs text-gray-400 mt-1'>
              Payments are processed via your connected wallet using USDC.
            </p>
            <Badge variant='secondary' className='mt-3'>USDC on Solana / Ethereum</Badge>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
