'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from 'lucide-react';
import { useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TIER_CONFIG = {
  NEW: { color: 'bg-gray-100 text-gray-600' },
  VERIFIED: { color: 'bg-blue-100 text-blue-700' },
  SKILLED: { color: 'bg-green-100 text-green-700' },
  TRUSTED: { color: 'bg-purple-100 text-purple-700' },
  EXPERT: { color: 'bg-orange-100 text-orange-700' },
  ELITE_REVIEWER: { color: 'bg-red-100 text-red-700' },
};

const APP_STATUS_CONFIG = {
  PENDING: { icon: Shield, color: 'text-yellow-600' },
  APPROVED: { icon: CheckCircle2, color: 'text-green-600' },
  REJECTED: { icon: XCircle, color: 'text-red-600' },
  SUSPENDED: { icon: Shield, color: 'text-gray-500' },
};

export default function Page() {
  const { organization: org } = useAppState();
  const [projectFilter, setProjectFilter] = useState('all');

  const { data: projectsResult } = useAppSWR(
    org?.selected?.id ? `/orgs/${org.selected.id}/projects?limit=100` : null
  );

  const projectUrl = projectFilter !== 'all'
    ? `/orgs/${org.selected.id}/projects/${projectFilter}/applications?status=APPROVED`
    : null;

  const { data: contributors, isLoading } = useAppSWR(projectUrl);

  const projects = projectsResult?.data || [];
  const contributorList = contributors?.data || [];

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Contributors</h1>
          <p className='text-gray-500'>View approved contributors across your projects.</p>
        </div>
      </div>

      <div className='flex gap-3 mb-6'>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className='w-64'>
            <SelectValue placeholder='Select a project' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Select a project...</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {projectFilter === 'all' ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <Users className='h-12 w-12 mx-auto text-gray-300 mb-3' />
            <p className='text-gray-500'>Select a project to view its contributors.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : contributorList.length > 0 ? (
        <div className='space-y-2'>
          {contributorList.map((app) => {
            const profile = app.user?.profile;
            const name = profile
              ? `${profile.firstName} ${profile.lastName}`
              : app.user?.address?.slice(0, 10) + '...';
            const tier = app.user?.tier || 'NEW';
            const tierCfg = TIER_CONFIG[tier];

            return (
              <Card key={app.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium'>
                        {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className='font-medium'>{name}</p>
                        <p className='text-xs text-gray-500'>
                          Joined {dayjs(app.createdAt).format('MMM D, YYYY')}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${tierCfg.color}`}>
                      {tier}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className='p-8 text-center'>
            <p className='text-sm text-gray-400'>No approved contributors for this project yet.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
