'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  Search,
  Shield,
  MoreHorizontal,
  AlertTriangle,
} from 'lucide-react';
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

const TIER_COLORS = {
  NEW: 'bg-gray-100 text-gray-600',
  VERIFIED: 'bg-blue-100 text-blue-700',
  SKILLED: 'bg-green-100 text-green-700',
  TRUSTED: 'bg-purple-100 text-purple-700',
  EXPERT: 'bg-orange-100 text-orange-700',
  ELITE_REVIEWER: 'bg-red-100 text-red-700',
};

const TIERS = ['NEW', 'VERIFIED', 'SKILLED', 'TRUSTED', 'EXPERT', 'ELITE_REVIEWER'];
const ROLES = ['CONTRIBUTOR', 'CUSTOMER', 'REVIEWER', 'ADMIN'];
const KYC_STATUSES = ['NONE', 'PENDING', 'VERIFIED', 'REJECTED'];

export default function Page() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const queryParts = [];
  if (roleFilter !== 'all') queryParts.push(`role=${roleFilter}`);
  if (tierFilter !== 'all') queryParts.push(`tier=${tierFilter}`);
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  const { data: result, isLoading, mutate } = useAppSWR(`/admin/users${query}`);
  const users = result?.data || [];

  const handleUpdate = async (userId, data) => {
    try {
      const res = await axios.patch(`/admin/users/${userId}`, data);
      if (res.data.status === 'success') {
        toast.success('User updated');
        mutate();
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to update user');
    }
  };

  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>User Management</h1>

      <div className='flex flex-wrap gap-3 mb-6'>
        <div className='relative flex-1 min-w-[200px]'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search by name, email, or address...'
            className='pl-9'
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Role' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Tier' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Tiers</SelectItem>
            {TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className='h-16 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : (
        <div className='space-y-2'>
          {users.map((user) => {
            const profile = user.profile;
            const name = profile ? `${profile.firstName} ${profile.lastName}` : user.address.slice(0, 10) + '...';
            const tierColor = TIER_COLORS[user.tier] || TIER_COLORS.NEW;

            return (
              <Card key={user.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium'>
                        {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium'>{name}</p>
                          <Badge className={`text-xs ${tierColor}`}>{user.tier}</Badge>
                          <Badge variant='outline' className='text-xs'>{user.role}</Badge>
                          {user.kycStatus === 'VERIFIED' && (
                            <Badge className='text-xs bg-green-100 text-green-700'>KYC</Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-3 text-xs text-gray-500'>
                          <span>{user.address.slice(0, 6)}...{user.address.slice(-4)}</span>
                          {profile?.email && <span>{profile.email}</span>}
                          <span>Joined {dayjs(user.createdAt).format('MMM D, YYYY')}</span>
                          <span>{user._count.taskSubmissions} submissions</span>
                          {user._count.fraudFlags > 0 && (
                            <span className='text-red-500 flex items-center gap-1'>
                              <AlertTriangle className='h-3 w-3' /> {user._count.fraudFlags} flags
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {TIERS.filter((t) => t !== user.tier).map((t) => (
                          <DropdownMenuItem key={t} onClick={() => handleUpdate(user.id, { tier: t })}>
                            Set Tier: {t}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        {ROLES.filter((r) => r !== user.role).map((r) => (
                          <DropdownMenuItem key={r} onClick={() => handleUpdate(user.id, { role: r })}>
                            Set Role: {r}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        {KYC_STATUSES.filter((k) => k !== user.kycStatus).map((k) => (
                          <DropdownMenuItem key={k} onClick={() => handleUpdate(user.id, { kycStatus: k })}>
                            KYC: {k}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* User Detail Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent side='right' className='w-[90vw] sm:w-[500px] overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className='space-y-4 mt-6'>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div><span className='text-gray-500'>ID:</span> {selectedUser.id}</div>
                <div><span className='text-gray-500'>Role:</span> {selectedUser.role}</div>
                <div><span className='text-gray-500'>Tier:</span> {selectedUser.tier}</div>
                <div><span className='text-gray-500'>KYC:</span> {selectedUser.kycStatus}</div>
                <div><span className='text-gray-500'>Address:</span> {selectedUser.address}</div>
                <div><span className='text-gray-500'>Submissions:</span> {selectedUser._count.taskSubmissions}</div>
              </div>
              {selectedUser.profile && (
                <div className='grid grid-cols-2 gap-3 text-sm border-t pt-4'>
                  <div><span className='text-gray-500'>Trust:</span> {selectedUser.profile.trustScore?.toFixed(2)}</div>
                  <div><span className='text-gray-500'>Reviewer:</span> {selectedUser.profile.reviewerScore?.toFixed(2)}</div>
                  <div><span className='text-gray-500'>Integrity:</span> {selectedUser.profile.integrityScore?.toFixed(2)}</div>
                </div>
              )}
              {selectedUser.badges?.length > 0 && (
                <div className='border-t pt-4'>
                  <p className='text-sm text-gray-500 mb-2'>Badges</p>
                  <div className='flex flex-wrap gap-1'>
                    {selectedUser.badges.map((b) => (
                      <Badge key={b} variant='secondary' className='text-xs'>{b}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
