'use client';

import { z } from 'zod';
import { useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  // CloudUpload,
  Link,
  // FileText,
  // MoreVertical,
  // Pencil,
  // Trash2,
} from 'lucide-react';
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
// import { Card, CardContent } from '@/components/ui/card';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
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
  // const [resumes, setResumes] = useState([
  //   { name: 'Professional Resume', size: '3.5 MB' },
  //   { name: 'Product Designer', size: '4.7 MB' },
  //   { name: 'Visual Designer', size: '1.3 MB' },
  // ]);

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
              {/* TODO: impl profile picture upload */}
              {/* <div className='col-span-1'>
                <Label htmlFor='profile-picture'>Profile Picture</Label>
                <div className='mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center'>
                  <CloudUpload className='w-12 h-12 text-gray-400 mb-2' />
                  <p className='text-sm font-medium'>
                    Browse photo or drop here
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    A photo larger than 400 pixels work best. Max photo size 5
                    MB.
                  </p>
                  <input
                    id='profile-picture'
                    type='file'
                    className='hidden'
                    accept='image/*'
                  />
                </div>
              </div> */}
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

          {/* TODO: impl resumes */}
          {/* <section>
            <h2 className='text-2xl font-semibold mb-4'>Your CV/Resume</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {resumes.map((resume, index) => (
                <Card key={index}>
                  <CardContent className='p-4 flex items-center justify-between'>
                    <div className='flex items-center'>
                      <FileText className='w-8 h-8 text-blue-500 mr-3' />
                      <div>
                        <p className='font-medium'>{resume.name}</p>
                        <p className='text-sm text-gray-500'>{resume.size}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem>
                          <Pencil className='mr-2 h-4 w-4' /> Edit Resume
                        </DropdownMenuItem>
                        <DropdownMenuItem className='text-red-600'>
                          <Trash2 className='mr-2 h-4 w-4' /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
              <Card>
                <CardContent className='p-4 flex items-center justify-center h-full'>
                  <label
                    htmlFor='add-resume'
                    className='cursor-pointer flex flex-col items-center'
                  >
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2'>
                      <span className='text-blue-500 text-xl font-bold'>+</span>
                    </div>
                    <p className='font-medium'>Add CV/Resume</p>
                    <p className='text-sm text-gray-500'>
                      Browse file or drop here, only pdf
                    </p>
                    <input
                      id='add-resume'
                      type='file'
                      className='hidden'
                      accept='.pdf'
                    />
                  </label>
                </CardContent>
              </Card>
            </div>
          </section> */}

          <Button type='submit' className='w-full sm:w-auto mt-6' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
