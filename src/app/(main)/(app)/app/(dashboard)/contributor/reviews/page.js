'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Target,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react';
import { useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

dayjs.extend(relativeTime);

const TIER_LABELS = {
  NEW: 'New', VERIFIED: 'Verified', SKILLED: 'Skilled',
  TRUSTED: 'Trusted', EXPERT: 'Expert', ELITE_REVIEWER: 'Elite Reviewer',
};

const TIER_COLORS = {
  NEW: 'bg-gray-100 text-gray-700', VERIFIED: 'bg-blue-100 text-blue-700',
  SKILLED: 'bg-purple-100 text-purple-700', TRUSTED: 'bg-green-100 text-green-700',
  EXPERT: 'bg-orange-100 text-orange-700', ELITE_REVIEWER: 'bg-yellow-100 text-yellow-700',
};

const EVENT_CONFIG = {
  REVIEW_APPROVED: { label: 'Task Approved', icon: CheckCircle2, color: 'text-green-600' },
  REVIEW_REJECTED: { label: 'Task Rejected', icon: XCircle, color: 'text-red-500' },
  REVIEW_REVISION_REQUESTED: { label: 'Revision Requested', icon: AlertCircle, color: 'text-yellow-600' },
  GOLD_TASK_CORRECT: { label: 'Gold Task Correct', icon: Star, color: 'text-green-600' },
  GOLD_TASK_INCORRECT: { label: 'Gold Task Failed', icon: Star, color: 'text-red-500' },
  SPEED_ANOMALY: { label: 'Speed Warning', icon: Zap, color: 'text-orange-500' },
  TIER_UPGRADE: { label: 'Tier Upgrade', icon: Shield, color: 'text-purple-600' },
};

export default function Page() {
  const user = useAppState((s) => s.user);
  const { data, isLoading } = useAppSWR(
    user?.id ? `/contributors/${user.id}/scores` : null
  );

  if (isLoading || !data) {
    return (
      <div className='space-y-4'>
        <div className='h-8 bg-gray-200 rounded w-48 animate-pulse' />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-24 bg-gray-100 rounded animate-pulse' />
          ))}
        </div>
      </div>
    );
  }

  const { stats, projectScores, recentEvents, tier } = data;

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Quality & Reviews</h1>
          <p className='text-gray-500'>Track your performance and reputation.</p>
        </div>
        <Badge className={`text-sm ${TIER_COLORS[tier]}`}>
          <Star className='h-3.5 w-3.5 mr-1' />
          {TIER_LABELS[tier]}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <StatCard
          icon={CheckCircle2}
          iconBg='bg-green-50'
          iconColor='text-green-600'
          label='Approved'
          value={stats.totalApproved}
        />
        <StatCard
          icon={XCircle}
          iconBg='bg-red-50'
          iconColor='text-red-500'
          label='Rejected'
          value={stats.totalRejected}
        />
        <StatCard
          icon={TrendingUp}
          iconBg='bg-blue-50'
          iconColor='text-blue-600'
          label='Acceptance Rate'
          value={stats.totalSubmitted > 0 ? `${(stats.acceptanceRate * 100).toFixed(0)}%` : '--'}
        />
        <StatCard
          icon={Target}
          iconBg='bg-purple-50'
          iconColor='text-purple-600'
          label='Total Submitted'
          value={stats.totalSubmitted}
        />
      </div>

      {/* Score breakdown */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <ScoreCard label='Trust Score' value={data.trustScore} />
        <ScoreCard label='Reviewer Score' value={data.reviewerScore} />
        <ScoreCard label='Integrity Score' value={data.integrityScore / 100} />
      </div>

      {/* Per-Project Scores */}
      {projectScores.length > 0 && (
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Project Scores
            </h2>
            <div className='space-y-4'>
              {projectScores.map((ps) => (
                <div key={ps.id} className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='font-medium'>Project {ps.projectId?.slice(0, 8)}...</span>
                    <span className='text-gray-500'>{(ps.overallScore * 100).toFixed(0)}% overall</span>
                  </div>
                  <Progress value={ps.overallScore * 100} className='h-2' />
                  <div className='flex gap-4 text-xs text-gray-500'>
                    <span>Accept: {(ps.acceptanceRate * 100).toFixed(0)}%</span>
                    <span>Gold: {(ps.goldTaskAccuracy * 100).toFixed(0)}%</span>
                    <span>Speed: {(ps.speedScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reputation Events Timeline */}
      <Card>
        <CardContent className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>Recent Activity</h2>
          {recentEvents.length === 0 ? (
            <p className='text-sm text-gray-400'>No reputation events yet.</p>
          ) : (
            <div className='space-y-3'>
              {recentEvents.map((event) => {
                const cfg = EVENT_CONFIG[event.eventType] || {
                  label: event.eventType,
                  icon: AlertCircle,
                  color: 'text-gray-500',
                };
                const Icon = cfg.icon;
                return (
                  <div key={event.id} className='flex items-center gap-3 py-2 border-b last:border-0'>
                    <Icon className={`h-4 w-4 ${cfg.color} shrink-0`} />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium'>{cfg.label}</p>
                      <p className='text-xs text-gray-400'>{dayjs(event.createdAt).fromNow()}</p>
                    </div>
                    <span className={`text-sm font-medium ${event.scoreDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {event.scoreDelta >= 0 ? '+' : ''}{event.scoreDelta.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs text-gray-500'>{label}</p>
            <p className='text-xl font-bold mt-1'>{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreCard({ label, value }) {
  const pct = (value * 100).toFixed(0);
  return (
    <Card>
      <CardContent className='p-4'>
        <p className='text-xs text-gray-500 mb-2'>{label}</p>
        <div className='flex items-baseline gap-2'>
          <span className='text-2xl font-bold'>{value > 0 ? `${pct}%` : '--'}</span>
        </div>
        {value > 0 && <Progress value={value * 100} className='h-1.5 mt-2' />}
      </CardContent>
    </Card>
  );
}
