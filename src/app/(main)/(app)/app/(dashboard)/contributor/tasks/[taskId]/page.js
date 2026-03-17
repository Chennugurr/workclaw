'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import Markdown from 'markdown-to-jsx';
import {
  ArrowLeft,
  Clock,
  Save,
  Send,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ListChecks,
  FileText,
} from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { getTaskComponent, TASK_TYPE_LABELS } from '@/components/task-types';

const AUTOSAVE_INTERVAL = 30000;

export default function Page({ params: paramsPromise }) {
  const router = useRouter();
  const [params, setParams] = useState(null);
  const [response, setResponse] = useState(null);
  const [confidence, setConfidence] = useState(0.5);
  const [reasoning, setReasoning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showRubric, setShowRubric] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const startTimeRef = useRef(Date.now());
  const autosaveRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    paramsPromise.then ? paramsPromise.then(setParams) : setParams(paramsPromise);
  }, [paramsPromise]);

  const taskId = params?.taskId;
  const { data: task, isLoading, mutate } = useAppSWR(
    taskId ? `/tasks/${taskId}` : null
  );

  // Load existing submission data
  useEffect(() => {
    if (task?.submission) {
      if (task.submission.response) setResponse(task.submission.response);
      if (task.submission.confidence != null) setConfidence(task.submission.confidence);
      if (task.submission.reasoning) setReasoning(task.submission.reasoning);
    }
  }, [task]);

  // Keep ref in sync for autosave
  useEffect(() => {
    responseRef.current = response;
  }, [response]);

  // Autosave
  useEffect(() => {
    if (!taskId) return;
    autosaveRef.current = setInterval(() => {
      if (responseRef.current) {
        saveDraft(true);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(autosaveRef.current);
  }, [taskId]);

  const getTimeSpent = () => Math.floor((Date.now() - startTimeRef.current) / 1000);

  const saveDraft = useCallback(async (silent = false) => {
    if (!taskId || !responseRef.current) return;
    setIsSaving(true);
    try {
      await axios.post(`/tasks/${taskId}/submissions`, {
        response: responseRef.current,
        confidence,
        reasoning,
        isDraft: true,
        timeSpent: getTimeSpent(),
      });
      if (!silent) toast.success('Draft saved');
    } catch {
      if (!silent) toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [taskId, confidence, reasoning]);

  const handleSubmit = async () => {
    if (!response) {
      toast.error('Please complete the task before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`/tasks/${taskId}/submissions`, {
        response,
        confidence,
        reasoning,
        isDraft: false,
        timeSpent: getTimeSpent(),
      });
      if (res.data.status === 'success') {
        toast.success('Task submitted!');
        clearInterval(autosaveRef.current);
        router.push('/app/contributor/my-tasks');
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to submit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = (newResponse) => {
    setResponse(newResponse);
  };

  if (isLoading || !task) {
    return (
      <div className='space-y-4'>
        <div className='h-6 bg-gray-200 rounded w-48 animate-pulse' />
        <div className='h-64 bg-gray-100 rounded animate-pulse' />
      </div>
    );
  }

  const TaskComponent = getTaskComponent(task.taskType);
  const taskLabel = TASK_TYPE_LABELS[task.taskType] || task.taskType;
  const isReadOnly = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(task.status);

  return (
    <>
      {/* Top Bar */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <Link
            href='/app/contributor/my-tasks'
            className='text-gray-400 hover:text-gray-900'
          >
            <ArrowLeft className='h-5 w-5' />
          </Link>
          <div>
            <h1 className='font-semibold text-lg'>{task.project?.title}</h1>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='text-xs'>{taskLabel}</Badge>
              <Badge variant='secondary' className='text-xs'>{task.status.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {!isReadOnly && (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={() => saveDraft(false)}
                disabled={isSaving || isSubmitting}
              >
                <Save className='h-3.5 w-3.5 mr-1' />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                size='sm'
                onClick={handleSubmit}
                disabled={isSubmitting || !response}
              >
                <Send className='h-3.5 w-3.5 mr-1' />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
        {/* Left Panel — Instructions, Rubric, Examples */}
        <div className='xl:col-span-1 space-y-3'>
          {/* Instructions */}
          {task.instructions && (
            <CollapsiblePanel
              title='Instructions'
              icon={BookOpen}
              open={showInstructions}
              onToggle={() => setShowInstructions(!showInstructions)}
            >
              <div className='prose prose-sm max-w-none text-sm'>
                <Markdown>{task.instructions}</Markdown>
              </div>
            </CollapsiblePanel>
          )}

          {/* Rubric */}
          {task.rubric && (
            <CollapsiblePanel
              title='Rubric'
              icon={ListChecks}
              open={showRubric}
              onToggle={() => setShowRubric(!showRubric)}
            >
              <div className='text-sm space-y-2'>
                {Object.entries(task.rubric).map(([key, value]) => (
                  <div key={key}>
                    <p className='font-medium capitalize'>{key.replace(/_/g, ' ')}</p>
                    <p className='text-gray-500 text-xs'>{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                  </div>
                ))}
              </div>
            </CollapsiblePanel>
          )}

          {/* Examples */}
          {task.examples && task.examples.length > 0 && (
            <CollapsiblePanel
              title={`Examples (${task.examples.length})`}
              icon={FileText}
              open={showExamples}
              onToggle={() => setShowExamples(!showExamples)}
            >
              <div className='space-y-3'>
                {task.examples.map((ex, i) => (
                  <div key={i} className='text-xs bg-gray-50 p-3 rounded'>
                    <pre className='whitespace-pre-wrap'>{JSON.stringify(ex, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </CollapsiblePanel>
          )}
        </div>

        {/* Main Content — Task + Submission */}
        <div className='xl:col-span-3 space-y-6'>
          {/* Task Component */}
          {TaskComponent ? (
            <TaskComponent
              task={task}
              submission={task.submission}
              onSave={handleSave}
              readOnly={isReadOnly}
            />
          ) : (
            <Card>
              <CardContent className='p-8 text-center'>
                <p className='text-gray-500'>
                  Task type &quot;{taskLabel}&quot; is not yet supported in the workspace.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Confidence + Reasoning */}
          {!isReadOnly && (
            <Card>
              <CardContent className='p-5 space-y-4'>
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='text-sm font-medium'>Confidence</label>
                    <span className='text-sm text-gray-500'>{(confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[confidence * 100]}
                    onValueChange={([v]) => setConfidence(v / 100)}
                    max={100}
                    step={5}
                    className='w-full'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium mb-2 block'>Reasoning (optional)</label>
                  <Textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder='Explain your reasoning for this response...'
                    className='min-h-[80px] text-sm'
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review feedback (if reviewed) */}
          {task.submission?.reviews?.length > 0 && (
            <Card className='border-blue-200'>
              <CardContent className='p-5'>
                <h3 className='font-semibold mb-3'>Review Feedback</h3>
                {task.submission.reviews.map((review) => (
                  <div key={review.id} className='mb-3 last:mb-0'>
                    <Badge
                      className={
                        review.verdict === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : review.verdict === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {review.verdict.replace(/_/g, ' ')}
                    </Badge>
                    {review.score != null && (
                      <span className='text-sm text-gray-500 ml-2'>
                        Score: {(review.score * 100).toFixed(0)}%
                      </span>
                    )}
                    {review.comments && (
                      <p className='text-sm text-gray-600 mt-2'>{review.comments}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function CollapsiblePanel({ title, icon: Icon, open, onToggle, children }) {
  return (
    <Card>
      <button
        onClick={onToggle}
        className='w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-gray-50 transition-colors'
      >
        <span className='flex items-center gap-2'>
          <Icon className='h-4 w-4 text-gray-500' />
          {title}
        </span>
        {open ? (
          <ChevronUp className='h-4 w-4 text-gray-400' />
        ) : (
          <ChevronDown className='h-4 w-4 text-gray-400' />
        )}
      </button>
      {open && (
        <CardContent className='px-4 pb-4 pt-0'>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
