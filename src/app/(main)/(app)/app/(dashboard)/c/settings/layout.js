'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, UserCircle, Globe, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';
import AuthGuard from '@/components/guards/auth.guard';

const tabs = [
  {
    name: 'Personal',
    href: '/app/c/settings',
    icon: User,
    disabled: false,
  },
  {
    name: 'Profile',
    href: '/app/c/settings/profile',
    icon: UserCircle,
    disabled: true,
  },
  {
    name: 'Social',
    href: '/app/c/settings/social',
    icon: Globe,
    disabled: true,
  },
  {
    name: 'Account',
    href: '/app/c/settings/account',
    icon: Cog,
    disabled: true,
  },
];

export default function CandidateSettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <h1 className='text-3xl font-bold mb-8'>Setting</h1>
      <div className='flex flex-col space-y-8'>
        <nav className='flex space-x-1 sm:space-x-2 bg-gray-100 p-1 rounded-lg overflow-x-auto'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.disabled ? '#' : tab.href}
                className={cn(
                  'flex items-center py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
                  {
                    'bg-white text-blue-600 shadow-sm': isActive,
                    'text-gray-600 hover:bg-gray-200 hover:text-gray-900':
                      !isActive,
                    'opacity-50 cursor-not-allowed': tab.disabled,
                  }
                )}
                disabled={tab.disabled}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 sm:mr-2 transition-transform duration-200 ease-in-out',
                    isActive ? 'scale-110' : 'scale-100'
                  )}
                />
                <span className={cn('hidden sm:inline', isActive && 'inline')}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <main className='rounded-lg'>{children}</main>
      </div>
    </AuthGuard>
  );
}
