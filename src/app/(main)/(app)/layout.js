'use client';

import './globals.css';
import { useCallback, useEffect, useRef } from 'react';
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
  const siwsInProgress = useRef(false);
  const sessionRestored = useRef(false);
  const { address, isConnected } = useAppKitAccount();
  const { authenticated } = useAppState();
  const dispatch = useAppDispatch();
  const { signMessage } = useSIWS();

  // Try to restore session from existing tokens on mount
  useEffect(() => {
    if (sessionRestored.current) return;
    sessionRestored.current = true;

    const accessToken = localStorage.getItem('@app/ls/ast');
    const refreshToken = localStorage.getItem('@app/ls/rft');
    if (!accessToken && !refreshToken) return;

    // We have tokens — try to restore the session via whoami
    dispatch({ type: ACTIONS.USER.FETCH }).catch(() => {
      // Tokens are invalid, clear them
      localStorage.removeItem('@app/ls/ast');
      localStorage.removeItem('@app/ls/rft');
    });
  }, [dispatch]);

  const handleSIWS = useCallback(async () => {
    if (siwsInProgress.current) return;
    siwsInProgress.current = true;
    const toastId = toast.loading('Signing message...', {
      id: TOAST_IDS.SIWS,
    });
    try {
      console.log('Authentication required, initiating SIWS');

      const { token } = await signMessage();

      const res = await axios.post('/auth/siws', undefined, {
        headers: {
          'Content-Type': 'application/json',
          'X-Siws-Token': token,
        },
      });
      const { accessToken, refreshToken } = res.data.data;

      localStorage.setItem('@app/ls/ast', accessToken);
      localStorage.setItem('@app/ls/rft', refreshToken);

      await dispatch({ type: ACTIONS.USER.FETCH });

      toast.success('Authentication successful', { id: toastId });
    } catch (error) {
      disconnect();
      console.error('Authentication failed:', error);
      toast.error('Authentication failed', { id: toastId });
    } finally {
      siwsInProgress.current = false;
    }
  }, [dispatch, signMessage, disconnect]);

  const handleLogout = useCallback(() => {
    if (isConnected || !!address) return;
    localStorage.removeItem('@app/ls/ast');
    localStorage.removeItem('@app/ls/rft');
    localStorage.removeItem('@app/ls/store');
    dispatch({ type: ACTIONS.USER.LOGOUT });
  }, [isConnected, address, dispatch]);

  useEffect(() => {
    // Don't logout immediately on load — wallet reconnection is async and takes time.
    // Only logout if wallet is truly disconnected AND we don't have valid tokens.
    if (!isConnected && authenticated) {
      const hasTokens = !!localStorage.getItem('@app/ls/ast') || !!localStorage.getItem('@app/ls/rft');
      if (!hasTokens) {
        handleLogout();
      }
      // If we have tokens, wait — wallet may still be reconnecting
      return;
    }
    // Wallet connected but not authenticated and no tokens — need fresh SIWS
    if (isConnected && !authenticated) {
      const hasTokens = !!localStorage.getItem('@app/ls/ast');
      if (!hasTokens) {
        handleSIWS();
      }
    }
  }, [isConnected, authenticated, handleLogout, handleSIWS]);

  return (
    <>
      {children}
      <MVPBanner />
    </>
  );
}
