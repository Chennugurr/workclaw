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
  NEW: 'bg-white/[0.06] text-white/60 border-white/10',
  VERIFIED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  SKILLED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  TRUSTED: 'bg-green-500/10 text-green-400 border-green-500/20',
  EXPERT: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ELITE_REVIEWER: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
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
        <h1 className='text-2xl font-bold mb-2 text-white'>Welcome to HumanLayer</h1>
        <p className='text-white/40 mb-8'>
          Let&apos;s set up your contributor profile so you can start earning.
        </p>
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <>
      <h1 className='text-2xl font-bold mb-2 text-white'>
        Welcome back, {user.profile?.firstName || 'Contributor'}
      </h1>
      <p className='text-white/40 mb-6'>
        Here&apos;s your activity overview and available opportunities.
      </p>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card className='bg-white/[0.03] border-white/[0.08] backdrop-blur-xl'>
          <CardContent className='p-5'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-white/40'>Total Earnings</p>
                <p className='text-2xl font-bold mt-1 text-white'>
                  ${(overview.totalEarnings || 0).toFixed(2)}
                </p>
                <p className='text-xs text-white/25 mt-1'>Lifetime</p>
              </div>
              <div className='bg-green-500/10 p-2 rounded-lg'>
                <DollarSign className='h-5 w-5 text-green-400' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white/[0.03] border-white/[0.08] backdrop-blur-xl'>
          <CardContent className='p-5'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-white/40'>Tasks Approved</p>
                <p className='text-2xl font-bold mt-1 text-white'>{overview.approvedSubmissions || 0}</p>
                <p className='text-xs text-white/25 mt-1'>
                  of {overview.totalSubmissions || 0} submitted
                </p>
              </div>
              <div className='bg-cyan-500/10 p-2 rounded-lg'>
                <ClipboardList className='h-5 w-5 text-cyan-400' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white/[0.03] border-white/[0.08] backdrop-blur-xl'>
          <CardContent className='p-5'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-white/40'>Acceptance Rate</p>
                <p className='text-2xl font-bold mt-1 text-white'>
                  {overview.totalSubmissions > 0
                    ? `${(overview.acceptanceRate * 100).toFixed(0)}%`
                    : '--'}
                </p>
                <p className='text-xs text-white/25 mt-1'>Approval rate</p>
              </div>
              <div className='bg-purple-500/10 p-2 rounded-lg'>
                <TrendingUp className='h-5 w-5 text-purple-400' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white/[0.03] border-white/[0.08] backdrop-blur-xl'>
          <CardContent className='p-5'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-white/40'>Contributor Level</p>
                <Badge className={`mt-1 ${TIER_COLORS[tier]} border`}>
                  {TIER_LABELS[tier]}
                </Badge>
              </div>
              <div className='bg-orange-500/10 p-2 rounded-lg'>
                <Star className='h-5 w-5 text-orange-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Earnings Chart */}
      {analytics?.dailyEarnings && Object.keys(analytics.dailyEarnings).length > 0 && (
        <Card className='mb-6 bg-white/[0.03] border-white/[0.08] backdrop-blur-xl'>
          <CardContent className='p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2 text-white'>
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
                      className='w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t min-w-[4px] opacity-80'
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className='flex justify-between text-xs text-white/25 mt-2'>
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-Project Quality Scores */}
      {analytics?.projectScores?.length > 0 && (
        <Card className='mb-6 bg-white/[0.03] border-white/[0.08] backdrop-blur-xl'>
          <CardContent className='p-6'>
            <h2 className='text-lg font-semibold mb-4 text-white'>Project Quality Scores</h2>
            <div className='space-y-4'>
              {analytics.projectScores.map((ps) => (
                <div key={ps.projectId} className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='font-medium text-white/80'>{ps.projectTitle}</span>
                    <span className='text-white/40'>{(ps.overallScore * 100).toFixed(0)}% overall</span>
                  </div>
                  <Progress value={ps.overallScore * 100} className='h-2' />
                  <div className='flex gap-4 text-xs text-white/30'>
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
        <Card className='mb-6 bg-white/[0.03] border-cyan-500/20 backdrop-blur-xl'>
          <CardContent className='p-6'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <h2 className='text-lg font-semibold text-white'>Get started</h2>
                <p className='text-sm text-white/40'>Complete these steps to unlock paid work.</p>
              </div>
              <Badge variant='outline' className='border-white/20 text-white/60'>{completedSteps} of 3</Badge>
            </div>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className={`h-6 w-6 rounded-full ${hasProfile ? 'bg-green-500/10' : 'bg-white/[0.04]'} flex items-center justify-center`}>
                  <Shield className={`h-3.5 w-3.5 ${hasProfile ? 'text-green-400' : 'text-white/30'}`} />
                </div>
                {hasProfile ? (
                  <span className='text-sm line-through text-white/25'>Create your profile</span>
                ) : (
                  <span className='text-sm text-white/70'>Create your profile</span>
                )}
              </div>
              <div className='flex items-center gap-3'>
                <div className={`h-6 w-6 rounded-full ${hasPassedScreening ? 'bg-green-500/10' : 'bg-white/[0.04]'} flex items-center justify-center`}>
                  <GraduationCap className={`h-3.5 w-3.5 ${hasPassedScreening ? 'text-green-400' : 'text-white/30'}`} />
                </div>
                {hasPassedScreening ? (
                  <span className='text-sm line-through text-white/25'>Pass your first screening test</span>
                ) : (
                  <>
                    <Link href='/app/contributor/screenings' className='text-sm text-white/70 hover:text-white hover:underline'>
                      Pass your first screening test
                    </Link>
                    <ArrowRight className='h-3.5 w-3.5 text-white/30' />
                  </>
                )}
              </div>
              <div className='flex items-center gap-3'>
                <div className={`h-6 w-6 rounded-full ${hasCompletedTask ? 'bg-green-500/10' : 'bg-white/[0.04]'} flex items-center justify-center`}>
                  <Zap className={`h-3.5 w-3.5 ${hasCompletedTask ? 'text-green-400' : 'text-white/30'}`} />
                </div>
                {hasCompletedTask ? (
                  <span className='text-sm line-through text-white/25'>Complete your first task</span>
                ) : (
                  <span className='text-sm text-white/40'>Complete your first task</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <Card className='bg-white/[0.03] border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/[0.15] transition-all'>
          <Link href='/app/contributor/opportunities'>
            <CardContent className='p-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='bg-cyan-500/10 p-3 rounded-lg'>
                  <Target className='h-6 w-6 text-cyan-400' />
                </div>
                <div>
                  <h3 className='font-semibold text-white'>Browse Opportunities</h3>
                  <p className='text-sm text-white/40'>Find projects matching your skills</p>
                </div>
              </div>
              <ChevronRight className='h-5 w-5 text-white/20' />
            </CardContent>
          </Link>
        </Card>
        <Card className='bg-white/[0.03] border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/[0.15] transition-all'>
          <Link href='/app/contributor/screenings'>
            <CardContent className='p-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='bg-purple-500/10 p-3 rounded-lg'>
                  <GraduationCap className='h-6 w-6 text-purple-400' />
                </div>
                <div>
                  <h3 className='font-semibold text-white'>Take Screenings</h3>
                  <p className='text-sm text-white/40'>Prove your expertise, unlock better work</p>
                </div>
              </div>
              <ChevronRight className='h-5 w-5 text-white/20' />
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Empty State for Tasks */}
      {(!overview.totalSubmissions || overview.totalSubmissions === 0) && (
        <Card className='bg-white/[0.03] border-white/[0.08] backdrop-blur-xl'>
          <CardContent className='p-8 text-center'>
            <ClipboardList className='h-12 w-12 text-white/15 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-white/70 mb-2'>No active tasks yet</h3>
            <p className='text-sm text-white/35 mb-4 max-w-md mx-auto'>
              Pass a screening test and apply to a project to start receiving tasks.
              Your completed tasks and earnings will show up here.
            </p>
            <Button asChild className='bg-white text-black hover:bg-white/90'>
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
