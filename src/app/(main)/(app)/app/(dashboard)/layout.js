'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Settings,
  Layers,
  Menu,
  X,
  Target,
  ClipboardList,
  GraduationCap,
  DollarSign,
  MessageSquare,
  Bell,
  User,
  FolderKanban,
  Plus,
  Users,
  BarChart3,
  CreditCard,
  Shield,
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
import NotificationCenter from '@/components/notification-center';
import { useAppState } from '@/store';

const MENU = deepFreeze({
  contributor: {
    main: [
      { name: 'Opportunities', href: '/app/contributor/opportunities' },
      { name: 'My Tasks', href: '/app/contributor/my-tasks' },
      { name: 'Dashboard', href: '/app/contributor/dashboard' },
    ],
    side: [
      {
        icon: <Layers className='h-5 w-5 mr-3' />,
        name: 'Overview',
        href: '/app/contributor/dashboard',
      },
      {
        icon: <Target className='h-5 w-5 mr-3' />,
        name: 'Opportunities',
        href: '/app/contributor/opportunities',
      },
      {
        icon: <ClipboardList className='h-5 w-5 mr-3' />,
        name: 'My Tasks',
        href: '/app/contributor/my-tasks',
      },
      {
        icon: <GraduationCap className='h-5 w-5 mr-3' />,
        name: 'Screenings',
        href: '/app/contributor/screenings',
      },
      {
        icon: <DollarSign className='h-5 w-5 mr-3' />,
        name: 'Earnings',
        href: '/app/contributor/earnings',
      },
      {
        icon: <MessageSquare className='h-5 w-5 mr-3' />,
        name: 'Reviews',
        href: '/app/contributor/reviews',
      },
      {
        icon: <User className='h-5 w-5 mr-3' />,
        name: 'Profile',
        href: '/app/contributor/profile',
      },
      {
        icon: <Settings className='h-5 w-5 mr-3' />,
        name: 'Settings',
        href: '/app/contributor/settings',
      },
    ],
  },
  customer: {
    main: [
      { name: 'Dashboard', href: '/app/customer/dashboard' },
      { name: 'Projects', href: '/app/customer/projects' },
      { name: 'New Project', href: '/app/customer/projects/new' },
    ],
    side: [
      {
        icon: <Layers className='h-5 w-5 mr-3' />,
        name: 'Overview',
        href: '/app/customer/dashboard',
      },
      {
        icon: <FolderKanban className='h-5 w-5 mr-3' />,
        name: 'Projects',
        href: '/app/customer/projects',
      },
      {
        icon: <Plus className='h-5 w-5 mr-3' />,
        name: 'New Project',
        href: '/app/customer/projects/new',
      },
      {
        icon: <Users className='h-5 w-5 mr-3' />,
        name: 'Contributors',
        href: '/app/customer/contributors',
      },
      {
        icon: <BarChart3 className='h-5 w-5 mr-3' />,
        name: 'Analytics',
        href: '/app/customer/analytics',
      },
      {
        icon: <CreditCard className='h-5 w-5 mr-3' />,
        name: 'Billing',
        href: '/app/customer/billing',
      },
      {
        icon: <Settings className='h-5 w-5 mr-3' />,
        name: 'Settings',
        href: '/app/customer/settings',
      },
    ],
  },
  reviewer: {
    main: [
      { name: 'Queue', href: '/app/reviewer/queue' },
    ],
    side: [
      {
        icon: <ClipboardList className='h-5 w-5 mr-3' />,
        name: 'Review Queue',
        href: '/app/reviewer/queue',
      },
      {
        icon: <BarChart3 className='h-5 w-5 mr-3' />,
        name: 'Stats',
        href: '/app/reviewer/stats',
      },
      {
        icon: <Settings className='h-5 w-5 mr-3' />,
        name: 'Settings',
        href: '/app/reviewer/settings',
      },
    ],
  },
  admin: {
    main: [
      { name: 'Dashboard', href: '/app/admin/dashboard' },
      { name: 'Users', href: '/app/admin/users' },
      { name: 'Projects', href: '/app/admin/projects' },
    ],
    side: [
      {
        icon: <Layers className='h-5 w-5 mr-3' />,
        name: 'Dashboard',
        href: '/app/admin/dashboard',
      },
      {
        icon: <Users className='h-5 w-5 mr-3' />,
        name: 'Users',
        href: '/app/admin/users',
      },
      {
        icon: <FolderKanban className='h-5 w-5 mr-3' />,
        name: 'Projects',
        href: '/app/admin/projects',
      },
      {
        icon: <ClipboardList className='h-5 w-5 mr-3' />,
        name: 'Task Queues',
        href: '/app/admin/tasks',
      },
      {
        icon: <GraduationCap className='h-5 w-5 mr-3' />,
        name: 'Screenings',
        href: '/app/admin/screenings',
      },
      {
        icon: <CreditCard className='h-5 w-5 mr-3' />,
        name: 'Payouts',
        href: '/app/admin/payouts',
      },
      {
        icon: <Shield className='h-5 w-5 mr-3' />,
        name: 'Fraud',
        href: '/app/admin/fraud',
      },
      {
        icon: <Bell className='h-5 w-5 mr-3' />,
        name: 'Announcements',
        href: '/app/admin/announcements',
      },
      {
        icon: <BarChart3 className='h-5 w-5 mr-3' />,
        name: 'Analytics',
        href: '/app/admin/analytics',
      },
      {
        icon: <ClipboardList className='h-5 w-5 mr-3' />,
        name: 'Audit Log',
        href: '/app/admin/audit',
      },
    ],
  },
});

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dashboardType, setDashboardType] = useState('contributor');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menu = useMemo(() => {
    let menu;
    if (pathname.startsWith('/app/admin')) {
      menu = MENU.admin;
      setDashboardType('admin');
    } else if (pathname.startsWith('/app/customer')) {
      menu = MENU.customer;
      setDashboardType('customer');
    } else if (pathname.startsWith('/app/reviewer')) {
      menu = MENU.reviewer;
      setDashboardType('reviewer');
    } else {
      menu = MENU.contributor;
      setDashboardType('contributor');
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
    if (profile === 'admin') router.replace('/app/admin/dashboard');
    else if (profile === 'customer') router.replace('/app/customer/dashboard');
    else if (profile === 'reviewer') router.replace('/app/reviewer/queue');
    else router.replace('/app/contributor/dashboard');
  };

  if (authenticated && !user?.profile && pathname !== '/app/contributor/settings') {
    return router.push('/app/contributor/settings');
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
                      'text-gray-900 font-semibold': active,
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
                    <span className='text-gray-600 capitalize'>
                      {dashboardType}
                    </span>
                    <ChevronDown className='h-4 w-4 text-gray-600 ml-1' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => switchProfile('contributor')}>
                    Contributor
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => switchProfile('customer')}>
                    Customer
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => switchProfile('reviewer')}>
                    Reviewer
                  </DropdownMenuItem>
                  {user?.role === 'ADMIN' && (
                    <DropdownMenuItem onSelect={() => switchProfile('admin')}>
                      Admin
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className='shadow-sm border-b py-4'>
          <div className='px-4 lg:container mx-auto flex justify-between items-center'>
            <div className='flex items-center gap-8'>
              <Link href='/app' className='outline-none text-xl font-bold text-gray-900 tracking-tight'>
                humanlayer
              </Link>
            </div>

            <div className='flex items-center gap-4'>
              <div className='relative hidden lg:block'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Search projects, tasks...'
                  className='pl-10 pr-4 py-2 w-80'
                />
              </div>

              {authenticated && <NotificationCenter />}
              <appkit-button balance='hide' />
            </div>
          </div>
        </header>

        <div className='lg:container flex flex-1'>
          {/* Side Navigation */}
          <aside className='hidden lg:block w-64 border-r flex-shrink-0'>
            {authenticated && dashboardType === 'customer' && (
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
                      'text-gray-900 bg-gray-100 border-l-4 border-gray-900':
                        active,
                      'text-gray-600 hover:bg-gray-50': !active,
                    })}
                  >
                    {item.icon}
                    <span className='font-medium'>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className='flex-1 min-w-0'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side='left' className='w-64 p-0'>
          <aside className='w-full h-full border-r flex-shrink-0'>
            {dashboardType === 'customer' && (
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
                      'text-gray-900 bg-gray-100 border-l-4 border-gray-900':
                        active,
                      'text-gray-600 hover:bg-gray-50': !active,
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
                      'text-gray-900 bg-gray-100 border-l-4 border-gray-900':
                        active,
                      'text-gray-600 hover:bg-gray-50': !active,
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
