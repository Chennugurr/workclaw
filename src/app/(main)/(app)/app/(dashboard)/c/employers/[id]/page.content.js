'use client';

import Case from 'case';
import dayjs from 'dayjs';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Users,
  Briefcase,
  Globe,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
  LinkIcon,
  Linkedin,
} from 'lucide-react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import Markdown from 'markdown-to-jsx';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function PageContent({ params }) {
  const { data: org, isLoading } = useAppSWR(`/orgs/${params.id}`);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className='relative mb-8'>
        <Image
          src={org.banner || '/placeholder.svg?height=200&width=1200'}
          alt={`${org.name} cover`}
          width={1200}
          height={200}
          className='w-full h-48 object-cover rounded-t-lg'
        />
        <div className='absolute bottom-0 left-0 right-0 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between'>
          <div className='flex items-center mb-4 sm:mb-0'>
            <Image
              src={org.logo || '/placeholder.svg?height=80&width=80'}
              alt={`${org.name} logo`}
              width={80}
              height={80}
              className='w-16 h-16 rounded-lg mr-4'
            />
            <div>
              <h1 className='text-2xl font-bold'>{org.name}</h1>
              <p className='text-gray-600'>{Case.title(org.type)}</p>
            </div>
          </div>
          <Button className='w-full sm:w-auto' asChild>
            <Link href={`/app/c/jobs?orgId=${org.id}&status=OPEN`}>
              View Open Position
              <ChevronRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>

      <div className='grid xl:grid-cols-3 gap-8'>
        <div className='xl:col-span-2'>
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className='prose'>
              <Markdown>{org.bio || '_No bio available_'}</Markdown>
            </CardContent>
          </Card>

          <div className='mt-8'>
            <h2 className='text-lg font-semibold mb-4'>Share profile:</h2>
            <div className='flex flex-wrap gap-4'>
              <Button variant='outline' size='sm'>
                <Facebook className='mr-2 h-4 w-4' />
                Facebook
              </Button>
              <Button variant='outline' size='sm'>
                <Twitter className='mr-2 h-4 w-4' />
                Twitter
              </Button>
              <Button variant='outline' size='sm'>
                <LinkIcon className='mr-2 h-4 w-4' />
                Copy Link
              </Button>
            </div>
          </div>
        </div>

        <div className='hidden xl:block'>
          <CompanyDetailsAside org={org} />
        </div>
      </div>

      <div className='fixed bottom-4 right-4 xl:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='default'>
              Company Details
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </SheetTrigger>
          <SheetContent side='right' className='w-[90vw] sm:w-[540px]'>
            <SheetHeader>
              <SheetTitle>Company Details</SheetTitle>
            </SheetHeader>
            <div className='mt-4 overflow-y-auto h-[calc(100vh-80px)]'>
              <CompanyDetailsAside org={org} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function CompanyDetailsAside({ org }) {
  return (
    <>
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Company Overview</h2>
          <div className='grid grid-cols-1 gap-4'>
            <div className='flex items-center'>
              <Calendar className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Founded in:
                </span>
                <p className='font-semibold'>
                  {org.foundedIn
                    ? dayjs(org.foundedIn).format('DD MMMM, YYYY')
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <Clock className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Organization Type:
                </span>
                <p className='font-semibold'>{Case.title(org.type)}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <Users className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Team Size:
                </span>
                <p className='font-semibold'>{Case.title(org.teamSize)}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <Briefcase className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Industry Type:
                </span>
                <p className='font-semibold'>{Case.title(org.type)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Contact Information</h2>
          <div className='grid grid-cols-1 gap-4'>
            <div className='flex items-center'>
              <Globe className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Website:
                </span>
                <p className='font-semibold'>{org.website || 'N/A'}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <Phone className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>Phone:</span>
                <p className='font-semibold'>{org.phone || 'N/A'}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <Mail className='mr-2 h-5 w-5 text-gray-400' />
              <div>
                <span className='text-sm text-gray-600 uppercase'>
                  Email Address:
                </span>
                <p className='font-semibold'>{org.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {org.socials.length > 0 && (
        <Card>
          <CardContent className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Follow us on:</h2>
            <div className='flex flex-wrap gap-4'>
              {org.socials.map((social) => (
                <Button key={social.id} variant='outline' size='icon'>
                  {social.platform === 'FACEBOOK' && (
                    <Facebook className='h-4 w-4' />
                  )}
                  {social.platform === 'TWITTER' && (
                    <Twitter className='h-4 w-4' />
                  )}
                  {social.platform === 'INSTAGRAM' && (
                    <Instagram className='h-4 w-4' />
                  )}
                  {social.platform === 'LINKEDIN' && (
                    <Linkedin className='h-4 w-4' />
                  )}
                  {social.platform === 'GITHUB' && (
                    <GitHubLogoIcon className='h-4 w-4' />
                  )}
                  {social.platform === 'WEBSITE' && (
                    <Globe className='h-4 w-4' />
                  )}
                  {social.platform === 'OTHER' && <Link className='h-4 w-4' />}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
