'use client';

import Case from 'case';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { toast } from 'sonner';
import Markdown from 'markdown-to-jsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppKit } from '@reown/appkit/react';
import {
  Bookmark,
  MapPin,
  Calendar,
  Clock,
  Layers,
  Briefcase,
  LinkIcon,
  Linkedin,
  Facebook,
  Twitter,
  Mail,
  ChevronRight,
} from 'lucide-react';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import { CURRENCY, TOAST_IDS } from '@/constants';
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
import JobStatusBadge from '@/components/job-status-badge';
import JobPositionBadge from '@/components/job-position-badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const proposalSchema = z.object({
  budget: z.number().positive(),
  statement: z.string().min(1),
});

export default function PageContent({ params }) {
  const { open } = useAppKit();
  const { authenticated } = useAppState();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplySheetOpen, setIsApplySheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: job = {}, isLoading, mutate } = useAppSWR(`/jobs/${params.id}`);

  const form = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      budget: 0,
      statement: '',
    },
  });

  useEffect(() => {
    if (job?.budget) form.setValue('budget', parseFloat(job.budget));
  }, [form, job]);

  if (isLoading) return <div>Loading...</div>;

  const onSubmit = async (data) => {
    if (!authenticated) {
      open({ view: 'connect' });
      return;
    }
    if (job.proposal) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting proposal...', {
      id: TOAST_IDS.SUBMIT_PROPOSAL,
    });
    try {
      const res = await axios.post(
        `/orgs/${job.org.id}/jobs/${job.id}/proposals`,
        data
      );
      if (res.data.status === 'success') {
        toast.success('Proposal submitted successfully', { id: toastId });
        setIsApplySheetOpen(false);
        form.reset();
        mutate();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Failed to submit proposal. Please try again.',
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const withdrawProposal = async () => {
    if (!authenticated) {
      open({ view: 'connect' });
      return;
    }
    if (!job.proposal) return;
    if (job.proposal.status === 'WITHDRAWN') return;

    const confirmWithdraw = window.confirm(
      'Are you sure you want to withdraw your proposal? This action is irreversible.'
    );
    if (!confirmWithdraw) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Withdrawing proposal...', {
      id: TOAST_IDS.WITHDRAW_PROPOSAL,
    });
    try {
      const res = await axios.patch(
        `/orgs/${job.org.id}/jobs/${job.id}/proposals/${job.proposal.id}`,
        { status: 'WITHDRAWN' }
      );
      if (res.data.status === 'success') {
        toast.success('Proposal withdrawn successfully', { id: toastId });
        mutate();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Failed to withdraw proposal. Please try again.',
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='flex flex-col lg:flex-row justify-between items-start mb-6'>
        <div className='flex items-center mb-4 lg:mb-0'>
          {job.org.logo ? (
            <img
              src={job.org.logo}
              alt={`${job.org.name} logo`}
              className='w-20 h-20 rounded-full mr-4 object-cover'
            />
          ) : (
            <div className='bg-gray-200 rounded-full p-4 mr-4'>
              <Briefcase className='w-12 h-12 text-gray-600' />
            </div>
          )}
          <div>
            <h1 className='text-2xl font-bold'>{job.title}</h1>
            <p className='text-gray-600'>
              at{' '}
              <Link
                href={`/app/c/employers/${job.org.id}`}
                className='hover:underline'
              >
                {job.org.name}
              </Link>
            </p>
            <div className='flex items-center mt-2 gap-2'>
              <JobStatusBadge status={job.status} />
              <JobPositionBadge position={job.position} />
            </div>
          </div>
        </div>
        <div className='flex items-center w-full lg:w-auto'>
          <Button
            variant='outline'
            size='icon'
            className='mr-2 flex-grow lg:flex-grow-0'
            onClick={() => setIsBookmarked(!isBookmarked)}
            disabled={isLoading || isSubmitting}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
            />
            <span className='ml-2 lg:hidden'>Bookmark</span>
          </Button>
          {authenticated && job.proposal ? (
            <Button
              className='flex-grow lg:flex-grow-0'
              onClick={withdrawProposal}
              variant='destructive'
              disabled={
                job.proposal.status === 'WITHDRAWN' || isLoading || isSubmitting
              }
            >
              {job.proposal.status === 'WITHDRAWN'
                ? 'Withdrawn'
                : 'Withdraw Proposal'}
            </Button>
          ) : (
            <Sheet open={isApplySheetOpen} onOpenChange={setIsApplySheetOpen}>
              <SheetTrigger asChild>
                <Button
                  className='flex-grow lg:flex-grow-0'
                  disabled={isLoading || isSubmitting}
                >
                  <span>Apply Now</span>
                  <ChevronRight className='ml-2 h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[90vw] sm:w-[540px]'>
                <SheetHeader>
                  <SheetTitle>Apply for {job.title}</SheetTitle>
                </SheetHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-6 mt-4'
                  >
                    <FormField
                      control={form.control}
                      name='budget'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Your Proposed Budget ({CURRENCY[job.currency]})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder={`Enter your proposed budget in ${CURRENCY[job.currency]}`}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : 0
                                )
                              }
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='statement'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Letter</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Write your cover letter here...'
                              className='min-h-[200px]'
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type='submit'
                      className='w-full'
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
                    </Button>
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <div className='grid xl:grid-cols-3 gap-6'>
        <div className='xl:col-span-2'>
          <Card>
            <CardContent className='prose p-6'>
              <Markdown>{job.description}</Markdown>
            </CardContent>
          </Card>
        </div>

        <div className='hidden xl:block'>
          <JobDetailsAside job={job} />
        </div>
      </div>

      <div className='fixed bottom-4 right-4 xl:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='default' disabled={isLoading || isSubmitting}>
              Job Details
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </SheetTrigger>
          <SheetContent side='right' className='w-[90vw] sm:w-[540px]'>
            <SheetHeader>
              <SheetTitle>Job Details</SheetTitle>
            </SheetHeader>
            <div className='mt-4 overflow-y-auto h-[calc(100vh-80px)]'>
              <JobDetailsAside job={job} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function JobDetailsAside({ job }) {
  return (
    <>
      <Card>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>
            Budget ({CURRENCY[job.currency]})
          </h2>
          <p className='text-2xl font-bold text-green-500'>
            {numeral(job.budget).format('0,0.00a')} {CURRENCY[job.currency]}
          </p>
          {/* TODO: impl approximate budget conversion to USD */}
          {/* <p className='text-sm text-gray-500'>
            ~ ${numeral(Number(job.budget) * 2500).format('0,0.00')}
          </p> */}

          {job.location && (
            <div className='mt-6'>
              <h3 className='text-lg font-semibold mb-2'>Job Location</h3>
              <div className='flex items-center text-gray-600'>
                <MapPin className='mr-2 h-5 w-5' />
                <span>{job.location}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='mt-6'>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Job Overview</h2>
          <div className='grid grid-cols-1 gap-4'>
            <div className='flex items-center'>
              <Calendar className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Job Posted:
                </span>
                <p className='font-semibold'>
                  {dayjs(job.createdAt).format('MMM DD, YYYY')}
                </p>
              </div>
            </div>
            {job.duration && (
              <div className='flex items-center'>
                <Clock className='mr-2 h-5 w-5 text-gray-400' />
                <div>
                  <span className='text-sm text-gray-600 uppercase'>
                    Job Expire In:
                  </span>
                  <p className='font-semibold'>
                    {dayjs(job.createdAt)
                      .add(job.duration, 'days')
                      .format('MMM DD, YYYY')}
                  </p>
                </div>
              </div>
            )}
            <div className='flex items-center'>
              <Layers className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Position:
                </span>
                <p className='font-semibold'>{Case.title(job.position)}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <Briefcase className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Experience:
                </span>
                <p className='font-semibold'>{Case.title(job.experience)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {job.skills && job.skills.length > 0 && (
        <Card className='mt-6'>
          <CardContent className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Skills</h2>
            <div className='flex flex-wrap gap-2'>
              {job.skills.map((association) => (
                <Badge
                  key={association.id}
                  variant='outline'
                  className='justify-start'
                >
                  {association.skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='mt-6'>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Share this job:</h2>
          <div className='flex items-center mb-4'>
            <Button variant='outline' size='sm' className='mr-2'>
              <LinkIcon className='mr-2 h-4 w-4' />
              Copy Link
            </Button>
            <Button variant='outline' size='icon' className='mr-2'>
              <Linkedin className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='icon' className='mr-2'>
              <Facebook className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='icon' className='mr-2'>
              <Twitter className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='icon'>
              <Mail className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
