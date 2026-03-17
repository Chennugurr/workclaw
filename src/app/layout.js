import './globals.css';
import '@mdxeditor/editor/style.css';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/providers';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Detask - Blockchain-powered Freelancing Platform',
  description: `Detask is a blockchain-powered freelancing platform for professionals to launch projects, build portfolios, and find opportunities.`,
  keywords: `blockchain, freelancing, professionals, projects, portfolios, opportunities`,
  openGraph: {
    title: 'Detask - Blockchain-powered Freelancing Platform',
    description: `Launch projects, build portfolios, and find opportunities on our blockchain-powered freelancing platform.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Detask - Blockchain-powered Freelancing',
    description: `Launch projects, build portfolios, and find opportunities on our blockchain-powered freelancing platform.`,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link rel='manifest' href='/site.webmanifest' />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
