'use client';

import dayjs from 'dayjs';
import numeral from 'numeral';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  Bookmark,
  Bell,
  MapPin,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { useAppState } from '@/store';
import { CURRENCY } from '@/constants';
import useAppSWR from '@/hooks/use-app-swr';
import usePaginateSWR from '@/hooks/use-paginate-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import JobPositionBadge from '@/components/job-position-badge';
import ProposalStatusBadge from '@/components/proposal-status-badge';

export default function PageContent() {
  const user = useAppState((s) => s.user);
  const { data: analytics } = useAppSWR(`/analytics/candidates/${user.id}`);
  const { data: proposals, isLoading } = usePaginateSWR(`/search/proposals`, {
    params: {
      limit: 5,
      userId: user.id,
    },
  });

  return (
    <>
      <h1 className='text-2xl font-bold mb-2'>
        Hello, {user.profile.firstName}
      </h1>
      <p className='text-gray-500 mb-6'>
        Here is your daily activities and job alerts
      </p>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card className='bg-blue-50'>
          <CardContent className='p-6 flex justify-between items-center'>
            <div>
              <p className='text-3xl font-bold'>
                {analytics?.totalProposals || 0}
              </p>
              <p className='text-gray-500'>Applied jobs</p>
            </div>
            <div className='bg-white p-3 rounded-lg'>
              <Briefcase className='h-6 w-6 text-blue-500' />
            </div>
          </CardContent>
        </Card>
        <Card className='bg-yellow-50'>
          <CardContent className='p-6 flex justify-between items-center'>
            <div>
              <p className='text-3xl font-bold'>0</p>
              <p className='text-gray-500'>Favorite jobs</p>
            </div>
            <div className='bg-white p-3 rounded-lg'>
              <Bookmark className='h-6 w-6 text-yellow-500' />
            </div>
          </CardContent>
        </Card>
        <Card className='bg-green-50'>
          <CardContent className='p-6 flex justify-between items-center'>
            <div>
              <p className='text-3xl font-bold'>0</p>
              <p className='text-gray-500'>Job Alerts</p>
            </div>
            <div className='bg-white p-3 rounded-lg'>
              <Bell className='h-6 w-6 text-green-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-red-500 text-white mb-6'>
        <CardContent className='p-6 flex flex-col md:flex-row justify-between items-center'>
          <div className='flex items-center mb-4 md:mb-0'>
            <Image
              src='/placeholder.svg?height=50&width=50'
              alt='Profile'
              width={50}
              height={50}
              className='rounded-full mr-4'
            />
            <div>
              <h2 className='text-xl font-bold'>
                Your profile editing is not completed.
              </h2>
              <p>Complete your profile editing & build your custom Resume</p>
            </div>
          </div>
          <Button variant='secondary' className='whitespace-nowrap'>
            Edit Profile
            <ChevronRight className='ml-2 h-4 w-4' />
          </Button>
        </CardContent>
      </Card>

      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>Recently Applied</h2>
        <Button variant='link' className='text-blue-500' asChild>
          <Link href='/app/c/applied'>
            View all
            <ChevronRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>

      <div className='hidden md:block overflow-x-auto'>
        <div className='min-w-[800px] lg:min-w-full'>
          <table className='w-full'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='text-left p-4 font-semibold text-gray-600'>
                  Job
                </th>
                <th className='text-left p-4 font-semibold text-gray-600'>
                  Date Applied
                </th>
                <th className='text-left p-4 font-semibold text-gray-600'>
                  Status
                </th>
                <th className='text-left p-4 font-semibold text-gray-600'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {proposals?.map((item) => (
                <tr
                  key={item.id}
                  className='border-b hover:bg-blue-50 hover:border hover:border-blue-200'
                >
                  <td className='p-4'>
                    <div className='flex items-center'>
                      {item.job.org.logo ? (
                        <img
                          src={item.job.org.logo}
                          alt={`${item.job.org.name} logo`}
                          className='w-12 h-12 rounded-md mr-3 object-cover'
                        />
                      ) : (
                        <div className='bg-gray-200 rounded-md p-2 mr-3'>
                          <Briefcase className='w-8 h-8 text-gray-600' />
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center'>
                          <p className='font-semibold text-gray-800 truncate mr-2'>
                            {item.job.title}
                          </p>
                          <JobPositionBadge position={item.job.position} />
                        </div>
                        <div className='flex items-center text-sm text-gray-500 mt-1'>
                          {item.job.location && (
                            <>
                              <MapPin className='flex-shrink-0 w-4 h-4 mr-1' />
                              <span className='truncate mr-2'>
                                {item.job.location}
                              </span>
                            </>
                          )}
                          {item.job.budget && (
                            <>
                              <DollarSign className='flex-shrink-0 w-4 h-4 mr-1' />
                              <span className='truncate'>
                                {numeral(item.job.budget).format(`0,0.00a`)}{' '}
                                {CURRENCY[item.job.currency]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='p-4 text-gray-500 truncate'>
                    {dayjs(item.createdAt).format('MMM D, YYYY HH:mm')}
                  </td>
                  <td className='p-4'>
                    <ProposalStatusBadge status={item.status} />
                  </td>
                  <td className='p-4'>
                    <Button
                      variant='link'
                      className='text-blue-600 font-semibold whitespace-nowrap'
                      asChild
                    >
                      <Link href={`/app/c/jobs/${item.job.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='md:hidden space-y-4'>
        {proposals?.map((item) => (
          <Card key={item.id} className='hover:border-2 hover:border-blue-200'>
            <CardContent className='p-4'>
              <div className='flex items-start'>
                {item.job.org.logo ? (
                  <img
                    src={item.job.org.logo}
                    alt={`${item.job.org.name} logo`}
                    className='w-12 h-12 rounded-md mr-3 object-cover'
                  />
                ) : (
                  <div className='bg-gray-200 rounded-md p-2 mr-3'>
                    <Briefcase className='w-8 h-8 text-gray-600' />
                  </div>
                )}
                <div className='flex-grow'>
                  <div className='flex items-center flex-wrap'>
                    <p className='font-semibold text-gray-800 mr-2'>
                      {item.job.title}
                    </p>
                    <JobPositionBadge position={item.job.position} />
                  </div>
                  <div className='flex items-center text-sm text-gray-500 mt-1 flex-wrap'>
                    {item.job.location && (
                      <div className='flex items-center mr-2 mb-1'>
                        <MapPin className='w-4 h-4 mr-1' />
                        <span>{item.job.location}</span>
                      </div>
                    )}
                    {item.job.budget && (
                      <div className='flex items-center mb-1'>
                        <DollarSign className='w-4 h-4 mr-1' />
                        <span>
                          {numeral(item.job.budget).format(`0,0.00a`)}{' '}
                          {CURRENCY[item.job.currency]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className='mt-3 flex justify-between items-center'>
                <div>
                  <p className='text-sm text-gray-500'>Applied on</p>
                  <p className='font-semibold'>
                    {dayjs(item.createdAt).format('MMM D, YYYY HH:mm')}
                  </p>
                </div>
                <ProposalStatusBadge status={item.status} />
              </div>
              <Button
                className='w-full mt-3 bg-blue-600 text-white hover:bg-blue-700'
                asChild
              >
                <Link href={`/app/c/jobs/${item.job.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
