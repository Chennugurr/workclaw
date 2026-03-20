'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  GraduationCap,
  Send,
  RotateCcw,
} from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

dayjs.extend(relativeTime);

export default function Page({ params: paramsPromise }) {
  const router = useRouter();
  const [params, setParams] = useState(null);
  const [mode, setMode] = useState('overview'); // 'overview' | 'test' | 'result'
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    paramsPromise.then ? paramsPromise.then(setParams) : setParams(paramsPromise);
  }, [paramsPromise]);

  const screeningId = params?.id;
  const { data: screening, isLoading } = useAppSWR(
    screeningId ? `/screenings/${screeningId}` : null
  );
  const { data: testData, mutate: mutateTest } = useAppSWR(
    screeningId && mode === 'test' ? `/screenings/${screeningId}?start=true` : null
  );

  const questions = testData?.questions || [];

  // Timer
  useEffect(() => {
    if (mode !== 'test' || !screening?.timeLimitMins) return;
    setTimeLeft(screening.timeLimitMins * 60);
  }, [mode, screening?.timeLimitMins]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(`/screenings/${screeningId}/attempts`, {
        answers,
      });
      if (res.data.status === 'success') {
        setResult(res.data.data);
        setMode('result');
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to submit.');
    } finally {
      setIsSubmitting(false);
    }
  }, [screeningId, answers, isSubmitting]);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (isLoading || !screening) {
    return (
      <div className='space-y-4'>
        <div className='h-6 bg-gray-200 rounded w-48 animate-pulse' />
        <div className='h-8 bg-gray-200 rounded w-3/4 animate-pulse' />
        <div className='h-48 bg-gray-100 rounded animate-pulse' />
      </div>
    );
  }

  const attempts = screening.attempts || [];
  const passed = attempts.some((a) => a.passed === true);
  const attemptsUsed = attempts.length;
  const attemptsLeft = screening.maxAttempts - attemptsUsed;
  const bestScore = attempts.reduce((best, a) => {
    if (a.score !== null && (best === null || a.score > best)) return a.score;
    return best;
  }, null);

  // Check cooldown
  let cooldownEnds = null;
  if (attempts.length > 0 && !passed && attemptsLeft > 0) {
    const lastTime = new Date(attempts[0].createdAt).getTime();
    const endTime = lastTime + 24 * 60 * 60 * 1000;
    if (Date.now() < endTime) cooldownEnds = new Date(endTime);
  }

  const canStart = !passed && attemptsLeft > 0 && !cooldownEnds;

  // RESULT VIEW
  if (mode === 'result' && result) {
    return (
      <>
        <Link
          href='/app/contributor/screenings'
          className='inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4'
        >
          <ArrowLeft className='h-4 w-4 mr-1' />
          Back to Screenings
        </Link>

        <Card className='max-w-lg mx-auto'>
          <CardContent className='p-8 text-center'>
            {result.passed === true ? (
              <>
                <CheckCircle2 className='h-16 w-16 text-green-500 mx-auto mb-4' />
                <h2 className='text-2xl font-bold text-green-700 mb-2'>You Passed!</h2>
                <p className='text-gray-500 mb-4'>
                  Score: {(result.score * 100).toFixed(0)}% — You&apos;ve unlocked projects
                  requiring this screening.
                </p>
              </>
            ) : result.passed === false ? (
              <>
                <XCircle className='h-16 w-16 text-red-400 mx-auto mb-4' />
                <h2 className='text-2xl font-bold text-red-700 mb-2'>Not Quite</h2>
                <p className='text-gray-500 mb-4'>
                  Score: {(result.score * 100).toFixed(0)}% — You needed{' '}
                  {(screening.passingScore * 100).toFixed(0)}% to pass.
                </p>
                {result.attemptsRemaining > 0 && (
                  <p className='text-sm text-gray-400'>
                    {result.attemptsRemaining} retake(s) remaining. Available after 24h cooldown.
                  </p>
                )}
              </>
            ) : (
              <>
                <AlertCircle className='h-16 w-16 text-yellow-500 mx-auto mb-4' />
                <h2 className='text-2xl font-bold text-yellow-700 mb-2'>Submitted for Review</h2>
                <p className='text-gray-500 mb-4'>
                  Some questions require manual review. You&apos;ll be notified when scoring is complete.
                </p>
              </>
            )}

            <Button asChild className='mt-4'>
              <Link href='/app/contributor/screenings'>
                Back to Screenings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  // TEST VIEW
  if (mode === 'test' && questions.length > 0) {
    const question = questions[currentQ];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-semibold text-lg'>{screening.title}</h2>
          <div className='flex items-center gap-3'>
            {timeLeft !== null && (
              <Badge variant='outline' className='gap-1'>
                <Clock className='h-3.5 w-3.5' />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Badge>
            )}
            <Badge variant='secondary'>
              {currentQ + 1} / {questions.length}
            </Badge>
          </div>
        </div>

        <Progress value={progress} className='h-1.5 mb-6' />

        {/* Question */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-2 mb-1'>
              <Badge variant='outline' className='text-xs shrink-0'>
                {question.points} pt{question.points !== 1 ? 's' : ''}
              </Badge>
              <Badge variant='secondary' className='text-xs'>
                {question.questionType.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className='text-base font-medium mt-3 mb-5'>{question.question}</p>

            {/* Answer input based on type */}
            {(question.questionType === 'MULTIPLE_CHOICE' ||
              question.questionType === 'SCENARIO_BASED') &&
              question.options && (
                <div className='space-y-2'>
                  {question.options.map((opt, idx) => {
                    const optValue = typeof opt === 'string' ? opt : opt.id || opt.text;
                    const optLabel = typeof opt === 'string' ? opt : opt.text || opt.id;
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <button
                        key={optValue}
                        onClick={() => setAnswer(question.id, optValue)}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors',
                          answers[question.id] === optValue
                            ? 'border-gray-900 bg-gray-50 font-medium'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <span className='font-mono text-xs text-gray-400 mr-2'>
                          {letter}.
                        </span>
                        {optLabel}
                      </button>
                    );
                  })}
                </div>
              )}

            {(question.questionType === 'SHORT_ANSWER' ||
              question.questionType === 'MANUAL_REVIEW') && (
              <Textarea
                placeholder='Type your answer...'
                className='min-h-[120px]'
                value={answers[question.id] || ''}
                onChange={(e) => setAnswer(question.id, e.target.value)}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className='flex justify-between'>
          <Button
            variant='outline'
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Previous
          </Button>

          {currentQ < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQ((q) => q + 1)}
            >
              Next
              <ChevronRight className='h-4 w-4 ml-1' />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className='h-4 w-4 mr-1' />
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <div className='flex flex-wrap gap-2 mt-6 pt-4 border-t'>
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={cn(
                'h-8 w-8 rounded text-xs font-medium transition-colors',
                currentQ === i
                  ? 'bg-gray-900 text-white'
                  : answers[q.id] !== undefined
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </>
    );
  }

  // OVERVIEW VIEW (default)
  return (
    <>
      <Link
        href='/app/contributor/screenings'
        className='inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        Back to Screenings
      </Link>

      <div className='max-w-2xl'>
        <h1 className='text-2xl font-bold mb-1'>{screening.title}</h1>
        <p className='text-gray-500 mb-6'>{screening.domain}</p>

        {screening.description && (
          <Card className='mb-6'>
            <CardContent className='p-6'>
              <p className='text-sm text-gray-700'>{screening.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
          <Card>
            <CardContent className='p-4 text-center'>
              <Target className='h-5 w-5 text-gray-400 mx-auto mb-1' />
              <p className='text-lg font-bold'>{screening.questionCount}</p>
              <p className='text-xs text-gray-500'>Questions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <CheckCircle2 className='h-5 w-5 text-gray-400 mx-auto mb-1' />
              <p className='text-lg font-bold'>{(screening.passingScore * 100).toFixed(0)}%</p>
              <p className='text-xs text-gray-500'>To Pass</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <Clock className='h-5 w-5 text-gray-400 mx-auto mb-1' />
              <p className='text-lg font-bold'>{screening.timeLimitMins || '∞'}</p>
              <p className='text-xs text-gray-500'>Minutes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <RotateCcw className='h-5 w-5 text-gray-400 mx-auto mb-1' />
              <p className='text-lg font-bold'>{attemptsLeft}</p>
              <p className='text-xs text-gray-500'>Attempts Left</p>
            </CardContent>
          </Card>
        </div>

        {/* Previous attempts */}
        {attempts.length > 0 && (
          <Card className='mb-6'>
            <CardContent className='p-6'>
              <h3 className='font-semibold mb-3'>Previous Attempts</h3>
              <div className='space-y-2'>
                {attempts.map((attempt, i) => (
                  <div
                    key={attempt.id}
                    className='flex items-center justify-between py-2 border-b last:border-0'
                  >
                    <div className='flex items-center gap-2'>
                      {attempt.passed === true ? (
                        <CheckCircle2 className='h-4 w-4 text-green-500' />
                      ) : attempt.passed === false ? (
                        <XCircle className='h-4 w-4 text-red-400' />
                      ) : (
                        <AlertCircle className='h-4 w-4 text-yellow-500' />
                      )}
                      <span className='text-sm'>
                        Attempt {attempts.length - i}
                      </span>
                    </div>
                    <div className='flex items-center gap-3'>
                      {attempt.score !== null && (
                        <span className='text-sm font-medium'>
                          {(attempt.score * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className='text-xs text-gray-400'>
                        {dayjs(attempt.createdAt).fromNow()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action */}
        {passed ? (
          <Card className='border-green-200 bg-green-50'>
            <CardContent className='p-6 flex items-center gap-3'>
              <CheckCircle2 className='h-6 w-6 text-green-600 flex-shrink-0' />
              <div>
                <p className='font-semibold text-green-800'>Screening Passed</p>
                <p className='text-sm text-green-700'>
                  Best score: {(bestScore * 100).toFixed(0)}%. Projects requiring this
                  screening are unlocked.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : cooldownEnds ? (
          <Card className='border-orange-200 bg-orange-50'>
            <CardContent className='p-6 flex items-center gap-3'>
              <Clock className='h-6 w-6 text-orange-600 flex-shrink-0' />
              <div>
                <p className='font-semibold text-orange-800'>Cooldown Active</p>
                <p className='text-sm text-orange-700'>
                  You can retake this screening {dayjs(cooldownEnds).fromNow()}.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : attemptsLeft <= 0 ? (
          <Card className='border-red-200 bg-red-50'>
            <CardContent className='p-6 flex items-center gap-3'>
              <XCircle className='h-6 w-6 text-red-500 flex-shrink-0' />
              <div>
                <p className='font-semibold text-red-800'>No Retakes Available</p>
                <p className='text-sm text-red-700'>
                  You&apos;ve used all {screening.maxAttempts} attempts.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            size='lg'
            className='w-full'
            onClick={() => {
              setAnswers({});
              setCurrentQ(0);
              setResult(null);
              setMode('test');
            }}
          >
            <GraduationCap className='h-5 w-5 mr-2' />
            {attemptsUsed > 0 ? 'Retake Screening' : 'Start Screening'}
          </Button>
        )}
      </div>
    </>
  );
}
