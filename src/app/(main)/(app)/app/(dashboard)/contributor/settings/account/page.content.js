'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Briefcase } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import FeatureComingSoon from '@/components/feature-coming-soon';

export default function PageContent() {
  const [profilePrivacy, setProfilePrivacy] = useState(true);
  const [resumePrivacy, setResumePrivacy] = useState(false);

  // TODO: impl page
  return <FeatureComingSoon />;

  return (
    <div className='space-y-8'>
      <section>
        <h2 className='text-2xl font-semibold mb-4'>Contact Info</h2>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='mapLocation'>Map Location</Label>
            <div className='relative'>
              <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <Input
                id='mapLocation'
                className='pl-10'
                placeholder='Enter your location'
              />
            </div>
          </div>
          <div>
            <Label htmlFor='phone'>Phone</Label>
            <div className='flex'>
              <Select>
                <SelectTrigger className='w-[100px]'>
                  <SelectValue placeholder='+880' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='+880'>+880</SelectItem>
                  <SelectItem value='+1'>+1</SelectItem>
                  <SelectItem value='+44'>+44</SelectItem>
                </SelectContent>
              </Select>
              <div className='relative flex-grow ml-2'>
                <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <Input
                  id='phone'
                  className='pl-10'
                  placeholder='Phone number..'
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor='email'>Email</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <Input
                id='email'
                type='email'
                className='pl-10'
                placeholder='Email address'
              />
            </div>
          </div>
        </div>
        <Button className='mt-4'>Save Changes</Button>
      </section>

      <Separator className='my-8' />

      <section>
        <h2 className='text-2xl font-semibold mb-4'>Notification</h2>
        <div className='space-y-2'>
          <div className='flex items-center'>
            <Checkbox id='shortlisted' />
            <label htmlFor='shortlisted' className='ml-2'>
              Notify me when employers shortlisted me
            </label>
          </div>
          <div className='flex items-center'>
            <Checkbox id='savedProfile' />
            <label htmlFor='savedProfile' className='ml-2'>
              Notify me when employers saved my profile
            </label>
          </div>
          <div className='flex items-center'>
            <Checkbox id='jobsExpire' />
            <label htmlFor='jobsExpire' className='ml-2'>
              Notify me when my applied jobs are expire
            </label>
          </div>
          <div className='flex items-center'>
            <Checkbox id='rejected' defaultChecked />
            <label htmlFor='rejected' className='ml-2'>
              Notify me when employers rejected me
            </label>
          </div>
          <div className='flex items-center'>
            <Checkbox id='jobAlerts' defaultChecked />
            <label htmlFor='jobAlerts' className='ml-2'>
              Notify me when i have up to 5 job alerts
            </label>
          </div>
        </div>
      </section>

      <Separator className='my-8' />

      <section>
        <h2 className='text-2xl font-semibold mb-4'>Job Alerts</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='role'>Role</Label>
            <div className='relative'>
              <Briefcase className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <Input id='role' className='pl-10' placeholder='Your job roles' />
            </div>
          </div>
          <div>
            <Label htmlFor='location'>Location</Label>
            <div className='relative'>
              <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <Input
                id='location'
                className='pl-10'
                placeholder='City, state, country name'
              />
            </div>
          </div>
        </div>
        <Button className='mt-4'>Save Changes</Button>
      </section>

      <Separator className='my-8' />

      <section className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div>
          <h2 className='text-2xl font-semibold mb-4'>Profile Privacy</h2>
          <div className='flex items-center justify-between'>
            <Label htmlFor='profilePrivacy'>Your profile is public now</Label>
            <Switch
              id='profilePrivacy'
              checked={profilePrivacy}
              onCheckedChange={setProfilePrivacy}
            />
          </div>
        </div>
        <div>
          <h2 className='text-2xl font-semibold mb-4'>Resume Privacy</h2>
          <div className='flex items-center justify-between'>
            <Label htmlFor='resumePrivacy'>Your resume is private now</Label>
            <Switch
              id='resumePrivacy'
              checked={resumePrivacy}
              onCheckedChange={setResumePrivacy}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
