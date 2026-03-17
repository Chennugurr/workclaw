'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Bell,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Shield,
  TrendingUp,
  Megaphone,
  ClipboardList,
  Check,
} from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

dayjs.extend(relativeTime);

const TYPE_ICONS = {
  APPLICATION_APPROVED: CheckCircle2,
  APPLICATION_REJECTED: AlertTriangle,
  TASK_ASSIGNED: ClipboardList,
  REVIEW_COMPLETED: CheckCircle2,
  PAYOUT_APPROVED: DollarSign,
  PAYOUT_COMPLETED: DollarSign,
  TIER_UPGRADE: TrendingUp,
  BADGE_EARNED: Shield,
  FRAUD_WARNING: AlertTriangle,
  ANNOUNCEMENT: Megaphone,
};

const TYPE_COLORS = {
  APPLICATION_APPROVED: 'text-green-600',
  APPLICATION_REJECTED: 'text-red-500',
  TASK_ASSIGNED: 'text-blue-600',
  REVIEW_COMPLETED: 'text-green-600',
  PAYOUT_APPROVED: 'text-yellow-600',
  PAYOUT_COMPLETED: 'text-green-600',
  TIER_UPGRADE: 'text-purple-600',
  BADGE_EARNED: 'text-blue-600',
  FRAUD_WARNING: 'text-red-600',
  ANNOUNCEMENT: 'text-blue-500',
};

export default function Page() {
  const { data: result, isLoading, mutate } = useAppSWR('/notifications?limit=50');
  const notifications = result?.data || [];
  const unreadCount = result?.unreadCount || 0;

  const markAllRead = async () => {
    try {
      await axios.post('/notifications/read', { all: true });
      mutate();
    } catch {}
  };

  const markRead = async (ids) => {
    try {
      await axios.post('/notifications/read', { notificationIds: ids });
      mutate();
    } catch {}
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='h-8 bg-gray-200 rounded w-48 animate-pulse' />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='h-16 bg-gray-100 rounded animate-pulse' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Notifications</h1>
          <p className='text-gray-500'>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant='outline' size='sm' onClick={markAllRead}>
            <Check className='h-3.5 w-3.5 mr-1' /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <Card>
          <CardContent className='p-0'>
            {notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              const color = TYPE_COLORS[n.type] || 'text-gray-500';
              return (
                <div
                  key={n.id}
                  className={`px-5 py-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 ${
                    !n.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => { if (!n.read) markRead([n.id]); }}
                >
                  <div className='flex gap-3'>
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${color}`} />
                    <div className='flex-1 min-w-0'>
                      <p className={`text-sm ${!n.read ? 'font-medium' : ''}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className='text-sm text-gray-500 mt-0.5'>
                          {n.body}
                        </p>
                      )}
                      <p className='text-xs text-gray-400 mt-1'>
                        {dayjs(n.createdAt).fromNow()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className='h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0' />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <Bell className='h-12 w-12 mx-auto text-gray-300 mb-3' />
            <p className='text-gray-500'>No notifications yet.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
