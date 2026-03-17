'use client';

import { Shield, AlertCircle } from 'lucide-react';
import { useAppState } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PageContent() {
  const user = useAppState((s) => s.user);

  return (
    <div className='space-y-8'>
      <section>
        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          Account Security
        </h2>
        <Card>
          <CardContent className='p-5 space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Connected Wallet</p>
                <p className='text-sm text-gray-500 font-mono'>
                  {user?.address
                    ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
                    : 'No wallet connected'}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <p className='font-medium'>Account Role</p>
              <p className='text-sm text-gray-500'>{user?.role || 'Customer'}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className='text-xl font-semibold mb-4 text-red-600 flex items-center gap-2'>
          <AlertCircle className='h-5 w-5' />
          Danger Zone
        </h2>
        <Card className='border-red-200'>
          <CardContent className='p-5'>
            <p className='text-sm text-gray-600 mb-4'>
              Deleting your organization will permanently remove all projects, tasks,
              and associated data. This action cannot be undone.
            </p>
            <Button variant='destructive' disabled>
              <AlertCircle className='mr-2 h-4 w-4' />
              Delete Organization
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
