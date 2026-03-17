'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Sliders } from 'lucide-react';
import usePaginateSWR from '@/hooks/use-paginate-swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Pagination from '@/components/pagination';

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
    data: orgs,
    pagination,
    isLoading,
  } = usePaginateSWR(`/search/orgs`, {
    params: {
      page: params.get('page') || 1,
      limit: params.get('limit') || 15,
    },
  });

  return (
    <>
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='relative flex-grow'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <Input
            className='pl-10'
            placeholder='Search by: Company name, Industry, Keyword...'
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
        <Button className='md:w-auto'>Find Employer</Button>
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

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {isLoading ? (
          <p>Loading organizations...</p>
        ) : orgs && orgs.length > 0 ? (
          orgs.map((org) => (
            <Card key={org.id}>
              <CardContent className='p-4'>
                <div className='flex items-start mb-4'>
                  <div className='bg-gray-200 rounded-md p-2 mr-3'>
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className='w-8 h-8 object-cover'
                      />
                    ) : (
                      <svg
                        className='w-8 h-8 text-gray-400'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                      </svg>
                    )}
                  </div>
                  <div className='flex-grow'>
                    <Link href={`/app/c/employers/${org.id}`}>
                      <h3 className='font-semibold text-lg'>{org.name}</h3>
                    </Link>
                    <div className='flex items-center text-gray-500 text-sm'>
                      <MapPin className='w-4 h-4 mr-1' />
                      {org.location || 'Location not specified'}
                    </div>
                  </div>
                </div>
                <Button
                  variant='secondary'
                  className='w-full bg-blue-50 hover:bg-blue-100 text-blue-600'
                  asChild
                >
                  <Link href={`/app/c/jobs?orgId=${org.id}&status=OPEN`}>
                    Open Positions ({org._count.jobs || 0})
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No organizations found.</p>
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
