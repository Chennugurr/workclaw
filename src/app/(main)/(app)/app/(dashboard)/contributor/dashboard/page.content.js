'use client';

import Link from 'next/link';
import {
  Target,
  ClipboardList,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Star,
  ChevronRight,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
} from 'lucide-react';
import { useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import OnboardingWizard from '@/components/onboarding-wizard';

const TIER_LABELS = {
  NEW: 'New',
  VERIFIED: 'Verified',
  SKILLED: 'Skilled',
  TRUSTED: 'Trusted',
  EXPERT: 'Expert',
  ELITE_REVIEWER: 'Elite Reviewer',
};

const TIER_COLORS = {
  NEW: 'bg-gray-100 text-gray-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  SKILLED: 'bg-purple-100 text-purple-700',
  TRUSTED: 'bg-green-100 text-green-700',
  EXPERT: 'bg-orange-100 text-orange-700',
  ELITE_REVIEWER: 'bg-yellow-100 text-yellow-700',
};

export default function PageContent() {
  const user = useAppState((s) => s.user);
  const tier = user?.tier || 'NEW';
  const onboardingComplete = user?.onboardingComplete;

  const { data: analytics } = useAppSWR(
    user?.id ? `/contributors/${user.id}/analytics` : null
  );
  const { data: screenings } = useAppSWR('/screenings');

  const overview = analytics?.overview || {};

  // Compute onboarding checklist state
  const hasProfile = !!user?.profile;
  const hasPassedScreening = screenings?.some((s) =>
    s.attempts?.some((a) => a.passed === true)
  );
  const hasCompletedTask = (overview.totalSubmissions || 0) > 0;
  const completedSteps = [hasProfile, hasPassedScreening, hasCompletedTask].filter(Boolean).length;

  // Show onboarding wizard if not complete
  if (!onboardingComplete && !user?.profile) {
    return (
      <div>
        <h1 className='text-2xl font-bold mb-2'>Welcome to HumanLayer</h1>
        <p className='text-gray-500 mb-8'>
          Let&apos;s set up your contributor profile so you can start earning.
        </p>
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <>
      <h1 className='text-2xl font-bold mb-2'>
        Welcome back, {user.profile?.firstName || 'Contributor'}
      </h1>
      <p className='text-gray-500 mb-6'>
        Here&apos;s your activity overview and available opportunities.
      </p>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-5'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-gray-500'>Total Earnings</p>
                <p className='text-2xl font-bold mt-1'>
                  ${(overview.totalEarnings || 0).toFixed(2)}
                </p>
                <p className='text-xs text-gray-400 mt-1'>Lifetime</p>
              </div>
              <div className='bg-green-50 p-2 rounded-lg'>
                <DollarSign className='h-5 w-5 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-5'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-gray-500'>Tasks Approved</p>
                <p className='text-2xl font-bold mt-1'>{overview.approvedSubmissions || 0}</p>
                <p className='text-xs text-gray-400 mt-1'>
                  of {overview.totalSubmissions || 0} submitted
                </p>
              </div>
              <div className='bg-blue-50 p-2 rounded-lg'>
                <ClipboardList className='h-5 w-5 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-5'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-gray-500'>Acceptance Rate</p>
                <p className='text-2xl font-bold mt-1'>
                  {overview.totalSubmissions > 0
                    ? `${(overview.acceptanceRate * 100).toFixed(0)}%`
                    : '--'}
                </p>
                <p className='text-xs text-gray-400 mt-1'>Approval rate</p>
              </div>
              <div className='bg-purple-50 p-2 rounded-lg'>
                <TrendingUp className='h-5 w-5 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-5'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-gray-500'>Contributor Level</p>
                <Badge className={`mt-1 ${TIER_COLORS[tier]}`}>
                  {TIER_LABELS[tier]}
                </Badge>
              </div>
              <div className='bg-orange-50 p-2 rounded-lg'>
                <Star className='h-5 w-5 text-orange-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Earnings Chart */}
      {analytics?.dailyEarnings && Object.keys(analytics.dailyEarnings).length > 0 && (
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Earnings — Last 30 Days
            </h2>
            <div className='flex items-end gap-1 h-32'>
              {getLast30Days().map((day) => {
                const amount = analytics.dailyEarnings[day] || 0;
                const maxVal = Math.max(...Object.values(analytics.dailyEarnings), 1);
                const height = amount > 0 ? Math.max(4, (amount / maxVal) * 100) : 0;
                return (
                  <div key={day} className='flex-1 flex flex-col items-center justify-end' title={`${day}: $${amount.toFixed(2)}`}>
                    <div
                      className='w-full bg-green-500 rounded-t min-w-[4px]'
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

      {/* Per-Project Quality Scores */}
      {analytics?.projectScores?.length > 0 && (
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <h2 className='text-lg font-semibold mb-4'>Project Quality Scores</h2>
            <div className='space-y-4'>
              {analytics.projectScores.map((ps) => (
                <div key={ps.projectId} className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='font-medium'>{ps.projectTitle}</span>
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

      {/* Onboarding Progress (if new user) */}
      {tier === 'NEW' && completedSteps < 3 && (
        <Card className='mb-6 border-gray-900'>
          <CardContent className='p-6'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <h2 className='text-lg font-semibold'>Get started</h2>
                <p className='text-sm text-gray-500'>Complete these steps to unlock paid work.</p>
              </div>
              <Badge variant='outline'>{completedSteps} of 3</Badge>
            </div>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className={`h-6 w-6 rounded-full ${hasProfile ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <Shield className={`h-3.5 w-3.5 ${hasProfile ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                {hasProfile ? (
                  <span className='text-sm line-through text-gray-400'>Create your profile</span>
                ) : (
                  <span className='text-sm text-gray-900'>Create your profile</span>
                )}
              </div>
              <div className='flex items-center gap-3'>
                <div className={`h-6 w-6 rounded-full ${hasPassedScreening ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <GraduationCap className={`h-3.5 w-3.5 ${hasPassedScreening ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                {hasPassedScreening ? (
                  <span className='text-sm line-through text-gray-400'>Pass your first screening test</span>
                ) : (
                  <>
                    <Link href='/app/contributor/screenings' className='text-sm text-gray-900 hover:underline'>
                      Pass your first screening test
                    </Link>
                    <ArrowRight className='h-3.5 w-3.5 text-gray-400' />
                  </>
                )}
              </div>
              <div className='flex items-center gap-3'>
                <div className={`h-6 w-6 rounded-full ${hasCompletedTask ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <Zap className={`h-3.5 w-3.5 ${hasCompletedTask ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                {hasCompletedTask ? (
                  <span className='text-sm line-through text-gray-400'>Complete your first task</span>
                ) : (
                  <span className='text-sm text-gray-500'>Complete your first task</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <Card className='hover:shadow-md transition-shadow'>
          <Link href='/app/contributor/opportunities'>
            <CardContent className='p-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='bg-gray-100 p-3 rounded-lg'>
                  <Target className='h-6 w-6 text-gray-700' />
                </div>
                <div>
                  <h3 className='font-semibold'>Browse Opportunities</h3>
                  <p className='text-sm text-gray-500'>Find projects matching your skills</p>
                </div>
              </div>
              <ChevronRight className='h-5 w-5 text-gray-400' />
            </CardContent>
          </Link>
        </Card>
        <Card className='hover:shadow-md transition-shadow'>
          <Link href='/app/contributor/screenings'>
            <CardContent className='p-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='bg-gray-100 p-3 rounded-lg'>
                  <GraduationCap className='h-6 w-6 text-gray-700' />
                </div>
                <div>
                  <h3 className='font-semibold'>Take Screenings</h3>
                  <p className='text-sm text-gray-500'>Prove your expertise, unlock better work</p>
                </div>
              </div>
              <ChevronRight className='h-5 w-5 text-gray-400' />
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Empty State for Tasks */}
      {(!overview.totalSubmissions || overview.totalSubmissions === 0) && (
        <Card>
          <CardContent className='p-8 text-center'>
            <ClipboardList className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>No active tasks yet</h3>
            <p className='text-sm text-gray-500 mb-4 max-w-md mx-auto'>
              Pass a screening test and apply to a project to start receiving tasks.
              Your completed tasks and earnings will show up here.
            </p>
            <Button asChild>
              <Link href='/app/contributor/opportunities'>
                Browse Opportunities
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
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
