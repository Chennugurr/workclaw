'use client';

import dayjs from 'dayjs';
import numeral from 'numeral';
import Link from 'next/link';
import {
  Users,
  MapPin,
  DollarSign,
  MoreVertical,
  Eye,
  Settings2,
} from 'lucide-react';
import { useAppState } from '@/store';
import { CURRENCY } from '@/constants';
import usePaginateSWR from '@/hooks/use-paginate-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import JobPositionBadge from '@/components/job-position-badge';
import JobStatusBadge from '@/components/job-status-badge';
import Pagination from '@/components/pagination';

export default function PageContent() {
  const { organization: org } = useAppState();
  const {
    data: jobs,
    isLoading,
    pagination,
  } = usePaginateSWR(`/search/jobs`, {
    params: {
      orgId: org.selected.id,
    },
  });

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>
          Jobs ({pagination?.totalCount || 0})
        </h2>

        <div className='flex items-center space-x-4 w-full sm:w-auto'>
          <label
            htmlFor='jobStatus'
            className='text-sm font-medium text-gray-700 sr-only'
          >
            Job status
          </label>
          <Select>
            <SelectTrigger className='w-full sm:w-[180px]' id='jobStatus'>
              <SelectValue placeholder='All Jobs' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Jobs</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
              <SelectItem value='expired'>Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                  Date Posted
                </th>
                <th className='text-left p-4 font-semibold text-gray-600'>
                  Status
                </th>
                <th className='text-left p-4 font-semibold text-gray-600'>
                  Applicants
                </th>
                <th className='text-left p-4 font-semibold text-gray-600'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs?.map((job) => (
                <tr
                  key={job.id}
                  className='border-b hover:bg-blue-50 hover:border hover:border-blue-200'
                >
                  <td className='p-4'>
                    <div className='flex items-center'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center'>
                          <p className='font-semibold text-gray-800 truncate mr-2'>
                            {job.title}
                          </p>
                          <JobPositionBadge position={job.position} />
                        </div>
                        <div className='flex items-center text-sm text-gray-500 mt-1'>
                          {job.location && (
                            <>
                              <MapPin className='flex-shrink-0 w-4 h-4 mr-1' />
                              <span className='truncate mr-2'>
                                {job.location}
                              </span>
                            </>
                          )}
                          {job.budget && (
                            <>
                              <DollarSign className='flex-shrink-0 w-4 h-4 mr-1' />
                              <span className='truncate'>
                                {numeral(job.budget).format(`0,0.00a`)}{' '}
                                {CURRENCY[job.currency]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='p-4 text-gray-500 truncate'>
                    {dayjs(job.createdAt).format('MMM D, YYYY HH:mm')}
                  </td>
                  <td className='p-4'>
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className='p-4 text-gray-500'>
                    {numeral(job._count.proposals || 0).format('0,0a')}
                  </td>
                  <td className='p-4'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem className='cursor-pointer' asChild>
                          <Link
                            href={`/app/contributor/opportunities/${job.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <Eye className='mr-2 h-4 w-4' /> View Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className='cursor-pointer' asChild>
                          <Link href={`/app/customer/projects/${job.id}/edit`}>
                            <Settings2 className='mr-2 h-4 w-4' /> Manage
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className='cursor-pointer' asChild>
                          <Link href={`/app/customer/projects/${job.id}/applications`}>
                            <Users className='mr-2 h-4 w-4' /> Applicants
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='md:hidden space-y-4'>
        {jobs?.map((job) => (
          <Card key={job.id} className='hover:border-2 hover:border-blue-200'>
            <CardContent className='p-4'>
              <div className='flex justify-between items-start'>
                <div className='flex-grow'>
                  <div className='flex items-center flex-wrap'>
                    <p className='font-semibold text-gray-800 mr-2'>
                      {job.title}
                    </p>
                    <JobPositionBadge position={job.position} />
                  </div>
                  <div className='flex items-center text-sm text-gray-500 mt-1 flex-wrap'>
                    {job.location && (
                      <div className='flex items-center mr-2 mb-1'>
                        <MapPin className='w-4 h-4 mr-1' />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.budget && (
                      <div className='flex items-center mb-1'>
                        <DollarSign className='w-4 h-4 mr-1' />
                        <span>
                          {numeral(job.budget).format(`0,0.00a`)}{' '}
                          {CURRENCY[job.currency]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem className='cursor-pointer' asChild>
                      <Link
                        href={`/app/contributor/opportunities/${job.id}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Eye className='mr-2 h-4 w-4' /> View Detail
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer' asChild>
                      <Link href={`/app/customer/projects/${job.id}/edit`}>
                        <Settings2 className='mr-2 h-4 w-4' /> Manage
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer' asChild>
                      <Link href={`/app/customer/projects/${job.id}/applications`}>
                        <Users className='mr-2 h-4 w-4' /> Applicants
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className='mt-3 flex justify-between items-center'>
                <div>
                  <p className='text-sm text-gray-500'>Posted on</p>
                  <p className='font-semibold'>
                    {dayjs(job.createdAt).format('MMM D, YYYY HH:mm')}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <div className='mt-3 flex justify-between items-center'>
                <div>
                  <p className='text-sm text-gray-500'>Applicants</p>
                  <p className='font-semibold'>
                    {numeral(job._count.proposals || 0).format('0,0a')}
                  </p>
                </div>
                <Button
                  className='bg-blue-600 text-white hover:bg-blue-700'
                  asChild
                >
                  <Link href={`/app/contributor/opportunities/${job.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center items-center mt-6'>
          <Pagination pagination={pagination} />
        </div>
      )}
    </>
  );
}
