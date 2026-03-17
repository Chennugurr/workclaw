'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  User,
  Shield,
  Globe,
  Code,
  Wrench,
  Save,
  Wallet,
  Star,
  TrendingUp,
} from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { useAppState, useAppDispatch } from '@/store';
import { ACTIONS } from '@/store/constants';
import { TOAST_IDS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const CHAINS = [
  'Ethereum', 'Solana', 'Base', 'Arbitrum', 'Optimism', 'Polygon', 'BNB Chain',
  'Avalanche', 'Cosmos', 'Near', 'Sui', 'Aptos',
];

const DOMAINS = [
  'DeFi', 'NFTs', 'Wallets', 'Infrastructure', 'Gaming', 'Governance',
  'Memecoins', 'Security', 'Research', 'DAOs', 'RWA', 'Social',
];

const CODING_LANGS = [
  'Solidity', 'Rust', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Move', 'Vyper', 'Cairo',
];

const SPOKEN_LANGS = [
  'English', 'Spanish', 'Mandarin', 'Hindi', 'Portuguese', 'French',
  'German', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Turkish',
  'Vietnamese', 'Thai', 'Indonesian', 'Filipino',
];

const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+05:30', 'UTC+06:00',
  'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00',
  'UTC+12:00',
];

const TIER_LABELS = {
  NEW: 'New',
  VERIFIED: 'Verified',
  SKILLED: 'Skilled',
  TRUSTED: 'Trusted',
  EXPERT: 'Expert',
  ELITE_REVIEWER: 'Elite Reviewer',
};

const TIER_COLORS = {
  NEW: 'bg-gray-100 text-gray-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  SKILLED: 'bg-purple-100 text-purple-700',
  TRUSTED: 'bg-green-100 text-green-700',
  EXPERT: 'bg-orange-100 text-orange-700',
  ELITE_REVIEWER: 'bg-yellow-100 text-yellow-700',
};

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required').max(50),
  lastName: z.string().min(1, 'Required').max(50),
  title: z.string().min(1, 'Required'),
  bio: z.string().max(500).optional(),
  farcaster: z.string().optional(),
  ens: z.string().optional(),
});

function ToggleChip({ label, selected, onToggle }) {
  return (
    <button
      type='button'
      onClick={onToggle}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm border transition-colors',
        selected
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
      )}
    >
      {label}
    </button>
  );
}

export default function Page() {
  const user = useAppState((s) => s.user);
  const dispatch = useAppDispatch();
  const profile = user?.profile;
  const tier = user?.tier || 'NEW';

  const [isSaving, setIsSaving] = useState(false);
  const [chains, setChains] = useState(profile?.chainsOfExpertise || []);
  const [domains, setDomains] = useState(profile?.protocolsOfExpertise || []);
  const [codingLangs, setCodingLangs] = useState(profile?.codingLanguages || []);
  const [spokenLangs, setSpokenLangs] = useState(profile?.languagesSpoken || []);
  const [cryptoExp, setCryptoExp] = useState(profile?.cryptoExperienceLevel || '');
  const [timezone, setTimezone] = useState(profile?.timezone || '');
  const [availability, setAvailability] = useState(profile?.availability || 'AVAILABLE');
  const [moderationExp, setModerationExp] = useState(profile?.moderationExperience || false);
  const [researchExp, setResearchExp] = useState(profile?.researchExperience || false);
  const [fraudExp, setFraudExp] = useState(profile?.fraudDetectionExperience || false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      title: profile?.title || '',
      bio: profile?.bio || '',
      farcaster: profile?.farcaster || '',
      ens: profile?.ens || '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        title: profile.title || '',
        bio: profile.bio || '',
        farcaster: profile.farcaster || '',
        ens: profile.ens || '',
      });
      setChains(profile.chainsOfExpertise || []);
      setDomains(profile.protocolsOfExpertise || []);
      setCodingLangs(profile.codingLanguages || []);
      setSpokenLangs(profile.languagesSpoken || []);
      setCryptoExp(profile.cryptoExperienceLevel || '');
      setTimezone(profile.timezone || '');
      setAvailability(profile.availability || 'AVAILABLE');
      setModerationExp(profile.moderationExperience || false);
      setResearchExp(profile.researchExperience || false);
      setFraudExp(profile.fraudDetectionExperience || false);
    }
  }, [profile, form]);

  const toggleItem = (list, setList, item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    const toastId = toast.loading('Saving profile...', {
      id: TOAST_IDS.UPDATE_PROFILE,
    });
    try {
      const payload = {
        ...data,
        chainsOfExpertise: chains,
        protocolsOfExpertise: domains,
        codingLanguages: codingLangs,
        languagesSpoken: spokenLangs,
        cryptoExperienceLevel: cryptoExp || undefined,
        timezone: timezone || undefined,
        availability,
        moderationExperience: moderationExp,
        researchExperience: researchExp,
        fraudDetectionExperience: fraudExp,
      };

      const res = await axios.patch(`/users/${user.id}/profile`, payload);
      if (res.data.status === 'success') {
        toast.success('Profile updated', { id: toastId });
        dispatch({ type: ACTIONS.USER.UPDATE, payload: res.data.data });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to update profile.',
        { id: toastId }
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className='text-center py-12'>
        <User className='h-12 w-12 text-gray-300 mx-auto mb-4' />
        <h2 className='text-lg font-semibold text-gray-700 mb-2'>No profile yet</h2>
        <p className='text-sm text-gray-500'>
          Complete onboarding from your dashboard to create your profile.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Contributor Profile</h1>
          <p className='text-gray-500 mt-1'>Manage your expertise and preferences.</p>
        </div>
        <div className='flex items-center gap-3 mt-3 md:mt-0'>
          <Badge className={TIER_COLORS[tier]}>
            <Star className='h-3 w-3 mr-1' />
            {TIER_LABELS[tier]}
          </Badge>
          {profile.trustScore > 0 && (
            <Badge variant='outline'>
              <TrendingUp className='h-3 w-3 mr-1' />
              {(profile.trustScore * 100).toFixed(0)}% Quality
            </Badge>
          )}
        </div>
      </div>

      {/* Badges */}
      <BadgesSection userId={user?.id} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Basic Info */}
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <User className='h-5 w-5' />
                Basic Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel>Title / Headline</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. DeFi Researcher & Smart Contract Auditor' {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell teams about your background and what you bring...'
                          className='min-h-[100px]'
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Web3 Identity */}
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Wallet className='h-5 w-5' />
                Web3 Identity
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='farcaster'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farcaster</FormLabel>
                      <FormControl>
                        <Input placeholder='@username' {...field} disabled={isSaving} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ens'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ENS Name</FormLabel>
                      <FormControl>
                        <Input placeholder='name.eth' {...field} disabled={isSaving} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Crypto Expertise */}
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Crypto Expertise
              </h2>

              <div className='mb-5'>
                <label className='text-sm font-medium mb-2 block'>Experience Level</label>
                <Select value={cryptoExp} onValueChange={setCryptoExp} disabled={isSaving}>
                  <SelectTrigger className='w-full md:w-64'>
                    <SelectValue placeholder='Select level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='BEGINNER'>Beginner ({"<"}1 year)</SelectItem>
                    <SelectItem value='INTERMEDIATE'>Intermediate (1-3 years)</SelectItem>
                    <SelectItem value='ADVANCED'>Advanced (3-5 years)</SelectItem>
                    <SelectItem value='EXPERT'>Expert (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='mb-5'>
                <label className='text-sm font-medium mb-2 block'>Chains</label>
                <div className='flex flex-wrap gap-2'>
                  {CHAINS.map((chain) => (
                    <ToggleChip
                      key={chain}
                      label={chain}
                      selected={chains.includes(chain)}
                      onToggle={() => toggleItem(chains, setChains, chain)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className='text-sm font-medium mb-2 block'>Domains</label>
                <div className='flex flex-wrap gap-2'>
                  {DOMAINS.map((domain) => (
                    <ToggleChip
                      key={domain}
                      label={domain}
                      selected={domains.includes(domain)}
                      onToggle={() => toggleItem(domains, setDomains, domain)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Skills */}
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Code className='h-5 w-5' />
                Technical Skills
              </h2>

              <div className='mb-5'>
                <label className='text-sm font-medium mb-2 block'>Coding Languages</label>
                <div className='flex flex-wrap gap-2'>
                  {CODING_LANGS.map((lang) => (
                    <ToggleChip
                      key={lang}
                      label={lang}
                      selected={codingLangs.includes(lang)}
                      onToggle={() => toggleItem(codingLangs, setCodingLangs, lang)}
                    />
                  ))}
                </div>
              </div>

              <div className='space-y-3'>
                <label className='text-sm font-medium block'>Experience Areas</label>
                <label className='flex items-center gap-2 text-sm cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={moderationExp}
                    onChange={(e) => setModerationExp(e.target.checked)}
                    className='rounded border-gray-300'
                    disabled={isSaving}
                  />
                  Content moderation experience
                </label>
                <label className='flex items-center gap-2 text-sm cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={researchExp}
                    onChange={(e) => setResearchExp(e.target.checked)}
                    className='rounded border-gray-300'
                    disabled={isSaving}
                  />
                  Crypto/blockchain research experience
                </label>
                <label className='flex items-center gap-2 text-sm cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={fraudExp}
                    onChange={(e) => setFraudExp(e.target.checked)}
                    className='rounded border-gray-300'
                    disabled={isSaving}
                  />
                  Fraud detection / scam identification experience
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Languages & Availability */}
          <Card>
            <CardContent className='p-6'>
              <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Globe className='h-5 w-5' />
                Languages & Availability
              </h2>

              <div className='mb-5'>
                <label className='text-sm font-medium mb-2 block'>Languages Spoken</label>
                <div className='flex flex-wrap gap-2'>
                  {SPOKEN_LANGS.map((lang) => (
                    <ToggleChip
                      key={lang}
                      label={lang}
                      selected={spokenLangs.includes(lang)}
                      onToggle={() => toggleItem(spokenLangs, setSpokenLangs, lang)}
                    />
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium mb-2 block'>Timezone</label>
                  <Select value={timezone} onValueChange={setTimezone} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-sm font-medium mb-2 block'>Availability</label>
                  <Select value={availability} onValueChange={setAvailability} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='AVAILABLE'>Available</SelectItem>
                      <SelectItem value='PARTIALLY_AVAILABLE'>Partially Available</SelectItem>
                      <SelectItem value='NOT_AVAILABLE'>Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className='flex justify-end'>
            <Button type='submit' disabled={isSaving} className='min-w-[140px]'>
              <Save className='h-4 w-4 mr-2' />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

function BadgesSection({ userId }) {
  const { data: badges } = useAppSWR(userId ? `/contributors/${userId}/badges` : null);

  if (!badges || badges.length === 0) {
    return (
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <h2 className='text-lg font-semibold mb-2'>Badges</h2>
          <p className='text-sm text-gray-400'>
            Complete screenings and tasks to earn badges.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mb-6'>
      <CardContent className='p-6'>
        <h2 className='text-lg font-semibold mb-4'>Badges</h2>
        <div className='flex flex-wrap gap-3'>
          {badges.map((badge) => (
            <div
              key={badge.id}
              className='flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border'
              title={badge.description}
            >
              <span className='text-lg'>{badge.icon}</span>
              <span className='text-sm font-medium'>{badge.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
