'use client';

import Case from 'case';
import Markdown from 'markdown-to-jsx';
import {
  MapPin,
  Mail,
  Phone,
  FileText,
  Globe,
  ChevronRight,
} from 'lucide-react';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function PageContent({ params }) {
  const { data: user, isLoading } = useAppSWR(`/users/${params.id}/profile`);
  const { data: skills } = useAppSWR(`/users/${params.id}/skills`);

  if (isLoading) return <div>Loading...</div>;

  if (!user) return <div>User not found</div>;

  return (
    <>
      <header className='mb-8'>
        <div className='flex flex-col md:flex-row items-center justify-between'>
          <div className='flex items-center mb-4 md:mb-0'>
            <Avatar className='h-24 w-24 mr-4'>
              <AvatarImage
                src={user.pfp || '/placeholder-avatar.jpg'}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback>
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className='text-3xl font-bold'>{`${user.firstName} ${user.lastName}`}</h1>
              <p className='text-xl text-gray-600'>{user.title}</p>
              {user.location && (
                <div className='flex items-center mt-2'>
                  <MapPin className='w-4 h-4 mr-1 text-gray-500' />
                  <span className='text-sm text-gray-600'>{user.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className='flex space-x-2'>
            <Button variant='outline'>
              <FileText className='w-4 h-4 mr-2' />
              Download Resume
            </Button>
          </div>
        </div>
      </header>

      <div className='grid xl:grid-cols-3 gap-8'>
        <div className='xl:col-span-2'>
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className='prose'>
              <Markdown>{user.bio || '_No bio available_'}</Markdown>
            </CardContent>
          </Card>

          {/* TODO: impl experience, education, and achievements tabs later in the project */}
          {/* <Tabs defaultValue='experience' className='mb-8'>
            <TabsList>
              <TabsTrigger value='experience'>Experience</TabsTrigger>
              <TabsTrigger value='education'>Education</TabsTrigger>
              <TabsTrigger value='achievements'>Achievements</TabsTrigger>
            </TabsList>
            <TabsContent value='experience'>
              <Card>
                <CardContent className='pt-6'>
                  {user.experience.map((exp, index) => (
                    <div key={index} className='mb-6 last:mb-0'>
                      <div className='flex items-center'>
                        <Briefcase className='w-5 h-5 mr-2 text-gray-500' />
                        <h3 className='text-lg font-semibold'>{exp.role}</h3>
                      </div>
                      <p className='text-gray-600 mt-1'>{exp.company}</p>
                      <div className='flex items-center mt-1 text-sm text-gray-500'>
                        <Calendar className='w-4 h-4 mr-1' />
                        {exp.duration}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='education'>
              <Card>
                <CardContent className='pt-6'>
                  {user.education.map((edu, index) => (
                    <div key={index} className='mb-6 last:mb-0'>
                      <div className='flex items-center'>
                        <GraduationCap className='w-5 h-5 mr-2 text-gray-500' />
                        <h3 className='text-lg font-semibold'>{edu.degree}</h3>
                      </div>
                      <p className='text-gray-600 mt-1'>{edu.school}</p>
                      <div className='flex items-center mt-1 text-sm text-gray-500'>
                        <Calendar className='w-4 h-4 mr-1' />
                        {edu.year}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='achievements'>
              <Card>
                <CardContent className='pt-6'>
                  {user.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className='flex items-start mb-4 last:mb-0'
                    >
                      <Award className='w-5 h-5 mr-2 text-yellow-500 flex-shrink-0 mt-1' />
                      <p>{achievement}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs> */}
        </div>

        <div className='hidden xl:block'>
          <CandidateDetailsAside user={user} skills={skills} />
        </div>
      </div>

      <div className='fixed bottom-4 right-4 xl:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='default'>
              Candidate Details
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </SheetTrigger>
          <SheetContent side='right' className='w-[90vw] sm:w-[540px]'>
            <SheetHeader>
              <SheetTitle>Candidate Details</SheetTitle>
            </SheetHeader>
            <div className='mt-4 overflow-y-auto h-[calc(100vh-80px)]'>
              <CandidateDetailsAside user={user} skills={skills} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function CandidateDetailsAside({ user, skills }) {
  return (
    <>
      <Card>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Details</h2>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='font-medium'>Experience:</span>
              <span>
                {user.experience ? Case.title(user.experience) : 'N/A'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium'>Education:</span>
              <span>{user.education ? Case.title(user.education) : 'N/A'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium'>Availability:</span>
              <span>{Case.title(user.availability)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='mt-6'>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Contact Information</h2>
          <div className='grid grid-cols-1 gap-4'>
            <div className='flex items-center'>
              <Mail className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>Email:</span>
                <p className='font-semibold'>
                  {user.email ? (
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <Phone className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>Phone:</span>
                <p className='font-semibold'>
                  {user.phone ? (
                    <a href={`tel:${user.phone}`}>{user.phone}</a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <Globe className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Website:
                </span>
                <p className='font-semibold'>
                  {user.website ? (
                    <a
                      href={user.website}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {user.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {skills && skills.length > 0 && (
        <Card className='mt-6'>
          <CardContent className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Skills</h2>
            <div className='flex flex-wrap gap-2'>
              {skills &&
                skills.map((skill) => (
                  <Badge key={skill.id} variant='secondary'>
                    {skill.skill.name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
