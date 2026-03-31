import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Route docs.humanlayer.cloud → /docs/*
  if (host.startsWith('docs.')) {
    const path = url.pathname === '/' ? '/docs' : `/docs${url.pathname}`;
    url.pathname = path;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
