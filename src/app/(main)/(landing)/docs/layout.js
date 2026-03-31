'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search, Menu, X, ArrowRight, ExternalLink } from 'lucide-react';
import { docsNav } from './config';
import { cn } from '@/lib/utils';

function Sidebar({ mobile, onClose }) {
  const pathname = usePathname();

  return (
    <div className={cn('flex flex-col h-full', mobile ? 'p-6' : 'p-6')}>
      {/* Logo */}
      <div className='flex items-center justify-between mb-8'>
        <Link href='/' className='flex items-center gap-2.5'>
          <img src='/logo.png' alt='HumanLayer' className='h-7 w-auto' />
          <div>
            <p className='text-sm font-semibold leading-none'>HumanLayer</p>
            <p className='text-[10px] text-white/30 mt-0.5'>Documentation</p>
          </div>
        </Link>
        {mobile && (
          <button onClick={onClose} className='text-white/40 hover:text-white'>
            <X className='h-5 w-5' />
          </button>
        )}
      </div>

      {/* Search */}
      <div className='flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 mb-6 text-white/35 text-sm'>
        <Search className='h-3.5 w-3.5 shrink-0' />
        <span>Search docs...</span>
        <span className='ml-auto text-[10px] border border-white/[0.12] rounded px-1.5 py-0.5'>⌘K</span>
      </div>

      {/* Nav */}
      <nav className='flex-1 space-y-6 overflow-y-auto'>
        {docsNav.map((group) => (
          <div key={group.group}>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2 px-2'>
              {group.group}
            </p>
            <ul className='space-y-0.5'>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                        active
                          ? 'bg-white/[0.08] text-white font-medium'
                          : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                      )}
                    >
                      {active && <span className='h-1 w-1 rounded-full bg-cyan-400 shrink-0' />}
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className='mt-6 pt-6 border-t border-white/[0.06] space-y-1'>
        <Link
          href='/'
          className='flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1.5'
        >
          <ExternalLink className='h-3.5 w-3.5' />
          Back to humanlayer.cloud
        </Link>
        <Link
          href='/app/contributor/screenings'
          className='flex items-center gap-2 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors px-2 py-1.5'
        >
          <ArrowRight className='h-3.5 w-3.5' />
          Open the app
        </Link>
      </div>
    </div>
  );
}

export default function DocsLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className='min-h-screen bg-[#0e0e10] text-white flex'>
      {/* Desktop sidebar */}
      <aside className='hidden lg:flex flex-col w-64 shrink-0 fixed top-0 left-0 h-screen border-r border-white/[0.06] bg-[#0a0a0c]'>
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div className='absolute inset-0 bg-black/60' onClick={() => setMobileOpen(false)} />
          <div className='absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0c] border-r border-white/[0.06]'>
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className='flex-1 lg:ml-64 min-w-0'>
        {/* Mobile top bar */}
        <div className='lg:hidden flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] bg-[#0a0a0c] sticky top-0 z-40'>
          <button onClick={() => setMobileOpen(true)} className='text-white/50 hover:text-white'>
            <Menu className='h-5 w-5' />
          </button>
          <div className='flex items-center gap-2'>
            <img src='/logo.png' alt='HumanLayer' className='h-6 w-auto' />
            <span className='text-sm font-semibold'>Docs</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
