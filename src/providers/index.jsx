'use client';

import { ThemeProvider } from '@/context/theme';
import { Toaster } from '@/components/ui/sonner';
import AppKitProvider from './reown';

export function Providers({ children }) {
  return (
    <>
      <ThemeProvider
        attribute='class'
        defaultTheme='light'
        enableSystem={false}
        disableTransitionOnChange
      >
        <AppKitProvider>{children}</AppKitProvider>
      </ThemeProvider>

      <Toaster />
    </>
  );
}
