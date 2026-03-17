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
  title: 'Workclaw - Web3 AI Work Platform',
  description: `Workclaw is a paid web3 human intelligence platform. Train crypto-native AI systems, earn money for your expertise, and build a verified reputation in crypto AI work.`,
  keywords: `web3, AI training, crypto, human feedback, data labeling, smart contracts, blockchain, RLHF`,
  openGraph: {
    title: 'Workclaw - Web3 AI Work Platform',
    description: `Earn money training AI for web3. Complete tasks, pass screenings, and get paid for your crypto expertise.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Workclaw - Web3 AI Work Platform',
    description: `Earn money training AI for web3. Complete tasks, pass screenings, and get paid for your crypto expertise.`,
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
