'use client';

import { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  AlertCircle,
  ChevronRight,
  Target,
  RotateCcw,
  Bot,
  FileSearch,
  Shield,
  BarChart3,
  Scale,
  BookOpen,
  Globe,
  Code,
  ImageIcon,
  FileText,
} from 'lucide-react';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

dayjs.extend(relativeTime);

const DOMAIN_ICONS = {
  'Solidity Knowledge': BookOpen,
  'DeFi Knowledge': BarChart3,
  'Scam Detection': Shield,
  'Prompt Evaluation': Bot,
  'Ranking Judgment': Scale,
  'Factuality Review': FileSearch,
  'Moderation Judgment': Scale,
  'Crypto Terminology': BookOpen,
  'Blockchain Security': Shield,
  'Multilingual Review': Globe,
  'Content Moderation': Shield,
  'Data Labeling QA': FileText,
  'Language Assessment': Globe,
  'Reasoning & Logic': BarChart3,
  'Code Review': Code,
  'Image Annotation QA': ImageIcon,
};

function getScreeningStatus(screening) {
  const attempts = screening.attempts || [];
  const passed = attempts.some((a) => a.passed === true);
  const pending = attempts.some((a) => a.passed === null);
  const failed = attempts.some((a) => a.passed === false) && !passed;
  const attemptsUsed = attempts.length;
  const attemptsLeft = screening.maxAttempts - attemptsUsed;
  const lastAttempt = attempts[0];

  // Check cooldown
  let cooldownEnds = null;
  if (lastAttempt && !passed && attemptsLeft > 0) {
    const cooldownMs = 24 * 60 * 60 * 1000;
    const lastTime = new Date(lastAttempt.createdAt).getTime();
    const endTime = lastTime + cooldownMs;
    if (Date.now() < endTime) {
      cooldownEnds = new Date(endTime);
    }
  }

  if (passed) return { type: 'passed', label: 'Passed', color: 'text-green-600', bgColor: 'bg-green-50' };
  if (pending) return { type: 'pending', label: 'Pending Review', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  if (failed && attemptsLeft <= 0) return { type: 'exhausted', label: 'No Retakes', color: 'text-red-600', bgColor: 'bg-red-50' };
  if (failed && cooldownEnds) return { type: 'cooldown', label: 'Cooldown', color: 'text-orange-600', bgColor: 'bg-orange-50', cooldownEnds };
  if (failed) return { type: 'retake', label: 'Retake Available', color: 'text-blue-600', bgColor: 'bg-blue-50', attemptsLeft };
  return { type: 'available', label: 'Not Started', color: 'text-gray-600', bgColor: 'bg-gray-50' };
}

function ScreeningCard({ screening }) {
  const status = getScreeningStatus(screening);
  const bestScore = screening.attempts?.reduce((best, a) => {
    if (a.score !== null && (best === null || a.score > best)) return a.score;
    return best;
  }, null);
  const DomainIcon = DOMAIN_ICONS[screening.domain] || FileText;

  const canStart = status.type === 'available' || status.type === 'retake';

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardContent className='p-5'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-start gap-3'>
            <div className='h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center mt-0.5'>
              <DomainIcon className='h-5 w-5 text-gray-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>{screening.title}</h3>
              <p className='text-sm text-gray-500 mt-0.5'>{screening.domain}</p>
            </div>
          </div>
          <StatusIcon status={status} />
        </div>

        {screening.description && (
          <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{screening.description}</p>
        )}

        <div className='flex flex-wrap gap-3 text-xs text-gray-500 mb-3'>
          <span className='flex items-center gap-1'>
            <Target className='h-3.5 w-3.5' />
            {screening.questionCount} questions
          </span>
          <span className='flex items-center gap-1'>
            <CheckCircle2 className='h-3.5 w-3.5' />
            {(screening.passingScore * 100).toFixed(0)}% to pass
          </span>
          {screening.timeLimitMins && (
            <span className='flex items-center gap-1'>
              <Clock className='h-3.5 w-3.5' />
              {screening.timeLimitMins} min
            </span>
          )}
          <span className='flex items-center gap-1'>
            <RotateCcw className='h-3.5 w-3.5' />
            {screening.maxAttempts} attempts max
          </span>
        </div>

        {bestScore !== null && (
          <div className='mb-3'>
            <div className='flex justify-between text-xs mb-1'>
              <span className='text-gray-500'>Best score</span>
              <span className='font-medium'>{(bestScore * 100).toFixed(0)}%</span>
            </div>
            <Progress value={bestScore * 100} className='h-1.5' />
          </div>
        )}

        <div className='flex items-center justify-between'>
          <Badge className={`text-xs ${status.bgColor} ${status.color} border-0`}>
            {status.label}
            {status.type === 'cooldown' && status.cooldownEnds && (
              <span className='ml-1'>· {dayjs(status.cooldownEnds).fromNow(true)} left</span>
            )}
            {status.type === 'retake' && (
              <span className='ml-1'>· {status.attemptsLeft} left</span>
            )}
          </Badge>

          {canStart ? (
            <Button asChild size='sm' variant={status.type === 'retake' ? 'outline' : 'default'}>
              <Link href={`/app/contributor/screenings/${screening.id}`}>
                {status.type === 'retake' ? 'Retake' : 'Start'}
                <ChevronRight className='h-3.5 w-3.5 ml-1' />
              </Link>
            </Button>
          ) : status.type === 'passed' ? (
            <Button asChild size='sm' variant='ghost'>
              <Link href={`/app/contributor/screenings/${screening.id}`}>
                View Results
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }) {
  switch (status.type) {
    case 'passed':
      return <CheckCircle2 className='h-5 w-5 text-green-500' />;
    case 'pending':
      return <AlertCircle className='h-5 w-5 text-yellow-500' />;
    case 'exhausted':
      return <XCircle className='h-5 w-5 text-red-400' />;
    case 'cooldown':
      return <Clock className='h-5 w-5 text-orange-400' />;
    default:
      return null;
  }
}

export default function Page() {
  const { data: screenings, isLoading } = useAppSWR('/screenings');

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-1'>Screenings</h1>
        <p className='text-gray-500'>
          Pass qualification tests to unlock projects and prove your expertise.
        </p>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className='p-5'>
                <div className='h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse' />
                <div className='h-4 bg-gray-100 rounded w-1/2 mb-4 animate-pulse' />
                <div className='h-3 bg-gray-100 rounded w-full mb-2 animate-pulse' />
                <div className='h-8 bg-gray-100 rounded w-24 animate-pulse' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : screenings && screenings.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {screenings.map((screening) => (
            <ScreeningCard key={screening.id} screening={screening} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <GraduationCap className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>No screenings available yet</h3>
            <p className='text-sm text-gray-500 max-w-md mx-auto'>
              Screening tests will be added as new projects launch. Check back soon.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
