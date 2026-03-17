'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Sliders,
  Clock,
  DollarSign,
  Users,
  Lock,
  ChevronRight,
  Target,
} from 'lucide-react';
import usePaginateSWR from '@/hooks/use-paginate-swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DOMAIN_FILTERS = [
  'All', 'DeFi', 'NFTs', 'Wallets', 'Security', 'Governance',
  'Infrastructure', 'Research', 'Gaming', 'Memecoins',
];

const DIFFICULTY_LABELS = {
  BEGINNER: { label: 'Beginner', color: 'bg-green-100 text-green-700' },
  INTERMEDIATE: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
  ADVANCED: { label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  EXPERT: { label: 'Expert', color: 'bg-orange-100 text-orange-700' },
};

const TASK_TYPE_LABELS = {
  SINGLE_RESPONSE_RATING: 'Response Rating',
  PAIRWISE_COMPARISON: 'Comparison',
  MULTI_RESPONSE_RANKING: 'Ranking',
  LABEL_CLASSIFICATION: 'Classification',
  TEXT_ANNOTATION: 'Annotation',
  CODE_REVIEW: 'Code Review',
  FACTUALITY_VERIFICATION: 'Fact Check',
  SAFETY_REVIEW: 'Safety Review',
  SCAM_CLASSIFICATION: 'Scam Detection',
  CONTRACT_VALIDATION: 'Contract Review',
  RESEARCH_GRADING: 'Research Review',
  AGENT_EVALUATION: 'Agent Testing',
  PROMPT_WRITING: 'Prompt Writing',
  TRANSLATION_REVIEW: 'Translation Review',
};

const STATUS_LABELS = {
  OPEN: { label: 'Open', color: 'bg-green-100 text-green-700' },
  INVITE_ONLY: { label: 'Invite Only', color: 'bg-yellow-100 text-yellow-700' },
  FULL: { label: 'Full', color: 'bg-red-100 text-red-700' },
  PAUSED: { label: 'Paused', color: 'bg-gray-100 text-gray-700' },
};

function OpportunityCard({ project }) {
  const difficulty = DIFFICULTY_LABELS[project.difficulty] || DIFFICULTY_LABELS.INTERMEDIATE;
  const taskType = TASK_TYPE_LABELS[project.taskType] || project.taskType;
  const status = STATUS_LABELS[project.status] || STATUS_LABELS.OPEN;
  const isLocked = project.status === 'FULL' || project.status === 'PAUSED';

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <Link href={isLocked ? '#' : `/app/contributor/opportunities/${project.id}`}>
        <CardContent className='p-5'>
          <div className='flex justify-between items-start mb-3'>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 truncate'>{project.title}</h3>
              <p className='text-sm text-gray-500 mt-0.5'>
                {project.organization?.name || 'Anonymous'}
              </p>
            </div>
            {isLocked && <Lock className='h-4 w-4 text-gray-400 flex-shrink-0 mt-1' />}
          </div>

          <div className='flex flex-wrap gap-1.5 mb-3'>
            <Badge variant='outline' className='text-xs'>{taskType}</Badge>
            <Badge className={`text-xs ${difficulty.color}`}>{difficulty.label}</Badge>
            {project.requiredTier && project.requiredTier !== 'NEW' && (
              <Badge className='text-xs bg-amber-100 text-amber-700'>{project.requiredTier}+</Badge>
            )}
            {project.domain?.slice(0, 2).map((d) => (
              <Badge key={d} variant='secondary' className='text-xs'>{d}</Badge>
            ))}
          </div>

          <div className='flex items-center gap-4 text-sm text-gray-500'>
            {project.rateAmount && (
              <div className='flex items-center gap-1'>
                <DollarSign className='h-3.5 w-3.5' />
                <span>
                  ${Number(project.rateAmount).toFixed(2)}
                  {project.payModel === 'PER_TASK' ? '/task' : '/hr'}
                </span>
              </div>
            )}
            {project.capacity && (
              <div className='flex items-center gap-1'>
                <Users className='h-3.5 w-3.5' />
                <span>{project.capacity} spots</span>
              </div>
            )}
            <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
          </div>

          {project.chainTags?.length > 0 && (
            <div className='flex flex-wrap gap-1 mt-3'>
              {project.chainTags.slice(0, 3).map((chain) => (
                <span key={chain} className='text-xs text-gray-400'>{chain}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

export default function PageContent() {
  const params = useSearchParams();
  const [selectedDomain, setSelectedDomain] = useState('All');
  const {
    data: projects,
    pagination,
    isLoading,
  } = usePaginateSWR(`/search/jobs`, {
    params: {
      searchTerm: params.get('searchTerm'),
      page: params.get('page') || 1,
      limit: params.get('limit') || 12,
      sort: params.get('sort') || 'createdAt',
      order: params.get('order') || 'desc',
      status: 'open',
    },
  });

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-1'>Opportunities</h1>
        <p className='text-gray-500'>Find AI training projects that match your expertise.</p>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-3 mb-6'>
        <div className='relative flex-grow'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            className='pl-10'
            placeholder='Search projects by title, domain, task type...'
          />
        </div>
        <Select defaultValue='all'>
          <SelectTrigger className='w-full md:w-40'>
            <SelectValue placeholder='Difficulty' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All levels</SelectItem>
            <SelectItem value='BEGINNER'>Beginner</SelectItem>
            <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
            <SelectItem value='ADVANCED'>Advanced</SelectItem>
            <SelectItem value='EXPERT'>Expert</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue='all'>
          <SelectTrigger className='w-full md:w-40'>
            <SelectValue placeholder='Pay type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All types</SelectItem>
            <SelectItem value='PER_TASK'>Per task</SelectItem>
            <SelectItem value='HOURLY'>Hourly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Domain Tags */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {DOMAIN_FILTERS.map((domain) => (
          <button
            key={domain}
            onClick={() => setSelectedDomain(domain)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedDomain === domain
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className='p-5'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse' />
                <div className='h-3 bg-gray-100 rounded w-1/2 mb-4 animate-pulse' />
                <div className='flex gap-2 mb-3'>
                  <div className='h-5 bg-gray-100 rounded w-16 animate-pulse' />
                  <div className='h-5 bg-gray-100 rounded w-20 animate-pulse' />
                </div>
                <div className='h-3 bg-gray-100 rounded w-2/3 animate-pulse' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6'>
          {projects.map((project) => (
            <OpportunityCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <Target className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>No projects available yet</h3>
            <p className='text-sm text-gray-500 max-w-md mx-auto'>
              New projects are added regularly. Complete your screenings to be ready when they appear.
            </p>
          </CardContent>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center mt-6'>
          <Pagination pagination={pagination} />
        </div>
      )}
    </>
  );
}
