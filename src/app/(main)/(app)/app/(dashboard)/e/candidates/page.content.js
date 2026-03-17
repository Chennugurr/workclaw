'use client';

import _ from 'lodash';
import Case from 'case';
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Filter,
  X,
} from 'lucide-react';
import usePaginateSWR from '@/hooks/use-paginate-swr';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Pagination from '@/components/pagination';

const experienceLevels = [
  'INTERNSHIP',
  'ENTRY_LEVEL',
  'MID_LEVEL',
  'SENIOR_LEVEL',
  'MANAGEMENT',
  'DIRECTOR',
  'EXECUTIVE',
  'CONSULTANT',
  'FREELANCE',
];

export default function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedExperience, setSelectedExperience] = useState(
    searchParams.get('experienceLevels')?.split(',') || []
  );
  const [availability, setAvailability] = useState(
    searchParams.get('availability') || 'AVAILABLE'
  );
  const [selectedSkills, setSelectedSkills] = useState(
    searchParams.get('skillIds')?.split(',') || []
  );
  const [expandedAccordionItem, setExpandedAccordionItem] = useState(null);

  const {
    data: candidates,
    pagination,
    isLoading,
    setParams,
  } = usePaginateSWR(`/search/candidates`, {
    params: {
      q: searchTerm,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 15,
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
      skillIds: selectedSkills.join(','),
      experienceLevels: selectedExperience.join(','),
      availability,
    },
  });

  const handleSkillToggle = useCallback((skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }, []);

  const handleExperienceToggle = useCallback((experience) => {
    setSelectedExperience((prev) =>
      prev.includes(experience)
        ? prev.filter((e) => e !== experience)
        : [...prev, experience]
    );
  }, []);

  const handleAccordionChange = (value) => {
    setExpandedAccordionItem(value);
  };

  const applyFilters = useCallback(() => {
    const newParams = _.pickBy(
      {
        q: searchTerm || undefined,
        page: 1, // Reset to first page when applying new filters
        experienceLevels: selectedExperience.join(',') || undefined,
        availability: availability || undefined,
        skillIds: selectedSkills.join(',') || undefined,
      },
      _.identity
    );
    setParams(newParams);
    const urlParams = new URLSearchParams(newParams);
    router.push(`/app/e/candidates?${urlParams.toString()}`);
  }, [
    searchTerm,
    selectedExperience,
    availability,
    selectedSkills,
    setParams,
    router,
  ]);

  const FilterContent = useCallback(
    () => (
      <>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Filters</h2>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setSelectedExperience([]);
              setAvailability('');
              setSelectedSkills([]);
            }}
          >
            <X className='h-4 w-4 mr-2' />
            Clear All
          </Button>
        </div>

        <Accordion
          type='single'
          collapsible
          className='w-full'
          value={expandedAccordionItem}
          onValueChange={handleAccordionChange}
        >
          <AccordionItem value='experience'>
            <AccordionTrigger>Experience</AccordionTrigger>
            <AccordionContent>
              <div className='space-y-2'>
                {experienceLevels.map((experience) => (
                  <div key={experience} className='flex items-center'>
                    <Checkbox
                      id={experience}
                      checked={selectedExperience.includes(experience)}
                      onCheckedChange={() => handleExperienceToggle(experience)}
                    />
                    <label
                      htmlFor={experience}
                      className='ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      {Case.title(experience)}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='skills'>
            <AccordionTrigger>Skills</AccordionTrigger>
            <AccordionContent>
              <div className='space-y-2'>
                {/* TODO: Fetch skills from API */}
                {['JavaScript', 'React', 'Node.js', 'Python', 'Java'].map(
                  (skill) => (
                    <div key={skill} className='flex items-center'>
                      <Checkbox
                        id={skill}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <label
                        htmlFor={skill}
                        className='ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        {skill}
                      </label>
                    </div>
                  )
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className='flex items-center space-x-2 mt-4'>
          <Switch
            id='availability'
            checked={availability === 'AVAILABLE'}
            onCheckedChange={(checked) =>
              setAvailability(checked ? 'AVAILABLE' : '')
            }
          />
          <Label htmlFor='availability'>Available only</Label>
        </div>

        <Button className='w-full mt-4' onClick={applyFilters}>
          <Filter className='mr-2 h-4 w-4' /> Apply Filters
        </Button>
      </>
    ),
    [
      selectedExperience,
      selectedSkills,
      availability,
      expandedAccordionItem,
      handleExperienceToggle,
      handleSkillToggle,
      applyFilters,
    ]
  );

  return (
    <>
      <h1 className='text-3xl font-bold mb-6'>Find Candidates</h1>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='md:col-span-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <Input
              type='text'
              placeholder='Search candidates by name, skills, or job titles...'
              className='pl-10'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className='flex space-x-2'>
          <Button className='w-full' onClick={applyFilters}>
            <Search className='mr-2 h-4 w-4' /> Search
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' className='md:hidden'>
                <Filter className='mr-2 h-4 w-4' /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your candidate search
                </SheetDescription>
              </SheetHeader>
              <div className='mt-4'>
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-5 gap-6'>
        <div className='md:col-span-3'>
          <div className='space-y-4'>
            {isLoading ? (
              <p>Loading candidates...</p>
            ) : candidates && candidates.length > 0 ? (
              candidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardContent className='p-4'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='text-lg font-semibold'>
                          {candidate.profile.firstName}{' '}
                          {candidate.profile.lastName}
                        </h3>
                        <p className='text-gray-600'>
                          {candidate.profile.title}
                        </p>
                      </div>
                      <Button variant='outline' asChild>
                        <Link href={`/app/e/candidates/${candidate.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                    {(candidate.profile.location ||
                      candidate.profile.experience ||
                      candidate.profile.education) && (
                      <div className='mt-4 space-y-2'>
                        {candidate.profile.location && (
                          <div className='flex items-center text-sm text-gray-600'>
                            <MapPin className='mr-2 h-4 w-4' />
                            {candidate.profile.location}
                          </div>
                        )}
                        {candidate.profile.experience && (
                          <div className='flex items-center text-sm text-gray-600'>
                            <Briefcase className='mr-2 h-4 w-4' />
                            {Case.title(candidate.profile.experience)}
                          </div>
                        )}
                        {candidate.profile.education && (
                          <div className='flex items-center text-sm text-gray-600'>
                            <GraduationCap className='mr-2 h-4 w-4' />
                            {Case.title(candidate.profile.education)}
                          </div>
                        )}
                      </div>
                    )}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className='mt-4'>
                        {candidate.skills.map((skill) => (
                          <Badge key={skill.skill.id} className='mr-2'>
                            {skill.skill.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No candidates found.</p>
            )}
          </div>
        </div>

        <div className='md:col-span-2 hidden md:block'>
          <Card>
            <CardContent className='p-4'>
              <FilterContent />
            </CardContent>
          </Card>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center items-center mt-6'>
          <Pagination pagination={pagination} />
        </div>
      )}
    </>
  );
}
