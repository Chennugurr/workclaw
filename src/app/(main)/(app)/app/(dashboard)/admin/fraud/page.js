'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { AlertTriangle, MoreHorizontal, Shield, Eye } from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-red-100 text-red-700' },
  INVESTIGATING: { label: 'Investigating', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-red-100 text-red-800' },
  DISMISSED: { label: 'Dismissed', color: 'bg-gray-100 text-gray-600' },
};

const SEVERITY_CONFIG = {
  LOW: { color: 'bg-blue-100 text-blue-700' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-700' },
  HIGH: { color: 'bg-orange-100 text-orange-700' },
  CRITICAL: { color: 'bg-red-100 text-red-700' },
};

export default function Page() {
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [severityFilter, setSeverityFilter] = useState('all');

  const query = [
    `status=${statusFilter}`,
    severityFilter !== 'all' ? `severity=${severityFilter}` : '',
  ].filter(Boolean).join('&');

  const { data: result, isLoading, mutate } = useAppSWR(`/admin/fraud?${query}`);
  const flags = result?.data || [];

  const handleStatusChange = async (flagId, status) => {
    try {
      const res = await axios.patch(`/admin/fraud/${flagId}`, { status });
      if (res.data.status === 'success') {
        toast.success(`Flag ${status.toLowerCase()}`);
        mutate();
      }
    } catch (error) {
      toast.error('Failed to update flag');
    }
  };

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Fraud & Integrity</h1>

      <div className='flex gap-3 mb-6'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Severity' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Severity</SelectItem>
            {Object.keys(SEVERITY_CONFIG).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : flags.length > 0 ? (
        <div className='space-y-2'>
          {flags.map((flag) => {
            const statusCfg = STATUS_CONFIG[flag.status] || STATUS_CONFIG.OPEN;
            const sevCfg = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.LOW;
            const profile = flag.user?.profile;
            const name = profile ? `${profile.firstName} ${profile.lastName}` : flag.user?.address?.slice(0, 10);

            return (
              <Card key={flag.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='flex items-center gap-2 mb-1'>
                        <AlertTriangle className='h-4 w-4 text-red-500' />
                        <p className='font-medium'>{flag.type}</p>
                        <Badge className={`text-xs ${sevCfg.color}`}>{flag.severity}</Badge>
                        <Badge className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</Badge>
                      </div>
                      <div className='flex items-center gap-3 text-xs text-gray-500'>
                        <span>{name}</span>
                        <span>Tier: {flag.user?.tier}</span>
                        <span>Integrity: {profile?.integrityScore?.toFixed(0)}</span>
                        <span>{dayjs(flag.createdAt).format('MMM D, YYYY h:mm A')}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        {flag.status === 'OPEN' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(flag.id, 'INVESTIGATING')}>
                            <Eye className='mr-2 h-4 w-4' /> Investigate
                          </DropdownMenuItem>
                        )}
                        {['OPEN', 'INVESTIGATING'].includes(flag.status) && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(flag.id, 'CONFIRMED')}>
                              <AlertTriangle className='mr-2 h-4 w-4' /> Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(flag.id, 'DISMISSED')}>
                              <Shield className='mr-2 h-4 w-4' /> Dismiss
                            </DropdownMenuItem>
                          </>
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
          <CardContent className='p-8 text-center'>
            <Shield className='h-12 w-12 mx-auto text-gray-300 mb-3' />
            <p className='text-gray-500'>No {STATUS_CONFIG[statusFilter]?.label.toLowerCase()} fraud flags.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
