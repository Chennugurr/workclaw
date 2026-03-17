'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Briefcase,
  AlertCircle,
  Settings,
  Layers,
  Menu,
  X,
  BriefcaseBusiness,
  User,
  LayoutList,
  Bookmark,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import deepFreeze from '@/lib/deep-freeze';
import { cn } from '@/lib/utils';
import OrganizationSwitcher from '@/components/organization-switcher';
import { useAppState } from '@/store';

const MENU = deepFreeze({
  candidate: {
    main: [
      {
        name: 'Find Job',
        href: '/app/c/jobs',
      },
      {
        name: 'Find Employers',
        href: '/app/c/employers',
      },
      {
        name: 'Dashboard',
        href: '/app/c/dashboard',
      },
    ],
    side: [
      {
        icon: <Layers className='h-5 w-5 mr-3' />,
        name: 'Overview',
        href: '/app/c/dashboard',
      },
      {
        icon: <Briefcase className='h-5 w-5 mr-3' />,
        name: 'Applied Jobs',
        href: '/app/c/applied',
      },
      {
        icon: <Bookmark className='h-5 w-5 mr-3' />,
        name: 'Favorite Jobs',
        href: '/app/c/favorites',
      },
      {
        icon: <AlertCircle className='h-5 w-5 mr-3' />,
        name: 'Job Alert',
        href: '/app/c/alerts',
      },
      {
        icon: <Settings className='h-5 w-5 mr-3' />,
        name: 'Settings',
        href: '/app/c/settings',
      },
    ],
  },
  employer: {
    main: [
      {
        name: 'Find Candidates',
        href: '/app/e/candidates',
      },
      {
        name: 'Dashboard',
        href: '/app/e/dashboard',
      },
      {
        name: 'My Jobs',
        href: '/app/e/jobs',
      },
    ],
    side: [
      {
        icon: <Layers className='h-5 w-5 mr-3' />,
        name: 'Overview',
        href: '/app/e/dashboard',
      },
      {
        icon: <BriefcaseBusiness className='h-5 w-5 mr-3' />,
        name: 'My Jobs',
        href: '/app/e/jobs',
      },
      {
        icon: <LayoutList className='h-5 w-5 mr-3' />,
        name: 'Post a Job',
        href: '/app/e/jobs/new',
      },
      {
        icon: <User className='h-5 w-5 mr-3' />,
        name: 'Saved Candidates',
        href: '/app/e/saved',
      },
      {
        icon: <Settings className='h-5 w-5 mr-3' />,
        name: 'Settings',
        href: '/app/e/settings',
      },
    ],
  },
});

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dashboardType, setDashboardType] = useState('candidate');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menu = useMemo(() => {
    let menu;
    if (pathname.startsWith('/app/e')) {
      menu = MENU.employer;
      setDashboardType('employer');
    } else {
      menu = MENU.candidate;
      setDashboardType('candidate');
    }
    menu = deepFreeze({
      ...menu,
      main: [
        {
          name: 'Home',
          href: '/app',
        },
        ...menu.main,
      ],
    });
    return menu;
  }, [pathname]);

  const { authenticated, user } = useAppState();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const switchProfile = (profile) => {
    if (profile === 'employer') router.replace('/app/e/dashboard');
    else router.replace('/app/c/dashboard');
  };

  if (authenticated && !user?.profile && pathname !== '/app/c/settings') {
    return router.push('/app/c/settings');
  }

  return (
    <>
      <div className='flex flex-col min-h-screen'>
        {/* Top Menu */}
        <div className='bg-gray-100 py-2'>
          <div className='px-4 lg:container mx-auto flex justify-between items-center text-sm'>
            <nav className='hidden lg:flex gap-4'>
              {menu.main.map((item, idx) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={cn({
                      'text-blue-600 font-semibold': active,
                      'text-gray-600 hover:text-gray-800': !active,
                    })}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className='lg:hidden'>
              <Button
                variant='ghost'
                size='icon'
                className='h-fit w-fit'
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? (
                  <X className='h-6 w-6' />
                ) : (
                  <Menu className='h-6 w-6' />
                )}
                <span className='sr-only'>Toggle mobile menu</span>
              </Button>
            </div>

            <div className='flex items-center gap-4'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='flex items-center'>
                    <span className='text-gray-600'>
                      {dashboardType === 'candidate' ? 'Candidate' : 'Employer'}
                    </span>
                    <ChevronDown className='h-4 w-4 text-gray-600 ml-1' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => switchProfile('candidate')}>
                    Candidate
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => switchProfile('employer')}>
                    Employer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Second Menu */}
        <header className='shadow-sm border-b py-4'>
          <div className='px-4 lg:container mx-auto flex justify-between items-center'>
            <div className='flex items-center gap-8'>
              <Link href='/app' className='outline-none'>
                <Image
                  src='/assets/images/logo/black.png'
                  alt='Detask'
                  width={124}
                  height={32}
                  className='hidden md:block'
                />
                <Image
                  src='/assets/images/logo/icon/black.png'
                  alt='Detask'
                  width={32}
                  height={32}
                  className='block md:hidden'
                />
              </Link>
            </div>

            <div className='flex items-center gap-4'>
              <div className='relative hidden lg:block'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Job tittle, keyword, company'
                  className='pl-10 pr-4 py-2 w-80'
                />
              </div>

              <appkit-button balance='hide' />
            </div>
          </div>
        </header>

        <div className='lg:container flex flex-1'>
          {/* Side Navigation for larger screens */}
          <aside className='hidden lg:block w-64 border-r flex-shrink-0'>
            {authenticated && dashboardType === 'employer' && (
              <div className='py-4 pr-4 border-b'>
                <OrganizationSwitcher />
              </div>
            )}

            <div className='p-4'>
              <h2 className='text-sm font-semibold text-gray-500 uppercase'>
                {dashboardType} Dashboard
              </h2>
            </div>
            <nav className='py-2'>
              {menu.side.map((item, idx) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={cn('flex items-center px-4 py-3', {
                      'text-blue-600 bg-blue-50 border-l-4 border-blue-600':
                        active,
                      'text-gray-600 hover:bg-gray-100': !active,
                    })}
                  >
                    {item.icon}
                    <span className='font-medium'>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className='flex-1 min-w-0'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side='left' className='w-64 p-0'>
          <aside className='w-full h-full border-r flex-shrink-0'>
            {dashboardType === 'employer' && (
              <div className='mt-8 p-4 border-b'>
                <OrganizationSwitcher />
              </div>
            )}

            <div className='p-4 border-y'>
              <h2 className='text-sm font-semibold text-gray-500 uppercase'>
                Main Menu
              </h2>
            </div>
            <nav className='py-2'>
              {menu.main.map((item, idx) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={cn('flex items-center px-4 py-3', {
                      'text-blue-600 bg-blue-50 border-l-4 border-blue-600':
                        active,
                      'text-gray-600 hover:bg-gray-100': !active,
                    })}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className='font-medium'>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className='p-4 border-y'>
              <h2 className='text-sm font-semibold text-gray-500 uppercase'>
                {dashboardType} Dashboard
              </h2>
            </div>
            <nav className='py-2'>
              {menu.side.map((item, idx) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={cn('flex items-center px-4 py-3', {
                      'text-blue-600 bg-blue-50 border-l-4 border-blue-600':
                        active,
                      'text-gray-600 hover:bg-gray-100': !active,
                    })}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className='font-medium'>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </SheetContent>
      </Sheet>
    </>
  );
}
