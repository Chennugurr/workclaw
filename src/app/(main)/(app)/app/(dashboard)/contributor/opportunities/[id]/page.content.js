'use client';

import { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import Markdown from 'markdown-to-jsx';
import { toast } from 'sonner';
import { useAppKit } from '@reown/appkit/react';
import {
  ArrowLeft,
  DollarSign,
  Users,
  Clock,
  Shield,
  Lock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Target,
  Layers,
  GraduationCap,
  Zap,
} from 'lucide-react';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import { TOAST_IDS } from '@/constants';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

const DIFFICULTY_LABELS = {
  BEGINNER: { label: 'Beginner', color: 'bg-green-100 text-green-700', icon: Zap },
  INTERMEDIATE: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700', icon: Zap },
  ADVANCED: { label: 'Advanced', color: 'bg-purple-100 text-purple-700', icon: Zap },
  EXPERT: { label: 'Expert', color: 'bg-orange-100 text-orange-700', icon: Zap },
};

const TASK_TYPE_LABELS = {
  SINGLE_RESPONSE_RATING: 'Response Rating',
  PAIRWISE_COMPARISON: 'Comparison',
  MULTI_RESPONSE_RANKING: 'Ranking',
  LABEL_CLASSIFICATION: 'Classification',
  TEXT_ANNOTATION: 'Annotation',
  CODE_REVIEW: 'Code Review',
  FACTUALITY_VERIFICATION: 'Fact Check',
  SAFETY_REVIEW: 'Safety Review',
  SCAM_CLASSIFICATION: 'Scam Detection',
  CONTRACT_VALIDATION: 'Contract Review',
  RESEARCH_GRADING: 'Research Review',
  AGENT_EVALUATION: 'Agent Testing',
  PROMPT_WRITING: 'Prompt Writing',
  TRANSLATION_REVIEW: 'Translation Review',
};

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-green-100 text-green-700' },
  INVITE_ONLY: { label: 'Invite Only', color: 'bg-yellow-100 text-yellow-700' },
  FULL: { label: 'Full', color: 'bg-red-100 text-red-700' },
  PAUSED: { label: 'Paused', color: 'bg-gray-100 text-gray-700' },
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-500' },
  CLOSED: { label: 'Closed', color: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
};

const PAY_MODEL_LABELS = {
  PER_TASK: 'Per Task',
  HOURLY: 'Hourly',
};

export default function PageContent({ params }) {
  const { open } = useAppKit();
  const { authenticated } = useAppState();
  const user = useAppState((s) => s.user);
  const [isApplySheetOpen, setIsApplySheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationNote, setApplicationNote] = useState('');
  const { data: project = {}, isLoading, mutate } = useAppSWR(`/projects/${params.id}`);

  const difficulty = DIFFICULTY_LABELS[project.difficulty] || DIFFICULTY_LABELS.INTERMEDIATE;
  const taskType = TASK_TYPE_LABELS[project.taskType] || project.taskType;
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.OPEN;
  const isLocked = project.status === 'FULL' || project.status === 'PAUSED' || project.status === 'CLOSED';
  const hasApplied = !!project.application;
  const applicationStatus = project.application?.status;

  const applyToProject = async () => {
    if (!authenticated) {
      open({ view: 'connect' });
      return;
    }
    if (hasApplied) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting application...', {
      id: TOAST_IDS.SUBMIT_APPLICATION,
    });
    try {
      const res = await axios.post(
        `/orgs/${project.organization?.id}/projects/${project.id}/applications`,
        { note: applicationNote }
      );
      if (res.data.status === 'success') {
        toast.success('Application submitted!', { id: toastId });
        setIsApplySheetOpen(false);
        setApplicationNote('');
        mutate();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to submit application.',
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const withdrawApplication = async () => {
    if (!hasApplied || applicationStatus === 'WITHDRAWN') return;
    const confirm = window.confirm(
      'Withdraw your application? You can re-apply later if spots are available.'
    );
    if (!confirm) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Withdrawing...', {
      id: TOAST_IDS.WITHDRAW_APPLICATION,
    });
    try {
      const res = await axios.patch(
        `/orgs/${project.organization?.id}/projects/${project.id}/applications/${project.application.id}`,
        { status: 'WITHDRAWN' }
      );
      if (res.data.status === 'success') {
        toast.success('Application withdrawn', { id: toastId });
        mutate();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to withdraw.',
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='h-6 bg-gray-200 rounded w-48 animate-pulse' />
        <div className='h-8 bg-gray-200 rounded w-3/4 animate-pulse' />
        <div className='h-4 bg-gray-100 rounded w-1/2 animate-pulse' />
        <div className='grid xl:grid-cols-3 gap-6 mt-6'>
          <div className='xl:col-span-2 h-64 bg-gray-100 rounded animate-pulse' />
          <div className='h-64 bg-gray-100 rounded animate-pulse' />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back link */}
      <Link
        href='/app/contributor/opportunities'
        className='inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        Back to Opportunities
      </Link>

      {/* Header */}
      <div className='flex flex-col lg:flex-row justify-between items-start mb-6'>
        <div className='mb-4 lg:mb-0'>
          <div className='flex items-center gap-2 mb-2'>
            <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
            <Badge variant='outline' className='text-xs'>{taskType}</Badge>
            <Badge className={`text-xs ${difficulty.color}`}>{difficulty.label}</Badge>
          </div>
          <h1 className='text-2xl font-bold'>{project.title}</h1>
          <p className='text-gray-500 mt-1'>
            by {project.organization?.name || 'Anonymous Organization'}
          </p>
        </div>

        <div className='flex items-center gap-2 w-full lg:w-auto'>
          {isLocked ? (
            <Button disabled className='flex-grow lg:flex-grow-0'>
              <Lock className='h-4 w-4 mr-2' />
              {project.status === 'FULL' ? 'Project Full' : 'Not Available'}
            </Button>
          ) : hasApplied ? (
            <>
              <ApplicationStatusBadge status={applicationStatus} />
              {applicationStatus !== 'WITHDRAWN' && applicationStatus !== 'REJECTED' && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={withdrawApplication}
                  disabled={isSubmitting}
                >
                  Withdraw
                </Button>
              )}
            </>
          ) : (
            <Sheet open={isApplySheetOpen} onOpenChange={setIsApplySheetOpen}>
              <SheetTrigger asChild>
                <Button className='flex-grow lg:flex-grow-0' disabled={isSubmitting}>
                  Apply to Project
                  <ChevronRight className='ml-2 h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[90vw] sm:w-[540px]'>
                <SheetHeader>
                  <SheetTitle>Apply to {project.title}</SheetTitle>
                </SheetHeader>
                <div className='space-y-6 mt-6'>
                  <div>
                    <p className='text-sm text-gray-500 mb-4'>
                      Tell the team why you&apos;re a good fit for this project. Mention relevant
                      experience with {project.domain?.join(', ') || 'this domain'}.
                    </p>
                    <Textarea
                      placeholder='Why are you interested in this project? What relevant experience do you have?'
                      className='min-h-[160px]'
                      value={applicationNote}
                      onChange={(e) => setApplicationNote(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  {project.requiredTier && project.requiredTier !== 'NEW' && (
                    <div className='flex items-start gap-2 p-3 bg-yellow-50 rounded-lg'>
                      <Shield className='h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0' />
                      <p className='text-sm text-yellow-800'>
                        This project requires <strong>{project.requiredTier}</strong> tier or above.
                      </p>
                    </div>
                  )}

                  <Button
                    className='w-full'
                    onClick={applyToProject}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className='grid xl:grid-cols-3 gap-6'>
        {/* Main content */}
        <div className='xl:col-span-2 space-y-6'>
          {/* Description */}
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold mb-4'>Project Description</h2>
              <div className='prose prose-sm max-w-none'>
                <Markdown>{project.description || 'No description provided.'}</Markdown>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {project.guidelines && (
            <Card>
              <CardContent className='p-6'>
                <h2 className='text-lg font-semibold mb-4'>Guidelines & Requirements</h2>
                <div className='prose prose-sm max-w-none'>
                  <Markdown>{project.guidelines}</Markdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Qualification Gates */}
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold mb-4'>Qualifications</h2>
              <div className='space-y-3'>
                {project.screeningDetails?.length > 0 ? (
                  project.screeningDetails.map((s) => (
                    <QualificationRow
                      key={s.id}
                      icon={GraduationCap}
                      label={`Screening: ${s.title}`}
                      met={s.passed}
                      detail={s.passed ? 'Passed' : 'Complete this screening to qualify'}
                      href={!s.passed ? `/app/contributor/screenings/${s.id}` : undefined}
                    />
                  ))
                ) : (
                  <QualificationRow
                    icon={GraduationCap}
                    label='No screening required'
                    met={true}
                    detail='Open to all contributors'
                  />
                )}
                <QualificationRow
                  icon={Shield}
                  label={`Minimum tier: ${project.requiredTier || 'NEW'}`}
                  met={!project.requiredTier || project.requiredTier === 'NEW' || tierMeetsRequirement(user?.tier, project.requiredTier)}
                  detail={project.requiredTier && project.requiredTier !== 'NEW' ? `You need ${project.requiredTier} tier` : 'No minimum tier'}
                />
                {project.qualityThreshold > 0 && (
                  <QualificationRow
                    icon={Target}
                    label={`Quality threshold: ${(project.qualityThreshold * 100).toFixed(0)}%`}
                    met={(user?.profile?.trustScore || 0) >= project.qualityThreshold}
                    detail='Based on your approval rate'
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          {/* Pay & Stats */}
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold mb-4'>Compensation</h2>
              {project.rateAmount ? (
                <div className='flex items-baseline gap-2 mb-4'>
                  <span className='text-3xl font-bold text-green-600'>
                    ${Number(project.rateAmount).toFixed(2)}
                  </span>
                  <span className='text-gray-500'>
                    {PAY_MODEL_LABELS[project.payModel] || project.payModel}
                  </span>
                </div>
              ) : (
                <p className='text-gray-500 mb-4'>Compensation details will be shared upon acceptance.</p>
              )}

              <div className='space-y-3 text-sm'>
                {project.capacity && (
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Users className='h-4 w-4' />
                    <span>{project.capacity} contributor spots</span>
                  </div>
                )}
                {project.taskVolume && (
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Layers className='h-4 w-4' />
                    <span>{project.taskVolume} tasks available</span>
                  </div>
                )}
                <div className='flex items-center gap-2 text-gray-600'>
                  <Clock className='h-4 w-4' />
                  <span>Posted {dayjs(project.createdAt).format('MMM DD, YYYY')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domains */}
          {project.domain?.length > 0 && (
            <Card>
              <CardContent className='p-6'>
                <h2 className='text-lg font-semibold mb-3'>Domains</h2>
                <div className='flex flex-wrap gap-2'>
                  {project.domain.map((d) => (
                    <Badge key={d} variant='secondary'>{d}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chains */}
          {project.chainTags?.length > 0 && (
            <Card>
              <CardContent className='p-6'>
                <h2 className='text-lg font-semibold mb-3'>Chains</h2>
                <div className='flex flex-wrap gap-2'>
                  {project.chainTags.map((chain) => (
                    <Badge key={chain} variant='outline'>{chain}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {project.skills?.length > 0 && (
            <Card>
              <CardContent className='p-6'>
                <h2 className='text-lg font-semibold mb-3'>Required Skills</h2>
                <div className='flex flex-wrap gap-2'>
                  {project.skills.map((association) => (
                    <Badge key={association.id} variant='outline'>
                      {association.skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile sidebar sheet */}
      <div className='fixed bottom-4 right-4 xl:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='default'>
              Project Details
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </SheetTrigger>
          <SheetContent side='right' className='w-[90vw] sm:w-[540px]'>
            <SheetHeader>
              <SheetTitle>Project Details</SheetTitle>
            </SheetHeader>
            <div className='mt-4 overflow-y-auto h-[calc(100vh-80px)] space-y-4'>
              <ProjectDetailsMobile project={project} user={user} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function ApplicationStatusBadge({ status }) {
  const config = {
    PENDING: { label: 'Application Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    REJECTED: { label: 'Not Selected', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    WITHDRAWN: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-500', icon: AlertCircle },
  };
  const c = config[status] || config.PENDING;
  const Icon = c.icon;

  return (
    <Badge className={`${c.color} gap-1`}>
      <Icon className='h-3 w-3' />
      {c.label}
    </Badge>
  );
}

function QualificationRow({ icon: Icon, label, met, detail, href }) {
  const content = (
    <div className={`flex items-center gap-3 ${href ? 'hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg cursor-pointer' : ''}`}>
      <div className={`h-7 w-7 rounded-full flex items-center justify-center ${met ? 'bg-green-100' : 'bg-gray-100'}`}>
        <Icon className={`h-4 w-4 ${met ? 'text-green-600' : 'text-gray-400'}`} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium'>{label}</p>
        <p className='text-xs text-gray-500'>{detail}</p>
      </div>
      {met ? (
        <CheckCircle2 className='h-4 w-4 text-green-500 flex-shrink-0' />
      ) : href ? (
        <ChevronRight className='h-4 w-4 text-gray-400 flex-shrink-0' />
      ) : (
        <AlertCircle className='h-4 w-4 text-gray-300 flex-shrink-0' />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function ProjectDetailsMobile({ project, user }) {
  return (
    <>
      <Card>
        <CardContent className='p-5'>
          <h3 className='font-semibold mb-3'>Compensation</h3>
          {project.rateAmount ? (
            <p className='text-2xl font-bold text-green-600'>
              ${Number(project.rateAmount).toFixed(2)}
              <span className='text-sm font-normal text-gray-500 ml-1'>
                {PAY_MODEL_LABELS[project.payModel] || project.payModel}
              </span>
            </p>
          ) : (
            <p className='text-sm text-gray-500'>Details upon acceptance</p>
          )}
        </CardContent>
      </Card>

      {project.domain?.length > 0 && (
        <Card>
          <CardContent className='p-5'>
            <h3 className='font-semibold mb-3'>Domains</h3>
            <div className='flex flex-wrap gap-2'>
              {project.domain.map((d) => (
                <Badge key={d} variant='secondary'>{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {project.chainTags?.length > 0 && (
        <Card>
          <CardContent className='p-5'>
            <h3 className='font-semibold mb-3'>Chains</h3>
            <div className='flex flex-wrap gap-2'>
              {project.chainTags.map((chain) => (
                <Badge key={chain} variant='outline'>{chain}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

const TIER_ORDER = ['NEW', 'VERIFIED', 'SKILLED', 'TRUSTED', 'EXPERT', 'ELITE_REVIEWER'];

function tierMeetsRequirement(userTier, requiredTier) {
  const userIdx = TIER_ORDER.indexOf(userTier || 'NEW');
  const reqIdx = TIER_ORDER.indexOf(requiredTier || 'NEW');
  return userIdx >= reqIdx;
}
