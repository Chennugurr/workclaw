'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { useAppDispatch, useAppState } from '@/store';
import useAppSWR from '@/hooks/use-app-swr';
import { ACTIONS } from '@/store/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { MdxEditor } from '@/components/mdx-editor';
import { TOAST_IDS } from '@/constants';

const orgSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  bio: z.string().optional(),
});

export default function PageContent() {
  const mdxEditorRef = useRef(null);
  const orgId = useAppState((s) => s.organization.selected.id);
  const dispatch = useAppDispatch();
  const { data: org, isLoading } = useAppSWR(`/orgs/${orgId}`);
  const [logo, setLogo] = useState('/placeholder.svg?height=200&width=200');
  const [banner, setBanner] = useState('/placeholder.svg?height=200&width=800');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (org) {
      form.reset(
        {
          name: org.name || '',
          bio: org.bio || '',
        },
        {
          keepDirtyValues: true,
          keepDirty: true,
          keepTouched: true,
        }
      );
      if (org.bio) mdxEditorRef.current.setMarkdown(org.bio);
      if (org.logo) setLogo(org.logo);
      if (org.banner) setBanner(org.banner);
    }
  }, [org, form]);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
    }
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBanner(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Updating organization...', {
      id: TOAST_IDS.UPDATE_ORGANIZATION,
    });
    try {
      const res = await axios.patch(`/orgs/${org.id}`, data);
      if (res.data.status === 'success') {
        await dispatch({ type: ACTIONS.ORGANIZATIONS.FETCH });
        toast.success('Organization updated successfully', { id: toastId });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update organization. Please try again.',
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* TODO: impl logo and banner upload */}
        {/* <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='md:col-span-1'>
                <Label
                  htmlFor='logo-upload'
                  className='block mb-2 font-semibold'
                >
                  Upload Logo
                </Label>
                <div className='relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors'>
                  <div className='aspect-square w-full relative'>
                    <Image
                      src={logo}
                      alt='Company Logo'
                      layout='fill'
                      objectFit='contain'
                      className='rounded-lg'
                    />
                  </div>
                  <Input
                    id='logo-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleLogoUpload}
                    className='absolute inset-0 opacity-0 cursor-pointer'
                    disabled={isSubmitting}
                  />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='bg-white bg-opacity-75 rounded-full p-2'>
                      <Upload className='h-6 w-6 text-gray-600' />
                    </div>
                  </div>
                </div>
                <div className='flex items-center justify-between mt-2'>
                  <span className='text-sm text-gray-500'>3.5 MB</span>
                  <div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-blue-500 hover:text-blue-600'
                      disabled={isSubmitting}
                    >
                      <Upload className='h-4 w-4 mr-1' /> Replace
                    </Button>
                  </div>
                </div>
              </div>
              <div className='md:col-span-3'>
                <Label
                  htmlFor='banner-upload'
                  className='block mb-2 font-semibold'
                >
                  Banner Image
                </Label>
                <div className='relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors'>
                  <div className='aspect-[21/5.65] w-full relative'>
                    <Image
                      src={banner}
                      alt='Banner Image'
                      layout='fill'
                      objectFit='cover'
                      className='rounded-lg'
                    />
                  </div>
                  <Input
                    id='banner-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleBannerUpload}
                    className='absolute inset-0 opacity-0 cursor-pointer'
                    disabled={isSubmitting}
                  />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='bg-white bg-opacity-75 rounded-full p-2'>
                      <Upload className='h-6 w-6 text-gray-600' />
                    </div>
                  </div>
                </div>
                <div className='flex items-center justify-between mt-2'>
                  <span className='text-sm text-gray-500'>4.3 MB</span>
                  <div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-blue-500 hover:text-blue-600'
                      disabled={isSubmitting}
                    >
                      <Upload className='h-4 w-4 mr-1' /> Replace
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card className='mb-6'>
          <CardContent className='space-y-4 p-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your company name'
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='bio'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About us</FormLabel>
                  <FormControl>
                    <div className='border rounded-md'>
                      <MdxEditor
                        ref={mdxEditorRef}
                        markdown={field.value}
                        onChange={field.onChange}
                        placeholder='Write down about your company here. Let the candidate know who we are...'
                        contentEditableClassName='prose max-w-full min-h-[300px]'
                        readOnly={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type='submit'
          size='lg'
          className='w-full sm:w-auto'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
