'use client';

import _ from 'lodash';
import Case from 'case';
import dayjs from 'dayjs';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mutate } from 'swr';
// import { zeroAddress } from 'viem';
// import { readContract } from 'viem/actions';
// import { useClient, useWriteContract } from 'wagmi';
import { ProposalStatus } from '@prisma/client';
import Markdown from 'markdown-to-jsx';
import {
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  MessageCircleMore,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import { CONTRACT, CURRENCY, TOAST_IDS } from '@/constants';
import { parseBudget } from '@/lib/budget';
import useAppSWR from '@/hooks/use-app-swr';
import { nanoIdToInt } from '@/lib/utils/nanoid';
import usePaginateSWR from '@/hooks/use-paginate-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Pagination from '@/components/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ProposalStatusBadge from '@/components/proposal-status-badge';

const STATUSES = _.map(_.values(ProposalStatus), (status) => ({
  value: status,
  label: Case.title(status),
}));

export default function PageContent({ params }) {
  const { organization: org } = useAppState();
  const { data: jobAnalytics, isLoading } = useAppSWR(
    `/analytics/jobs/${params.id}`
  );

  const statusCounts = jobAnalytics?.proposals || {
    total: 0,
    applied: 0,
    withdrawn: 0,
    shortlisted: 0,
    archived: 0,
    hired: 0,
  };

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Job Applications ({statusCounts.total})
        </h1>
        <div className='flex space-x-2'>
          <Button variant='outline' disabled={isLoading}>
            <Filter className='mr-2 h-4 w-4' />
            Filter
          </Button>
          <Button disabled={isLoading}>
            <ArrowUpDown className='mr-2 h-4 w-4' />
            Sort
          </Button>
        </div>
      </div>

      <Tabs defaultValue={STATUSES[0].value} className='mb-6'>
        <TabsList className='flex-wrap h-auto'>
          {STATUSES.map((status) => (
            <TabsTrigger
              key={status.value}
              value={status.value}
              disabled={isLoading}
            >
              {status.label} ({statusCounts[status.value.toLowerCase()]})
            </TabsTrigger>
          ))}
        </TabsList>
        {STATUSES.map((status) => (
          <TabsContent key={status.value} value={status.value}>
            <ApplicationList
              orgId={org.selected.id}
              jobId={params.id}
              status={status.value}
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

function ApplicationList({ orgId, jobId, status }) {
  const {
    data: proposals,
    isLoading,
    pagination,
    mutate,
  } = usePaginateSWR(`/search/proposals`, {
    params: {
      limit: 9,
      orgId: orgId,
      jobId: jobId,
      status: status,
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6'>
        {proposals?.map((proposal) => (
          <ApplicantCard
            key={proposal.id}
            proposal={proposal}
            mutate={mutate}
          />
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

function ApplicantCard({ proposal, mutate: mutateProposals }) {
  // const client = useClient();
  // const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);

  const getAvailableStatuses = (status) => {
    switch (status) {
      case ProposalStatus.APPLIED:
        return [ProposalStatus.SHORTLISTED, ProposalStatus.ARCHIVED];
      case ProposalStatus.SHORTLISTED:
        return [ProposalStatus.APPLIED, ProposalStatus.ARCHIVED];
      case ProposalStatus.ARCHIVED:
        return [ProposalStatus.APPLIED, ProposalStatus.SHORTLISTED];
      default:
        return [];
    }
  };

  const handleStatusChange = async (status) => {
    setIsLoading(true);
    const toastId = toast.loading('Updating status...', {
      id: TOAST_IDS.UPDATE_PROPOSAL_STATUS,
    });
    try {
      const response = await axios.patch(
        `/orgs/${proposal.job.org.id}/jobs/${proposal.job.id}/proposals/${proposal.id}/status`,
        { status }
      );

      if (response.data.status === 'success') {
        toast.success(`Proposal status updated to ${Case.title(status)}`, {
          id: toastId,
        });
        mutate(`/analytics/jobs/${proposal.job.id}`);
        mutateProposals();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error(
        error?.response?.data?.message ||
          'Failed to update status. Please try again.',
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositAndHire = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Processing deposit and hire...', {
      id: TOAST_IDS.DEPOSIT_AND_HIRE,
    });
    try {
      const jobIdAsInt = nanoIdToInt(proposal.job.id);
      const currency = proposal.job.currency;
      // const isETH = currency === 'ETH';

      // // Read contract state
      // const exists = await readContract(client, {
      //   ...CONTRACT.ESCROW,
      //   functionName: 'jobExists',
      //   args: [jobIdAsInt],
      // });

      // if (exists) {
      //   const released = await readContract(client, {
      //     ...CONTRACT.ESCROW,
      //     functionName: 'jobReleased',
      //     args: [jobIdAsInt],
      //   });

      //   if (!released) {
      //     // Check if job details match
      //     const storedAmount = await readContract(client, {
      //       ...CONTRACT.ESCROW,
      //       functionName: 'mapJobToAmount',
      //       args: [jobIdAsInt],
      //     });
      //     const storedAssetIn = await readContract(client, {
      //       ...CONTRACT.ESCROW,
      //       functionName: 'mapJobToAssetIn',
      //       args: [jobIdAsInt],
      //     });

      //     const amount = parseBudget(proposal.job.budget, currency);
      //     const assetIn = isETH ? zeroAddress : CONTRACT.TOKEN.address;

      //     if (storedAmount !== amount || storedAssetIn !== assetIn) {
      //       toast.error('Job details do not match. Please contact support.', {
      //         id: toastId,
      //       });
      //       return;
      //     }

      //     // Job exists, is not released, and details match, just change status
      //     await handleStatusChange(ProposalStatus.HIRED);
      //     return;
      //   }
      // }

      // // Validate and deposit
      // const amount = parseBudget(
      //   proposal.budget || proposal.job.budget,
      //   currency
      // );
      // if (isETH) {
      //   await writeContractAsync({
      //     ...CONTRACT.ESCROW,
      //     functionName: 'depositETH',
      //     args: [proposal.user.address, jobIdAsInt],
      //     value: amount,
      //   });
      // } else {
      //   await writeContractAsync({
      //     ...CONTRACT.ESCROW,
      //     functionName: 'depositERC20',
      //     args: [
      //       CONTRACT.TOKEN.address,
      //       proposal.user.address,
      //       amount,
      //       jobIdAsInt,
      //       [CONTRACT.TOKEN.address],
      //     ],
      //   });
      // }

      toast.success('Deposit successful', { id: toastId });

      // Change status after successful deposit
      await handleStatusChange(ProposalStatus.HIRED);
    } catch (error) {
      console.error('Error in deposit and hire:', error);
      toast.error('Failed to deposit and hire. Please try again.', {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>
          <Link
            href={`/app/customer/contributors/${proposal.user.id}`}
            className='hover:underline'
          >
            {`${proposal.user.profile.firstName} ${proposal.user.profile.lastName}`}
          </Link>
        </CardTitle>
        {![ProposalStatus.WITHDRAWN, ProposalStatus.HIRED].includes(
          proposal.status
        ) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' disabled={isLoading}>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {_.map(getAvailableStatuses(proposal.status), (status) => (
                <DropdownMenuItem
                  key={status}
                  onSelect={() => handleStatusChange(status)}
                  disabled={isLoading}
                >
                  <ProposalStatusBadge status={status} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        <div className='flex items-center space-x-4'>
          <Image
            src={
              proposal.user.profile.pfp || '/placeholder.svg?height=50&width=50'
            }
            alt={`${proposal.user.profile.firstName} ${proposal.user.profile.lastName}`}
            width={50}
            height={50}
            className='rounded-full'
          />
          <div>
            <p className='text-sm font-medium text-gray-900'>
              <Link
                href={`/app/customer/contributors/${proposal.user.id}`}
                className='hover:underline'
              >
                {proposal.user.profile.title}
              </Link>
            </p>
            <p className='text-sm text-gray-500'>
              Applied: {dayjs(proposal.createdAt).format('MMM D, YYYY')}
            </p>
          </div>
        </div>
        <div className='mt-2'>
          <ProposalStatusBadge status={proposal.status} />
        </div>
        {(proposal.user.profile.education ||
          proposal.user.profile.experience) && (
          <ul className='text-sm text-gray-600 space-y-1 mt-4'>
            {proposal.user.profile.education && (
              <li>Education: {Case.title(proposal.user.profile.education)}</li>
            )}
            {proposal.user.profile.experience && (
              <li>
                Experience: {Case.title(proposal.user.profile.experience)}
              </li>
            )}
          </ul>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='w-full mt-4'
              disabled={isLoading}
            >
              <MessageCircleMore className='mr-2 h-4 w-4' /> Statement
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <DialogTitle>
                {proposal.user.profile.firstName}&apos;s Statement
              </DialogTitle>
            </DialogHeader>
            <Markdown className='prose'>{`${`**Budget:** ${proposal.budget || proposal.job.budget} ${CURRENCY[proposal.job.currency]}`}\n\n${proposal.statement}`}</Markdown>
          </DialogContent>
        </Dialog>
        {proposal.status === ProposalStatus.SHORTLISTED && (
          <Button
            variant='default'
            size='sm'
            className='w-full mt-4'
            onClick={handleDepositAndHire}
            disabled={isLoading}
          >
            <DollarSign className='mr-2 h-4 w-4' /> Deposit and Hire
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
