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
  title: 'HumanLayer - AI Training Work Platform',
  description: `HumanLayer is the first crypto-native AI training platform. Complete structured tasks — labeling, ranking, reviewing, red-teaming — earn SOL, and build a verified reputation.`,
  keywords: `AI training, LLM, human feedback, data labeling, RLHF, machine learning, annotation, AI safety, crypto, solana, web3`,
  openGraph: {
    title: 'HumanLayer - AI Training Work Platform',
    description: `Earn SOL training AI. Complete tasks, pass screenings, and get paid instantly on-chain.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HumanLayer - AI Training Work Platform',
    description: `Earn SOL training AI. Complete tasks, pass screenings, and get paid instantly on-chain.`,
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
