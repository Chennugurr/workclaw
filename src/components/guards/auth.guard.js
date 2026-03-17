'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TOAST_IDS } from '@/constants';
import useStore from '@/store/store';
import { toast } from 'sonner';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated } = useStore();
  if (!authenticated) {
    const dashboard = pathname.startsWith('/app/customer') ? 'customer' : 'contributor';
    const defaultPath = {
      customer: '/app/customer/dashboard',
      contributor: '/app/contributor/opportunities',
    };
    toast.info('The page you are trying to access requires authentication.', {
      id: TOAST_IDS.AUTH_GUARD,
    });
    router.replace(defaultPath[dashboard]);
    return null;
  }
  return children;
}
