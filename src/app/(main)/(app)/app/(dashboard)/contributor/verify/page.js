'use client';

import { useEffect, useRef, useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAppSWR from '@/hooks/use-app-swr';
import axios from 'axios';

export default function VerifyPage() {
  const sdkContainerRef = useRef(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const { data: result, mutate } = useAppSWR('/users/me');
  const user = result?.data;

  // Load Sumsub WebSDK script
  useEffect(() => {
    if (document.getElementById('sumsub-sdk')) {
      setSdkLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'sumsub-sdk';
    script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js';
    script.onload = () => setSdkLoaded(true);
    document.head.appendChild(script);
  }, []);

  const startVerification = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await axios.post('/api/kyc/token');
      const token = res.data?.data?.token;

      if (!token) throw new Error('Failed to get verification token');

      const snsWebSdkInstance = window.snsWebSdk
        .init(token, () => axios.post('/api/kyc/token').then(r => r.data?.data?.token))
        .withConf({ lang: 'en' })
        .withOptions({ addViewportTag: false, adaptIframeHeight: true })
        .on('idCheck.onStepCompleted', () => {})
        .on('idCheck.onApplicantStatusChanged', (payload) => {
          if (payload?.reviewResult?.reviewAnswer === 'GREEN' || payload?.reviewStatus === 'completed') {
            mutate(); // refresh user data
          }
        })
        .on('idCheck.onError', (err) => {
          setError('Verification encountered an error. Please try again.');
          console.error('Sumsub error:', err);
        })
        .build();

      snsWebSdkInstance.launch('#sumsub-container');
    } catch (err) {
      setError(err.message || 'Failed to start verification');
    } finally {
      setStarting(false);
    }
  };

  const kycStatus = user?.kycStatus || 'NONE';

  if (kycStatus === 'VERIFIED') {
    return (
      <div className='max-w-lg mx-auto mt-16 text-center'>
        <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
        <h1 className='text-2xl font-bold mb-2'>Identity Verified</h1>
        <p className='text-gray-500'>Your identity has been successfully verified. You can now request payouts.</p>
      </div>
    );
  }

  if (kycStatus === 'REJECTED') {
    return (
      <div className='max-w-lg mx-auto mt-16 text-center'>
        <XCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
        <h1 className='text-2xl font-bold mb-2'>Verification Failed</h1>
        <p className='text-gray-500 mb-6'>Your identity verification was not successful. Please try again or contact support.</p>
        <Button onClick={startVerification} disabled={starting || !sdkLoaded}>
          Try Again
        </Button>
        <div id='sumsub-container' ref={sdkContainerRef} className='mt-6' />
      </div>
    );
  }

  if (kycStatus === 'PENDING') {
    return (
      <div className='max-w-lg mx-auto mt-16 text-center'>
        <Clock className='h-16 w-16 text-yellow-500 mx-auto mb-4' />
        <h1 className='text-2xl font-bold mb-2'>Verification In Progress</h1>
        <p className='text-gray-500'>Your documents are being reviewed. This usually takes a few minutes to 24 hours.</p>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold mb-2'>Verify Your Identity</h1>
        <p className='text-gray-500'>Identity verification is required to withdraw earnings. This process takes 2–5 minutes.</p>
      </div>

      <div className='bg-gray-50 border rounded-xl p-6 mb-6'>
        <div className='flex items-start gap-4'>
          <Shield className='h-8 w-8 text-purple-500 mt-1 shrink-0' />
          <div>
            <h3 className='font-semibold mb-1'>What you&apos;ll need</h3>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• A government-issued ID (passport, driver&apos;s license, or national ID)</li>
              <li>• A device with a camera</li>
              <li>• 2–5 minutes of your time</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm'>
          {error}
        </div>
      )}

      {kycStatus === 'NONE' && !sdkLoaded && (
        <Button disabled className='w-full'>Loading...</Button>
      )}

      {kycStatus === 'NONE' && sdkLoaded && (
        <Button onClick={startVerification} disabled={starting} className='w-full bg-purple-600 hover:bg-purple-700'>
          {starting ? 'Starting...' : 'Start Verification'}
        </Button>
      )}

      <div id='sumsub-container' ref={sdkContainerRef} className='mt-6' />
    </div>
  );
}
