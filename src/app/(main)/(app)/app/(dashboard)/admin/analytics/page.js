'use client';

import {
  DollarSign,
  Users,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  FolderKanban,
  BarChart3,
  CreditCard,
} from 'lucide-react';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const TIER_LABELS = {
  NEW: 'New',
  VERIFIED: 'Verified',
  SKILLED: 'Skilled',
  TRUSTED: 'Trusted',
  EXPERT: 'Expert',
  ELITE_REVIEWER: 'Elite',
};

const TIER_COLORS = {
  NEW: 'bg-gray-200',
  VERIFIED: 'bg-blue-400',
  SKILLED: 'bg-purple-400',
  TRUSTED: 'bg-green-400',
  EXPERT: 'bg-orange-400',
  ELITE_REVIEWER: 'bg-yellow-400',
};

export default function Page() {
  const { data, isLoading } = useAppSWR('/admin/analytics');

  if (isLoading || !data) {
    return (
      <div className='space-y-4'>
        <div className='h-8 bg-gray-200 rounded w-48 animate-pulse' />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-28 bg-gray-100 rounded animate-pulse' />
          ))}
        </div>
      </div>
    );
  }

  const totalTierUsers = Object.values(data.usersByTier || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Platform Analytics</h1>
        <p className='text-gray-500'>Comprehensive platform performance overview.</p>
      </div>

      {/* Top-line Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <MetricCard
          icon={DollarSign}
          iconBg='bg-green-50'
          iconColor='text-green-600'
          label='Total GMV'
          value={`$${data.gmv.total.toFixed(2)}`}
          sub={`$${data.gmv.last30Days.toFixed(2)} last 30d`}
        />
        <MetricCard
          icon={CreditCard}
          iconBg='bg-blue-50'
          iconColor='text-blue-600'
          label='Total Paid Out'
          value={`$${data.payouts.totalPaid.toFixed(2)}`}
          sub={`$${data.payouts.outstandingLiability.toFixed(2)} outstanding`}
        />
        <MetricCard
          icon={Users}
          iconBg='bg-purple-50'
          iconColor='text-purple-600'
          label='Contributors'
          value={data.contributors.total}
          sub={`${data.contributors.activeLast30Days} active (30d)`}
        />
        <MetricCard
          icon={FolderKanban}
          iconBg='bg-orange-50'
          iconColor='text-orange-600'
          label='Projects'
          value={data.projects.total}
          sub={`${data.projects.active} active`}
        />
      </div>

      {/* Second Row */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <MetricCard
          icon={ClipboardList}
          iconBg='bg-gray-50'
          iconColor='text-gray-600'
          label='Tasks'
          value={data.tasks.total}
          sub={`${data.tasks.completed} completed`}
        />
        <MetricCard
          icon={BarChart3}
          iconBg='bg-blue-50'
          iconColor='text-blue-600'
          label='Submissions (30d)'
          value={data.submissions.last30Days}
          sub={`${data.submissions.total} total`}
        />
        <MetricCard
          icon={TrendingUp}
          iconBg='bg-green-50'
          iconColor='text-green-600'
          label='Acceptance Rate'
          value={`${(data.submissions.acceptanceRate * 100).toFixed(1)}%`}
          sub={`${data.submissions.approved} approved`}
        />
        <MetricCard
          icon={AlertTriangle}
          iconBg='bg-red-50'
          iconColor='text-red-600'
          label='Fraud Flags'
          value={data.fraud.openFlags}
          sub={`${data.fraud.confirmedFlags} confirmed`}
        />
      </div>

      {/* Submissions Chart */}
      {data.dailySubmissions && Object.keys(data.dailySubmissions).length > 0 && (
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Daily Submissions — Last 30 Days
            </h2>
            <div className='flex items-end gap-1 h-40'>
              {getLast30Days().map((day) => {
                const count = data.dailySubmissions[day] || 0;
                const maxVal = Math.max(...Object.values(data.dailySubmissions), 1);
                const height = count > 0 ? Math.max(4, (count / maxVal) * 100) : 0;
                return (
                  <div
                    key={day}
                    className='flex-1 flex flex-col items-center justify-end'
                    title={`${day}: ${count} submissions`}
                  >
                    <div
                      className='w-full bg-blue-500 rounded-t min-w-[4px]'
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className='flex justify-between text-xs text-gray-400 mt-2'>
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contributor Tier Distribution */}
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>Contributor Tier Distribution</h2>
          <div className='space-y-3'>
            {Object.entries(TIER_LABELS).map(([tier, label]) => {
              const count = data.usersByTier?.[tier] || 0;
              const pct = (count / totalTierUsers) * 100;
              return (
                <div key={tier} className='flex items-center gap-3'>
                  <span className='text-sm font-medium w-20'>{label}</span>
                  <div className='flex-1'>
                    <div className='w-full bg-gray-100 rounded-full h-3'>
                      <div
                        className={`h-3 rounded-full ${TIER_COLORS[tier]}`}
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                  <span className='text-sm text-gray-500 w-16 text-right'>
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payout Liability */}
      <Card>
        <CardContent className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>Payout Summary</h2>
          <div className='grid grid-cols-3 gap-6'>
            <div>
              <p className='text-sm text-gray-500'>Total Earned (GMV)</p>
              <p className='text-2xl font-bold text-gray-900'>
                ${data.gmv.total.toFixed(2)}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Total Paid Out</p>
              <p className='text-2xl font-bold text-green-600'>
                ${data.payouts.totalPaid.toFixed(2)}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Outstanding Liability</p>
              <p className='text-2xl font-bold text-orange-600'>
                ${data.payouts.outstandingLiability.toFixed(2)}
              </p>
            </div>
          </div>
          {data.gmv.total > 0 && (
            <div className='mt-4'>
              <div className='flex justify-between text-xs text-gray-500 mb-1'>
                <span>Payout Progress</span>
                <span>{((data.payouts.totalPaid / data.gmv.total) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(data.payouts.totalPaid / data.gmv.total) * 100} className='h-2' />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function MetricCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-xs text-gray-500'>{label}</p>
            <p className='text-xl font-bold mt-1'>{value}</p>
            {sub && <p className='text-xs text-gray-400 mt-1'>{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getLast30Days() {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
