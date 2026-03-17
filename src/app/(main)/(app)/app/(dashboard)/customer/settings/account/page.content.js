import { MapPin, Phone, Mail, AlertCircle } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FeatureComingSoon from '@/components/feature-coming-soon';

export default function PageContent() {
  // TODO: impl page
  return <FeatureComingSoon />;

  return (
    <>
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='map-location'>Map Location</Label>
            <div className='relative mt-1'>
              <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <Input
                id='map-location'
                className='pl-10'
                placeholder='Enter your location'
              />
            </div>
          </div>
          <div>
            <Label htmlFor='phone'>Phone</Label>
            <div className='flex mt-1'>
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
            <div className='relative mt-1'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <Input
                id='email'
                type='email'
                className='pl-10'
                placeholder='Email address'
              />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Your Company</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-gray-600 mb-4'>
            If you delete your Workclaw account, you will no longer be able to
            get information about the matched jobs, following employers, and job
            alert, shortlisted jobs and more. You will be abandoned from all the
            services of Workclaw.com.
          </p>
          <Button variant='destructive' className='flex items-center'>
            <AlertCircle className='mr-2 h-4 w-4' />
            Close Account
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
