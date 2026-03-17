'use client';

import './globals.css';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { TOAST_IDS } from '@/constants';
import { ACTIONS } from '@/store/constants';
import { useAppDispatch, useAppState } from '@/store';
import MVPBanner from '@/components/banners/mvp';
import useSIWS from '@/hooks/use-siws';
import axios from '@/lib/axios';

export default function AppLayout({ children }) {
  const { disconnect } = useDisconnect();
  const [isSIWSInProgress, setIsSIWSInProgress] = useState(false);
  // const { isReconnecting, isConnecting, isConnected, address } = useAccount();
  const { address, isConnected } = useAppKitAccount();
  const { authenticated } = useAppState();
  const dispatch = useAppDispatch();
  const { signMessage } = useSIWS();

  const handleSIWS = useCallback(async () => {
    if (isSIWSInProgress) return;
    setIsSIWSInProgress(true);
    const toastId = toast.loading('Signing message...', {
      id: TOAST_IDS.SIWS,
    });
    try {
      // Proceed with SIWS authentication
      console.log('Authentication required, initiating SIWS');

      const { token } = await signMessage();

      // Send the signed message to the backend
      const res = await axios.post('/auth/siws', undefined, {
        headers: {
          'Content-Type': 'application/json',
          'X-Siws-Token': token,
        },
      });
      const { accessToken, refreshToken } = res.data.data;

      // Store the tokens
      localStorage.setItem('@app/ls/ast', accessToken);
      localStorage.setItem('@app/ls/rft', refreshToken);

      // Fetch user data
      await dispatch({ type: ACTIONS.USER.FETCH });

      toast.success('Authentication successful', { id: toastId });
    } catch (error) {
      disconnect();
      console.error('Authentication failed:', error);
      toast.error('Authentication failed', { id: toastId });
    } finally {
      setIsSIWSInProgress(false);
    }
  }, [isSIWSInProgress, dispatch, signMessage, disconnect]);

  const handleLogout = useCallback(() => {
    if (isConnected || !!address) return;
    localStorage.removeItem('@app/ls/ast');
    localStorage.removeItem('@app/ls/rft');
    localStorage.removeItem('@app/ls/store');
    dispatch({ type: ACTIONS.USER.LOGOUT });
  }, [isConnected, address, dispatch]);

  useEffect(() => {
    if (!isConnected && authenticated) handleLogout();
    if (isConnected && !authenticated) handleSIWS();
  }, [isConnected, authenticated, handleLogout, handleSIWS]);

  return (
    <>
      {children}
      <MVPBanner />
    </>
  );
}
