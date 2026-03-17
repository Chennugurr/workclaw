'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import FeatureComingSoon from '@/components/feature-coming-soon';

export default function PageContent() {
  const [biography, setBiography] = useState('');

  // TODO: impl page
  return <FeatureComingSoon />;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <Label htmlFor='nationality'>Nationality</Label>
          <Select>
            <SelectTrigger className='w-full mt-1'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='us'>United States</SelectItem>
              <SelectItem value='uk'>United Kingdom</SelectItem>
              <SelectItem value='ca'>Canada</SelectItem>
              {/* Add more countries as needed */}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='dateOfBirth'>Date of Birth</Label>
          <div className='relative mt-1'>
            <Input
              id='dateOfBirth'
              type='text'
              placeholder='dd/mm/yyyy'
              className='w-full pr-10'
            />
            <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <Label htmlFor='gender'>Gender</Label>
          <Select>
            <SelectTrigger className='w-full mt-1'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='male'>Male</SelectItem>
              <SelectItem value='female'>Female</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
              <SelectItem value='prefer-not-to-say'>
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='maritalStatus'>Marital Status</Label>
          <Select>
            <SelectTrigger className='w-full mt-1'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='single'>Single</SelectItem>
              <SelectItem value='married'>Married</SelectItem>
              <SelectItem value='divorced'>Divorced</SelectItem>
              <SelectItem value='widowed'>Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <Label htmlFor='education'>Education</Label>
          <Select>
            <SelectTrigger className='w-full mt-1'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='high-school'>High School</SelectItem>
              <SelectItem value='bachelors'>Bachelor&apos;s Degree</SelectItem>
              <SelectItem value='masters'>Master&apos;s Degree</SelectItem>
              <SelectItem value='phd'>Ph.D.</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='experience'>Experience</Label>
          <Select>
            <SelectTrigger className='w-full mt-1'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='0-1'>0-1 years</SelectItem>
              <SelectItem value='1-3'>1-3 years</SelectItem>
              <SelectItem value='3-5'>3-5 years</SelectItem>
              <SelectItem value='5-10'>5-10 years</SelectItem>
              <SelectItem value='10+'>10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor='biography'>Biography</Label>
        <Textarea
          id='biography'
          placeholder='Write down your biography here. Let the employers know who you are...'
          className='mt-1 h-40'
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
        />
        <div className='flex items-center mt-2 space-x-2'>
          <Button variant='outline' size='sm'>
            B
          </Button>
          <Button variant='outline' size='sm'>
            I
          </Button>
          <Button variant='outline' size='sm'>
            U
          </Button>
          <Button variant='outline' size='sm'>
            S
          </Button>
          <Button variant='outline' size='sm'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-4 h-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244'
              />
            </svg>
          </Button>
          <Button variant='outline' size='sm'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-4 h-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
              />
            </svg>
          </Button>
          <Button variant='outline' size='sm'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-4 h-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12'
              />
            </svg>
          </Button>
        </div>
      </div>

      <Button className='w-full sm:w-auto'>Save Changes</Button>
    </div>
  );
}
