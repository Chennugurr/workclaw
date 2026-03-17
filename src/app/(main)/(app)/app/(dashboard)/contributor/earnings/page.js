'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Send,
  CreditCard,
} from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

const ENTRY_TYPE_CONFIG = {
  TASK_EARNING: { label: 'Task Earning', icon: CheckCircle2, color: 'text-green-600' },
  BONUS: { label: 'Bonus', icon: TrendingUp, color: 'text-blue-600' },
  STREAK_INCENTIVE: { label: 'Streak Bonus', icon: TrendingUp, color: 'text-purple-600' },
  QUALITY_BONUS: { label: 'Quality Bonus', icon: TrendingUp, color: 'text-green-600' },
  REFERRAL_CREDIT: { label: 'Referral', icon: ArrowUpRight, color: 'text-blue-500' },
  MANUAL_ADJUSTMENT: { label: 'Adjustment', icon: DollarSign, color: 'text-gray-600' },
  PAYOUT_DEBIT: { label: 'Payout', icon: ArrowDownRight, color: 'text-red-500' },
  REVERSAL: { label: 'Reversal', icon: ArrowDownRight, color: 'text-red-600' },
  HOLD: { label: 'Hold', icon: Clock, color: 'text-orange-500' },
};

const PAYOUT_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  DISPUTED: { label: 'Disputed', color: 'bg-orange-100 text-orange-700' },
  HELD: { label: 'Held', color: 'bg-gray-100 text-gray-700' },
};

const METHOD_LABELS = {
  SOLANA_WALLET: 'Solana Wallet (USDC)',
  ETHEREUM_WALLET: 'Ethereum Wallet (USDC)',
  FIAT_PLACEHOLDER: 'Bank Transfer',
  PAYPAL_PLACEHOLDER: 'PayPal',
};

export default function Page() {
  const [period, setPeriod] = useState('month');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [methodType, setMethodType] = useState('SOLANA_WALLET');
  const [methodAddress, setMethodAddress] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: earnings, isLoading } = useAppSWR(`/earnings?period=${period}`);
  const { data: methods, mutate: mutateMethods } = useAppSWR('/payout-methods');
  const { data: payoutsResult } = useAppSWR('/payouts?limit=10');

  const payouts = payoutsResult?.data || [];
  const summary = earnings?.summary || {};
  const entries = earnings?.entries || [];

  const addPayoutMethod = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.post('/payout-methods', {
        type: methodType,
        details: { address: methodAddress },
        isPrimary: !methods || methods.length === 0,
      });
      if (res.data.status === 'success') {
        toast.success('Payout method added');
        setShowAddMethod(false);
        setMethodAddress('');
        mutateMethods();
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to add method.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestPayout = async () => {
    if (!selectedMethod) {
      toast.error('Select a payout method');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post('/payouts', { methodId: selectedMethod });
      if (res.data.status === 'success') {
        toast.success('Payout requested!');
        setShowPayout(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to request payout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Earnings</h1>
          <p className='text-gray-500'>Track your income and manage payouts.</p>
        </div>
        <div className='flex gap-2'>
          <Sheet open={showAddMethod} onOpenChange={setShowAddMethod}>
            <SheetTrigger asChild>
              <Button variant='outline' size='sm'>
                <Plus className='h-3.5 w-3.5 mr-1' />
                Add Method
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-[90vw] sm:w-[400px]'>
              <SheetHeader>
                <SheetTitle>Add Payout Method</SheetTitle>
              </SheetHeader>
              <div className='space-y-4 mt-6'>
                <div>
                  <label className='text-sm font-medium mb-2 block'>Type</label>
                  <Select value={methodType} onValueChange={setMethodType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='SOLANA_WALLET'>Solana Wallet (USDC)</SelectItem>
                      <SelectItem value='ETHEREUM_WALLET'>Ethereum Wallet (USDC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-sm font-medium mb-2 block'>Wallet Address</label>
                  <Input
                    value={methodAddress}
                    onChange={(e) => setMethodAddress(e.target.value)}
                    placeholder='Enter wallet address'
                  />
                </div>
                <Button onClick={addPayoutMethod} disabled={isSubmitting || !methodAddress} className='w-full'>
                  {isSubmitting ? 'Adding...' : 'Add Method'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showPayout} onOpenChange={setShowPayout}>
            <SheetTrigger asChild>
              <Button size='sm'>
                <Send className='h-3.5 w-3.5 mr-1' />
                Request Payout
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-[90vw] sm:w-[400px]'>
              <SheetHeader>
                <SheetTitle>Request Payout</SheetTitle>
              </SheetHeader>
              <div className='space-y-4 mt-6'>
                <div className='p-4 bg-green-50 rounded-lg text-center'>
                  <p className='text-sm text-green-700'>Available Balance</p>
                  <p className='text-3xl font-bold text-green-800'>${summary.pendingBalance || '0.00'}</p>
                </div>
                {methods && methods.length > 0 ? (
                  <>
                    <div>
                      <label className='text-sm font-medium mb-2 block'>Payout Method</label>
                      <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select method' />
                        </SelectTrigger>
                        <SelectContent>
                          {methods.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {METHOD_LABELS[m.type]} {m.details?.address ? `(${m.details.address.slice(0, 6)}...)` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={requestPayout} disabled={isSubmitting || !selectedMethod} className='w-full'>
                      {isSubmitting ? 'Requesting...' : 'Request Full Payout'}
                    </Button>
                  </>
                ) : (
                  <p className='text-sm text-gray-500 text-center'>
                    Add a payout method first to request a payout.
                  </p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Period Selector */}
      <div className='flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit'>
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === p.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <SummaryCard
          icon={DollarSign}
          iconBg='bg-green-50'
          iconColor='text-green-600'
          label='Period Earnings'
          value={`$${summary.periodEarnings || '0.00'}`}
        />
        <SummaryCard
          icon={Clock}
          iconBg='bg-yellow-50'
          iconColor='text-yellow-600'
          label='Pending'
          value={`$${summary.pendingBalance || '0.00'}`}
        />
        <SummaryCard
          icon={CheckCircle2}
          iconBg='bg-blue-50'
          iconColor='text-blue-600'
          label='Total Paid'
          value={`$${summary.paidOut || '0.00'}`}
        />
        <SummaryCard
          icon={Wallet}
          iconBg='bg-purple-50'
          iconColor='text-purple-600'
          label='Balance'
          value={`$${summary.totalBalance || '0.00'}`}
        />
      </div>

      {/* Payout Methods */}
      {methods && methods.length > 0 && (
        <Card className='mb-6'>
          <CardContent className='p-5'>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <CreditCard className='h-4 w-4' />
              Payout Methods
            </h3>
            <div className='space-y-2'>
              {methods.map((m) => (
                <div key={m.id} className='flex items-center justify-between py-2 border-b last:border-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>{METHOD_LABELS[m.type]}</span>
                    {m.isPrimary && <Badge variant='secondary' className='text-xs'>Primary</Badge>}
                  </div>
                  <span className='text-xs text-gray-400 font-mono'>
                    {m.details?.address ? `${m.details.address.slice(0, 8)}...${m.details.address.slice(-4)}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payouts */}
      {payouts.length > 0 && (
        <Card className='mb-6'>
          <CardContent className='p-5'>
            <h3 className='font-semibold mb-3'>Recent Payouts</h3>
            <div className='space-y-2'>
              {payouts.map((p) => {
                const statusCfg = PAYOUT_STATUS_CONFIG[p.status] || PAYOUT_STATUS_CONFIG.PENDING;
                return (
                  <div key={p.id} className='flex items-center justify-between py-2 border-b last:border-0'>
                    <div>
                      <span className='text-sm font-medium'>${parseFloat(p.amount).toFixed(2)}</span>
                      <span className='text-xs text-gray-400 ml-2'>
                        {dayjs(p.createdAt).format('MMM D, YYYY')}
                      </span>
                    </div>
                    <Badge className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger */}
      <Card>
        <CardContent className='p-5'>
          <h3 className='font-semibold mb-3'>Transaction History</h3>
          {isLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='h-10 bg-gray-100 rounded animate-pulse' />
              ))}
            </div>
          ) : entries.length > 0 ? (
            <div className='space-y-1'>
              {entries.map((entry) => {
                const cfg = ENTRY_TYPE_CONFIG[entry.type] || ENTRY_TYPE_CONFIG.TASK_EARNING;
                const Icon = cfg.icon;
                const amount = parseFloat(entry.amount);
                const isPositive = amount >= 0;

                return (
                  <div key={entry.id} className='flex items-center justify-between py-2 border-b last:border-0'>
                    <div className='flex items-center gap-3'>
                      <Icon className={`h-4 w-4 ${cfg.color} shrink-0`} />
                      <div>
                        <p className='text-sm font-medium'>{cfg.label}</p>
                        {entry.note && (
                          <p className='text-xs text-gray-400'>{entry.note}</p>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{amount.toFixed(2)} USDC
                      </p>
                      <p className='text-xs text-gray-400'>
                        {dayjs(entry.createdAt).format('MMM D, h:mm A')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className='text-sm text-gray-400 text-center py-6'>
              No transactions yet. Complete tasks to start earning.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function SummaryCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs text-gray-500'>{label}</p>
            <p className='text-xl font-bold mt-1'>{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
