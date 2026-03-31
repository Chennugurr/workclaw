'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { allPages } from './config';

export default function DocPage({ title, description, toc = [], prev, next, children }) {
  const prevPage = prev ?? (() => {
    const idx = allPages.findIndex((p) => p.title === title);
    return idx > 0 ? allPages[idx - 1] : null;
  })();
  const nextPage = next ?? (() => {
    const idx = allPages.findIndex((p) => p.title === title);
    return idx < allPages.length - 1 ? allPages[idx + 1] : null;
  })();

  return (
    <div className='flex min-h-screen'>
      {/* Content */}
      <main className='flex-1 min-w-0 px-8 lg:px-16 py-12 max-w-3xl'>
        {/* Header */}
        <div className='mb-10'>
          <h1 className='text-3xl font-bold tracking-tight mb-3'>{title}</h1>
          {description && (
            <p className='text-white/55 text-lg leading-relaxed'>{description}</p>
          )}
          <div className='mt-6 h-px bg-white/[0.06]' />
        </div>

        {/* Body */}
        <div className='prose-docs'>
          {children}
        </div>

        {/* Prev / Next */}
        {(prevPage || nextPage) && (
          <div className='mt-16 pt-8 border-t border-white/[0.06] flex items-center justify-between gap-4'>
            {prevPage ? (
              <Link
                href={prevPage.href}
                className='flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group'
              >
                <ChevronLeft className='h-4 w-4 group-hover:-translate-x-0.5 transition-transform' />
                <div>
                  <p className='text-[10px] text-white/25 uppercase tracking-wider mb-0.5'>Previous</p>
                  <p>{prevPage.title}</p>
                </div>
              </Link>
            ) : <div />}
            {nextPage ? (
              <Link
                href={nextPage.href}
                className='flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group text-right'
              >
                <div>
                  <p className='text-[10px] text-white/25 uppercase tracking-wider mb-0.5'>Next</p>
                  <p>{nextPage.title}</p>
                </div>
                <ChevronRight className='h-4 w-4 group-hover:translate-x-0.5 transition-transform' />
              </Link>
            ) : <div />}
          </div>
        )}
      </main>

      {/* Right TOC */}
      {toc.length > 0 && (
        <aside className='hidden xl:block w-52 shrink-0 sticky top-0 self-start py-12 pr-8'>
          <p className='text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-3'>On this page</p>
          <ul className='space-y-1'>
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className='text-xs text-white/40 hover:text-white transition-colors block py-1 leading-relaxed'
                  style={{ paddingLeft: item.level === 3 ? '0.75rem' : '0' }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
