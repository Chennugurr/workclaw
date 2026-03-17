'use client';

import { useEffect } from 'react';
import useAppSWR from '@/hooks/use-app-swr';
import useStore from '@/store/store';
import dispatch from '@/store/dispatch';
import { ACTIONS } from '@/store/constants';

export default function AppLayout({ children }) {
  const { user } = useStore();
  const { data: orgs } = useAppSWR(`/search/orgs`, {
    params: {
      page: 1,
      limit: 50,
      userId: user.id,
    },
  });

  useEffect(() => {
    if (orgs) {
      dispatch({ type: ACTIONS.ORGANIZATIONS.SET, payload: orgs.items });
    }
  }, [orgs]);

  if (!orgs?.items?.length) return null;

  return children;
}
