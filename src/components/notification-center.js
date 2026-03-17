'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);

  const { data: result, mutate } = useAppSWR('/notifications?limit=20');
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-[90vw] sm:w-[400px] p-0'>
        <SheetHeader className='p-4 border-b'>
          <div className='flex items-center justify-between'>
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant='ghost' size='sm' onClick={markAllRead}>
                <Check className='h-3.5 w-3.5 mr-1' /> Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className='overflow-y-auto max-h-[calc(100vh-80px)]'>
          {notifications.length > 0 ? (
            <div>
              {notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                const color = TYPE_COLORS[n.type] || 'text-gray-500';

                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${
                      !n.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      if (!n.read) markRead([n.id]);
                    }}
                  >
                    <div className='flex gap-3'>
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                      <div className='flex-1 min-w-0'>
                        <p className={`text-sm ${!n.read ? 'font-medium' : ''}`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className='text-xs text-gray-500 mt-0.5 line-clamp-2'>
                            {n.body}
                          </p>
                        )}
                        <p className='text-xs text-gray-400 mt-1'>
                          {dayjs(n.createdAt).fromNow()}
                        </p>
                      </div>
                      {!n.read && (
                        <div className='h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0' />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='p-8 text-center'>
              <Bell className='h-8 w-8 mx-auto text-gray-300 mb-2' />
              <p className='text-sm text-gray-400'>No notifications yet.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
