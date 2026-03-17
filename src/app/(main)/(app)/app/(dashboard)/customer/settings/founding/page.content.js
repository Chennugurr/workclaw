'use client';

import { useState } from 'react';
import {
  Calendar,
  Link,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FeatureComingSoon from '@/components/feature-coming-soon';

export default function PageContent() {
  const [establishmentDate, setEstablishmentDate] = useState('');

  // TODO: impl page
  return <FeatureComingSoon />;

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Founding Info Settings</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div>
          <Label htmlFor='organization-type'>Organization Type</Label>
          <Select>
            <SelectTrigger id='organization-type' className='w-full mt-1'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='corporation'>Corporation</SelectItem>
              <SelectItem value='llc'>LLC</SelectItem>
              <SelectItem value='partnership'>Partnership</SelectItem>
              <SelectItem value='sole-proprietorship'>
                Sole Proprietorship
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='industry-types'>Industry Types</Label>
          <Select>
            <SelectTrigger id='industry-types' className='w-full mt-1'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='technology'>Technology</SelectItem>
              <SelectItem value='finance'>Finance</SelectItem>
              <SelectItem value='healthcare'>Healthcare</SelectItem>
              <SelectItem value='education'>Education</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='team-size'>Team Size</Label>
          <Select>
            <SelectTrigger id='team-size' className='w-full mt-1'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1-10'>1-10 employees</SelectItem>
              <SelectItem value='11-50'>11-50 employees</SelectItem>
              <SelectItem value='51-200'>51-200 employees</SelectItem>
              <SelectItem value='201-500'>201-500 employees</SelectItem>
              <SelectItem value='501+'>501+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div>
          <Label htmlFor='establishment-date'>Year of Establishment</Label>
          <div className='relative mt-1'>
            <Input
              id='establishment-date'
              type='text'
              placeholder='dd/mm/yyyy'
              value={establishmentDate}
              onChange={(e) => setEstablishmentDate(e.target.value)}
              className='w-full pr-10'
            />
            <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          </div>
        </div>

        <div>
          <Label htmlFor='company-website'>Company Website</Label>
          <div className='relative mt-1'>
            <Input
              id='company-website'
              type='url'
              placeholder='Website url...'
              className='w-full pl-10'
            />
            <Link className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          </div>
        </div>
      </div>

      <div className='mb-6'>
        <Label htmlFor='company-vision'>Company Vision</Label>
        <Textarea
          id='company-vision'
          placeholder='Tell us what Vision of your company...'
          className='mt-1 min-h-[200px]'
        />
        <div className='flex space-x-2 mt-2'>
          <Button variant='outline' size='icon'>
            <Bold className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon'>
            <Italic className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon'>
            <Underline className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon'>
            <Strikethrough className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon'>
            <Link className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon'>
            <List className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon'>
            <ListOrdered className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <Button size='lg' className='w-full sm:w-auto'>
        Save Changes
      </Button>
    </>
  );
}
