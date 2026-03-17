'use client';

import {
  Users,
  FolderKanban,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Shield,
} from 'lucide-react';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  const { data: stats, isLoading } = useAppSWR('/admin/stats');

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-24 bg-gray-100 rounded-lg animate-pulse' />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p className='text-gray-500'>Unable to load admin dashboard.</p>;
  }

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Admin Dashboard</h1>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <StatCard icon={Users} iconColor='text-blue-600' bg='bg-blue-50' label='Total Users' value={stats.users.total} />
        <StatCard icon={FolderKanban} iconColor='text-green-600' bg='bg-green-50' label='Active Projects' value={stats.projects.active} sub={`${stats.projects.total} total`} />
        <StatCard icon={ClipboardList} iconColor='text-purple-600' bg='bg-purple-50' label='Tasks Completed' value={stats.tasks.completed} sub={`${stats.tasks.total} total`} />
        <StatCard icon={DollarSign} iconColor='text-yellow-600' bg='bg-yellow-50' label='Total Paid' value={`$${stats.payouts.totalPaid.toFixed(2)}`} />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        {/* Pending Payouts */}
        <Card>
          <CardContent className='p-5'>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <DollarSign className='h-4 w-4' /> Payouts
            </h3>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold'>{stats.payouts.pending}</p>
                <p className='text-xs text-gray-500'>Pending payouts</p>
              </div>
              {stats.payouts.pending > 0 && (
                <Badge className='bg-yellow-100 text-yellow-700'>Needs attention</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fraud Flags */}
        <Card>
          <CardContent className='p-5'>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4' /> Fraud Flags
            </h3>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold'>{stats.fraud.openFlags}</p>
                <p className='text-xs text-gray-500'>Open flags</p>
              </div>
              {stats.fraud.openFlags > 0 && (
                <Badge className='bg-red-100 text-red-700'>Review required</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardContent className='p-5'>
            <h3 className='font-semibold mb-3'>Users by Tier</h3>
            <div className='space-y-2'>
              {Object.entries(stats.users.byTier || {}).map(([tier, count]) => (
                <div key={tier} className='flex items-center justify-between py-1'>
                  <span className='text-sm'>{tier}</span>
                  <span className='text-sm font-medium'>{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-5'>
            <h3 className='font-semibold mb-3'>Users by Role</h3>
            <div className='space-y-2'>
              {Object.entries(stats.users.byRole || {}).map(([role, count]) => (
                <div key={role} className='flex items-center justify-between py-1'>
                  <span className='text-sm'>{role}</span>
                  <span className='text-sm font-medium'>{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, iconColor, bg, label, value, sub }) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs text-gray-500'>{label}</p>
            <p className='text-xl font-bold mt-1'>{value}</p>
            {sub && <p className='text-xs text-gray-400'>{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${bg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
