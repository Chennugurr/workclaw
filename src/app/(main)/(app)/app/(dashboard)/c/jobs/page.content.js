'use client';

import numeral from 'numeral';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Sliders } from 'lucide-react';
import { CURRENCY } from '@/constants';
import usePaginateSWR from '@/hooks/use-paginate-swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/pagination';
import JobPositionBadge from '@/components/job-position-badge';

const popularSearches = [
  'Front-end',
  'Back-end',
  'Development',
  'PHP',
  'Laravel',
  'Bootstrap',
  'Developer',
  'Team Lead',
  'Product Testing',
  'Javascript',
];

export default function PageContent() {
  const params = useSearchParams();
  const {
    data: jobs,
    pagination,
    isLoading,
  } = usePaginateSWR(`/search/jobs`, {
    params: {
      searchTerm: params.get('searchTerm'),
      page: params.get('page') || 1,
      limit: params.get('limit') || 15,
      sort: params.get('sort') || 'createdAt',
      order: params.get('order') || 'desc',
      orgId: params.get('orgId'),
      status: params.get('status') || 'open',
      position: params.get('position'),
      experience: params.get('experience'),
    },
  });

  return (
    <>
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='relative flex-grow'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <Input
            className='pl-10'
            placeholder='Search by: Job title, Position, Keyword...'
          />
        </div>
        <div className='relative flex-grow'>
          <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <Input className='pl-10' placeholder='City, state or zip code' />
        </div>
        <Button variant='outline' className='md:w-auto'>
          <Sliders className='mr-2 h-4 w-4' />
          Filters
        </Button>
        <Button className='md:w-auto'>Find Job</Button>
      </div>

      <div className='mb-6'>
        <h2 className='text-sm text-gray-500 mb-2'>Popular searches:</h2>
        <div className='flex flex-wrap gap-2'>
          {popularSearches.map((search, index) => (
            <Badge key={index} variant='secondary' className='cursor-pointer'>
              {search}
            </Badge>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6'>
        {isLoading ? (
          <p>Loading jobs...</p>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className='p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <Link href={`/app/c/jobs/${job.id}`}>
                      <h3 className='font-semibold'>{job.title}</h3>
                    </Link>
                    <div className='flex items-center gap-2'>
                      <JobPositionBadge position={job.position} />
                      {job.budget && (
                        <p className='text-sm text-gray-500'>
                          Budget: {numeral(job.budget).format('0,0.00a')}{' '}
                          {CURRENCY[job.currency]}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant='ghost' size='icon' className='h-6 w-6'>
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
                        d='M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z'
                      />
                    </svg>
                  </Button>
                </div>
                <div className='flex items-center'>
                  {job.org.logo ? (
                    <img
                      src={job.org.logo}
                      alt={job.org.name}
                      className='h-4 w-4 mr-2'
                    />
                  ) : (
                    <div className='h-4 w-4 mr-2 bg-gray-200 rounded-full'></div>
                  )}
                  <span className='text-sm'>{job.org.name}</span>
                </div>
                {job.location && (
                  <div className='flex items-center mt-1'>
                    <MapPin className='h-4 w-4 mr-2 text-gray-400' />
                    <span className='text-sm text-gray-500'>
                      {job.location}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center items-center mt-6'>
          <Pagination pagination={pagination} />
        </div>
      )}
    </>
  );
}
