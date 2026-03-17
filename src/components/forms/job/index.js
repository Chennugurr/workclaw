'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { JobStatus } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowRightIcon } from 'lucide-react';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MdxEditor } from '@/components/mdx-editor';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { TOAST_IDS } from '@/constants';

const jobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  budget: z.number().positive(),
  currency: z.enum(['USDC']).default('USDC'),
  duration: z.number().int().positive().optional().or(z.literal(null)),
  status: z.enum(['OPEN', 'CLOSED', 'CANCELED', 'COMPLETED']).default('OPEN'),
  position: z.enum([
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'TEMPORARY',
    'INTERNSHIP',
  ]),
  experience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  location: z.string().max(255),
  skills: z
    .array(
      z.object({
        name: z.string(),
        level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
      })
    )
    .optional(),
});

export default function JobForm({ job }) {
  const router = useRouter();
  const {
    organization: { selected: org },
  } = useAppState();
  const isEdit = !!job && job.id;
  const isImmutable = job && job.status !== JobStatus.OPEN;
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      budget: parseFloat(job?.budget || '0'),
      currency: job?.currency || 'USDC',
      duration: job?.duration || null,
      status: job?.status || 'OPEN',
      position: job?.position || 'FULL_TIME',
      experience: job?.experience || 'BEGINNER',
      location: job?.location || '',
      skills:
        job?.skills?.map((i) => ({
          name: i.skill.name,
          level: i.level,
        })) || [],
    },
  });

  const onSubmit = async (data) => {
    if (isImmutable) {
      toast.error('This job cannot be edited as it is no longer open.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(`${isEdit ? 'Updating' : 'Posting'} job...`, {
      id: isEdit ? TOAST_IDS.UPDATE_JOB : TOAST_IDS.CREATE_JOB,
    });

    try {
      let res;
      if (isEdit) {
        res = await axios.patch(`/orgs/${org.id}/jobs/${job.id}`, {
          ...data,
          budget: undefined,
          currency: undefined,
        });
      } else {
        res = await axios.post(`/orgs/${org.id}/jobs`, data);
      }
      if (res.data.status === 'success') {
        toast.success(`Job ${isEdit ? 'updated' : 'posted'} successfully`, {
          id: toastId,
        });
        if (!isEdit) router.push(`/app/customer/projects/${res.data.data.id}/edit`);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${isEdit ? 'update' : 'post'} job. Please try again.`,
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <h1 className='text-2xl font-bold mb-6'>
          {isEdit ? 'Edit job' : 'Post a job'}
        </h1>

        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='Add job title, role, vacancies etc'
                  disabled={isImmutable || isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='skills'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Job skills, separated by commas (i.e. Typescript, Next.js, Rust, etc)'
                    onChange={(e) => {
                      const skillsArray = e.target.value
                        .split(',')
                        .map((skill) => ({
                          name: skill,
                          level: 'BEGINNER',
                        }));
                      field.onChange(skillsArray);
                    }}
                    value={
                      field.value
                        ? field.value.map((skill) => skill.name).join(',')
                        : ''
                    }
                    disabled={isImmutable || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='position'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Position</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isImmutable || isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select...' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='FULL_TIME'>Full Time</SelectItem>
                    <SelectItem value='PART_TIME'>Part Time</SelectItem>
                    <SelectItem value='CONTRACT'>Contract</SelectItem>
                    <SelectItem value='TEMPORARY'>Temporary</SelectItem>
                    <SelectItem value='INTERNSHIP'>Internship</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h2 className='text-lg font-semibold mb-2'>Budget</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='budget'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      placeholder='Budget amount'
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      value={field.value ?? ''}
                      readOnly={isEdit || isImmutable}
                      disabled={isEdit || isImmutable || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='currency'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEdit || isImmutable || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='USDC'>USDC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='duration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (days)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      placeholder='Duration in days'
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      value={field.value ?? ''}
                      disabled={isImmutable || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h2 className='text-lg font-semibold mb-2'>Advance Information</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='experience'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isImmutable || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='BEGINNER'>Beginner</SelectItem>
                      <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
                      <SelectItem value='ADVANCED'>Advanced</SelectItem>
                      <SelectItem value='EXPERT'>Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Job location'
                      disabled={isImmutable || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <div className='mt-2 border rounded-md'>
                  <MdxEditor
                    markdown={field.value}
                    onChange={field.onChange}
                    contentEditableClassName='prose max-w-full min-h-[300px]'
                    readOnly={isImmutable || isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='w-full sm:w-auto'
          disabled={isImmutable || isLoading}
        >
          {isLoading ? 'Processing...' : isEdit ? 'Update Job' : 'Post Job'}
          <ArrowRightIcon className='ml-2 h-4 w-4' />
        </Button>
      </form>
    </Form>
  );
}
