'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Shield, Bell, Globe } from 'lucide-react';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland',
];

export default function PageContent() {
  const user = useAppState((s) => s.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timezone, setTimezone] = useState(user?.profile?.timezone || 'UTC');
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    reviewCompleted: true,
    payoutUpdates: true,
    tierUpgrade: true,
    announcements: true,
  });

  const toggleNotif = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    setIsSubmitting(true);
    try {
      await axios.patch(`/users/${user.id}/profile`, {
        timezone,
        notificationPreferences: notifications,
      });
      toast.success('Account preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-8'>
      <section>
        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
          <Globe className='h-5 w-5' />
          Regional Settings
        </h2>
        <Card>
          <CardContent className='p-5 space-y-4'>
            <div>
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className='mt-1 w-full max-w-sm'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-xs text-gray-500 mt-1'>
                Used for task deadlines and scheduling.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
          <Bell className='h-5 w-5' />
          Notification Preferences
        </h2>
        <Card>
          <CardContent className='p-5 space-y-4'>
            {[
              { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a new task is assigned to you' },
              { key: 'reviewCompleted', label: 'Review Completed', desc: 'When your submission is reviewed' },
              { key: 'payoutUpdates', label: 'Payout Updates', desc: 'Payout approvals and completions' },
              { key: 'tierUpgrade', label: 'Tier Upgrades', desc: 'When you reach a new contributor tier' },
              { key: 'announcements', label: 'Platform Announcements', desc: 'General platform updates' },
            ].map((item) => (
              <div key={item.key} className='flex items-center justify-between'>
                <div>
                  <Label>{item.label}</Label>
                  <p className='text-xs text-gray-500'>{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={() => toggleNotif(item.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          Security
        </h2>
        <Card>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Connected Wallet</p>
                <p className='text-sm text-gray-500 font-mono'>
                  {user?.address
                    ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
                    : 'No wallet connected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Button onClick={savePreferences} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
