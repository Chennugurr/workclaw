'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  MoreHorizontal,
  Shield,
} from 'lucide-react';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  SUSPENDED: { label: 'Suspended', color: 'bg-gray-100 text-gray-600', icon: Ban },
};

const TIER_COLORS = {
  NEW: 'text-gray-500',
  VERIFIED: 'text-blue-500',
  SKILLED: 'text-green-500',
  TRUSTED: 'text-purple-500',
  EXPERT: 'text-orange-500',
  ELITE_REVIEWER: 'text-red-500',
};

export default function PageContent({ params }) {
  const { organization: org } = useAppState();
  const [tab, setTab] = useState('PENDING');

  const { data: applications, isLoading, mutate } = useAppSWR(
    org?.selected?.id
      ? `/orgs/${org.selected.id}/projects/${params.id}/applications?status=${tab}`
      : null
  );

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const res = await axios.patch(
        `/orgs/${org.selected.id}/projects/${params.id}/applications/${applicationId}/status`,
        { status: newStatus }
      );
      if (res.data.status === 'success') {
        toast.success(`Application ${newStatus.toLowerCase()}`);
        mutate();
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to update');
    }
  };

  const appList = applications?.data || applications || [];

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Applications</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <TabsTrigger key={key} value={key}>{cfg.label}</TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(STATUS_CONFIG).map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <div className='space-y-3 mt-4'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='h-20 bg-gray-100 rounded-lg animate-pulse' />
                ))}
              </div>
            ) : appList.length > 0 ? (
              <div className='space-y-3 mt-4'>
                {appList.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    currentStatus={status}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-400 text-center py-8 mt-4'>
                No {STATUS_CONFIG[status].label.toLowerCase()} applications.
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

function ApplicationCard({ application, currentStatus, onStatusChange }) {
  const profile = application.user?.profile;
  const name = profile
    ? `${profile.firstName} ${profile.lastName}`
    : application.user?.address?.slice(0, 8) + '...';
  const tier = application.user?.tier || 'NEW';
  const statusCfg = STATUS_CONFIG[application.status];
  const StatusIcon = statusCfg?.icon || Clock;

  const availableActions = [];
  if (currentStatus === 'PENDING') {
    availableActions.push({ label: 'Approve', status: 'APPROVED' });
    availableActions.push({ label: 'Reject', status: 'REJECTED' });
  } else if (currentStatus === 'APPROVED') {
    availableActions.push({ label: 'Suspend', status: 'SUSPENDED' });
  } else if (currentStatus === 'REJECTED' || currentStatus === 'SUSPENDED') {
    availableActions.push({ label: 'Approve', status: 'APPROVED' });
  }

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium'>
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </div>
            <div>
              <p className='font-medium'>{name}</p>
              <div className='flex items-center gap-2 text-xs text-gray-500'>
                <span className={TIER_COLORS[tier]}>
                  <Shield className='h-3 w-3 inline mr-0.5' />
                  {tier}
                </span>
                <span>Applied {dayjs(application.createdAt).format('MMM D, YYYY')}</span>
              </div>
              {application.note && (
                <p className='text-xs text-gray-400 mt-1 line-clamp-1'>{application.note}</p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Badge className={`text-xs ${statusCfg.color}`}>
              <StatusIcon className='h-3 w-3 mr-1' />
              {statusCfg.label}
            </Badge>

            {availableActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {availableActions.map((action) => (
                    <DropdownMenuItem
                      key={action.status}
                      onClick={() => onStatusChange(application.id, action.status)}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
