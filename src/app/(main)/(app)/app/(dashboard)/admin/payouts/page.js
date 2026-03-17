'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { MoreHorizontal, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  DISPUTED: { label: 'Disputed', color: 'bg-orange-100 text-orange-700' },
  HELD: { label: 'Held', color: 'bg-gray-100 text-gray-700' },
};

const METHOD_LABELS = {
  SOLANA_WALLET: 'Solana (USDC)',
  ETHEREUM_WALLET: 'Ethereum (USDC)',
  FIAT_PLACEHOLDER: 'Bank Transfer',
  PAYPAL_PLACEHOLDER: 'PayPal',
};

export default function Page() {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [processPayout, setProcessPayout] = useState(null);
  const [txHash, setTxHash] = useState('');

  const { data: result, isLoading, mutate } = useAppSWR(
    `/admin/payouts?status=${statusFilter}`
  );
  const payouts = result?.data || [];

  const handleStatusChange = async (payoutId, status, extra = {}) => {
    try {
      const res = await axios.patch(`/admin/payouts/${payoutId}`, { status, ...extra });
      if (res.data.status === 'success') {
        toast.success(`Payout ${status.toLowerCase()}`);
        mutate();
        setProcessPayout(null);
        setTxHash('');
      }
    } catch (error) {
      toast.error('Failed to update payout');
    }
  };

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Payout Management</h1>

      <div className='flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit'>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : payouts.length > 0 ? (
        <div className='space-y-2'>
          {payouts.map((payout) => {
            const cfg = STATUS_CONFIG[payout.status] || STATUS_CONFIG.PENDING;
            const profile = payout.user?.profile;
            const name = profile ? `${profile.firstName} ${profile.lastName}` : payout.user?.address?.slice(0, 10);

            return (
              <Card key={payout.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='font-medium'>${parseFloat(payout.amount).toFixed(2)} USDC</p>
                        <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                      </div>
                      <div className='flex items-center gap-3 text-xs text-gray-500'>
                        <span>{name}</span>
                        <span>{METHOD_LABELS[payout.method?.type] || 'Unknown'}</span>
                        <span>{dayjs(payout.createdAt).format('MMM D, YYYY h:mm A')}</span>
                        {payout.txHash && <span className='font-mono'>tx: {payout.txHash.slice(0, 8)}...</span>}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        {payout.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(payout.id, 'APPROVED')}>
                              <CheckCircle2 className='mr-2 h-4 w-4' /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(payout.id, 'HELD')}>
                              <Clock className='mr-2 h-4 w-4' /> Hold
                            </DropdownMenuItem>
                          </>
                        )}
                        {payout.status === 'APPROVED' && (
                          <DropdownMenuItem onClick={() => setProcessPayout(payout)}>
                            <Loader2 className='mr-2 h-4 w-4' /> Process & Complete
                          </DropdownMenuItem>
                        )}
                        {['PENDING', 'APPROVED', 'HELD'].includes(payout.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(payout.id, 'FAILED')}
                              className='text-red-600'
                            >
                              <XCircle className='mr-2 h-4 w-4' /> Fail & Reverse
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className='text-sm text-gray-400 text-center py-8'>
          No {STATUS_CONFIG[statusFilter]?.label.toLowerCase()} payouts.
        </p>
      )}

      {/* Process Payout Sheet */}
      <Sheet open={!!processPayout} onOpenChange={() => { setProcessPayout(null); setTxHash(''); }}>
        <SheetContent side='right' className='w-[90vw] sm:w-[400px]'>
          <SheetHeader>
            <SheetTitle>Complete Payout</SheetTitle>
          </SheetHeader>
          {processPayout && (
            <div className='space-y-4 mt-6'>
              <div className='p-4 bg-green-50 rounded-lg text-center'>
                <p className='text-sm text-green-700'>Amount</p>
                <p className='text-3xl font-bold text-green-800'>
                  ${parseFloat(processPayout.amount).toFixed(2)} USDC
                </p>
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>Transaction Hash</label>
                <Input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder='Enter on-chain tx hash'
                />
              </div>
              <Button
                className='w-full'
                onClick={() => handleStatusChange(processPayout.id, 'COMPLETED', { txHash })}
                disabled={!txHash}
              >
                Mark as Completed
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
