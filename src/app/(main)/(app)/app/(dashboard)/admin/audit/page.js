'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { FileText, Filter } from 'lucide-react';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ACTION_COLORS = {
  USER_UPDATE: 'bg-blue-100 text-blue-700',
  PROJECT_UPDATE: 'bg-green-100 text-green-700',
  PAYOUT_UPDATE: 'bg-yellow-100 text-yellow-700',
  FRAUD_FLAG_UPDATE: 'bg-red-100 text-red-700',
  ANNOUNCEMENT_CREATE: 'bg-purple-100 text-purple-700',
};

const ACTIONS = [
  'USER_UPDATE',
  'PROJECT_UPDATE',
  'PAYOUT_UPDATE',
  'FRAUD_FLAG_UPDATE',
  'ANNOUNCEMENT_CREATE',
];

export default function Page() {
  const [actionFilter, setActionFilter] = useState('all');

  const query = actionFilter !== 'all' ? `?action=${actionFilter}` : '';
  const { data: result, isLoading } = useAppSWR(`/admin/audit${query}`);
  const logs = result?.data || [];

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Audit Log</h1>

      <div className='mb-6'>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className='w-56'>
            <SelectValue placeholder='Filter by action' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Actions</SelectItem>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className='h-12 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : logs.length > 0 ? (
        <div className='space-y-1'>
          {logs.map((log) => {
            const color = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700';
            return (
              <Card key={log.id}>
                <CardContent className='p-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <FileText className='h-4 w-4 text-gray-400 shrink-0' />
                      <div>
                        <div className='flex items-center gap-2'>
                          <Badge className={`text-xs ${color}`}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                          <span className='text-sm'>{log.target} #{log.targetId.slice(0, 8)}</span>
                        </div>
                        <div className='text-xs text-gray-400 mt-0.5'>
                          by {log.actorId.slice(0, 8)}... at {dayjs(log.createdAt).format('MMM D, YYYY h:mm A')}
                          {log.details && (
                            <span className='ml-2 text-gray-500'>
                              {JSON.stringify(log.details).slice(0, 80)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className='p-8 text-center'>
            <FileText className='h-12 w-12 mx-auto text-gray-300 mb-3' />
            <p className='text-gray-500'>No audit log entries found.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
