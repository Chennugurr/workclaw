'use client';

import { z } from 'zod';
import { useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Link } from 'lucide-react';
import axios from '@/lib/axios';
import { ACTIONS } from '@/store/constants';
import { useAppDispatch, useAppState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { TOAST_IDS } from '@/constants';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  middleName: z.string().max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50),
  title: z.string().min(1, 'Title is required'),
  education: z.enum([
    'HIGH_SCHOOL',
    'ASSOCIATE_DEGREE',
    'BACHELOR_DEGREE',
    'MASTER_DEGREE',
    'DOCTORATE',
    'PROFESSIONAL_CERTIFICATION',
    'VOCATIONAL_TRAINING',
    'OTHER',
  ]),
  experience: z.enum([
    'INTERNSHIP',
    'ENTRY_LEVEL',
    'MID_LEVEL',
    'SENIOR_LEVEL',
    'MANAGEMENT',
    'DIRECTOR',
    'EXECUTIVE',
    'CONSULTANT',
    'FREELANCE',
  ]),
  website: z.string().url().optional().or(z.literal('')),
});

export default function PageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAppState((s) => s.user);
  const dispatch = useAppDispatch();
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      middleName: user?.profile?.middleName || '',
      lastName: user?.profile?.lastName || '',
      title: user?.profile?.title || '',
      education: user?.profile?.education || '',
      experience: user?.profile?.experience || '',
      website: user?.profile?.website || '',
    },
  });

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Updating profile...', {
      id: TOAST_IDS.UPDATE_PROFILE,
    });
    try {
      const method = !user.profile ? 'post' : 'patch';
      const res = await axios[method](`/users/${user.id}/profile`, data);
      if (res.data.status === 'success') {
        // Revalidate the user profile
        await dispatch({ type: ACTIONS.USER.FETCH });
        toast.success('Profile updated successfully', { id: toastId });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update profile. Please try again.',
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useLayoutEffect(() => {
    if (user?.profile) {
      form.reset(
        {
          firstName: user.profile.firstName || '',
          middleName: user.profile.middleName || '',
          lastName: user.profile.lastName || '',
          title: user.profile.title || '',
          education: user.profile.education || '',
          experience: user.profile.experience || '',
          website: user.profile.website || '',
        },
        {
          keepDirtyValues: true,
          keepDirty: true,
          keepTouched: true,
        }
      );
    }
  }, [user, form]);

  return (
    <div className='space-y-8'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <section>
            <h2 className='text-2xl font-semibold mb-4'>Basic Information</h2>
            <div className='grid grid-cols-1 gap-6'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First name <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='John' {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='middleName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle name</FormLabel>
                        <FormControl>
                          <Input placeholder='A.' {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last name <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='Doe' {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title/headline <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Software Engineer' {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='education'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select...' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='HIGH_SCHOOL'>
                              High School
                            </SelectItem>
                            <SelectItem value='ASSOCIATE_DEGREE'>
                              Associate Degree
                            </SelectItem>
                            <SelectItem value='BACHELOR_DEGREE'>
                              Bachelor&apos;s Degree
                            </SelectItem>
                            <SelectItem value='MASTER_DEGREE'>
                              Master&apos;s Degree
                            </SelectItem>
                            <SelectItem value='DOCTORATE'>Doctorate</SelectItem>
                            <SelectItem value='PROFESSIONAL_CERTIFICATION'>
                              Professional Certification
                            </SelectItem>
                            <SelectItem value='VOCATIONAL_TRAINING'>
                              Vocational Training
                            </SelectItem>
                            <SelectItem value='OTHER'>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='experience'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select...' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='INTERNSHIP'>
                              Internship
                            </SelectItem>
                            <SelectItem value='ENTRY_LEVEL'>
                              Entry Level
                            </SelectItem>
                            <SelectItem value='MID_LEVEL'>Mid Level</SelectItem>
                            <SelectItem value='SENIOR_LEVEL'>
                              Senior Level
                            </SelectItem>
                            <SelectItem value='MANAGEMENT'>
                              Management
                            </SelectItem>
                            <SelectItem value='DIRECTOR'>Director</SelectItem>
                            <SelectItem value='EXECUTIVE'>Executive</SelectItem>
                            <SelectItem value='CONSULTANT'>
                              Consultant
                            </SelectItem>
                            <SelectItem value='FREELANCE'>Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Website</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            className='pl-10'
                            placeholder='Website url...'
                            {...field}
                            disabled={isSubmitting}
                          />
                          <Link className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          <Button type='submit' className='w-full sm:w-auto mt-6' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
