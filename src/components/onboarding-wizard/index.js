'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Globe,
  Wrench,
  Clock,
  Wallet,
  FileCheck,
} from 'lucide-react';
import axios from '@/lib/axios';
import { useAppDispatch, useAppState } from '@/store';
import { ACTIONS } from '@/store/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { TOAST_IDS } from '@/constants';

const STEPS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'expertise', label: 'Expertise', icon: Wrench },
  { id: 'languages', label: 'Languages', icon: Globe },
  { id: 'availability', label: 'Availability', icon: Clock },
  { id: 'payout', label: 'Payout', icon: Wallet },
  { id: 'agreement', label: 'Agreement', icon: FileCheck },
];

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

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required').max(50),
  lastName: z.string().min(1, 'Required').max(50),
  title: z.string().min(1, 'Required'),
  bio: z.string().max(500).optional(),
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

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAppState((s) => s.user);
  const dispatch = useAppDispatch();

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      title: user?.profile?.title || '',
      bio: user?.profile?.bio || '',
    },
  });

  // Expertise state
  const [cryptoExperience, setCryptoExperience] = useState('INTERMEDIATE');
  const [selectedChains, setSelectedChains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedCodingLangs, setSelectedCodingLangs] = useState([]);
  const [moderationExp, setModerationExp] = useState(false);
  const [researchExp, setResearchExp] = useState(false);
  const [fraudDetectionExp, setFraudDetectionExp] = useState(false);

  // Languages state
  const [selectedLanguages, setSelectedLanguages] = useState(['English']);

  // Availability state
  const [timezone, setTimezone] = useState('');
  const [availability, setAvailability] = useState('AVAILABLE');
  const [hoursPerWeek, setHoursPerWeek] = useState('10-20');

  // Payout state
  const [payoutMethod, setPayoutMethod] = useState('SOLANA_WALLET');
  const [payoutWallet, setPayoutWallet] = useState(user?.address || '');

  // Agreement state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToCodeOfConduct, setAgreedToCodeOfConduct] = useState(false);

  const toggleItem = (list, setList, item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return profileForm.formState.isValid;
      case 1: return selectedChains.length > 0 || selectedDomains.length > 0;
      case 2: return selectedLanguages.length > 0;
      case 3: return timezone !== '';
      case 4: return payoutWallet !== '';
      case 5: return agreedToTerms && agreedToCodeOfConduct;
      default: return true;
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('Setting up your profile...', {
      id: TOAST_IDS.UPDATE_PROFILE,
    });
    try {
      const profileData = profileForm.getValues();
      const method = !user.profile ? 'post' : 'patch';
      await axios[method](`/users/${user.id}/profile`, {
        ...profileData,
        cryptoExperienceLevel: cryptoExperience,
        chainsOfExpertise: selectedChains,
        protocolsOfExpertise: selectedDomains,
        codingLanguages: selectedCodingLangs,
        moderationExperience: moderationExp,
        researchExperience: researchExp,
        fraudDetectionExperience: fraudDetectionExp,
        languagesSpoken: selectedLanguages,
        timezone,
        availability,
      });

      await dispatch({ type: ACTIONS.USER.FETCH });
      toast.success('Profile setup complete! Welcome to Workclaw.', { id: toastId });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to save profile. Please try again.',
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Set up your profile</h2>
              <p className='text-gray-600'>Tell us about yourself so we can match you with the right work.</p>
            </div>
            <Form {...profileForm}>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={profileForm.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder='John' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder='Doe' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={profileForm.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title / Headline</FormLabel>
                      <FormControl>
                        <Input placeholder='AI trainer, Data annotator, Content reviewer, Research analyst...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short bio (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='A few sentences about your background and what kind of AI training work interests you...'
                          className='h-24'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>
        );

      case 1:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Your expertise</h2>
              <p className='text-gray-600'>Select your areas of knowledge. This helps us match you with relevant projects.</p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>AI training experience level</label>
              <Select value={cryptoExperience} onValueChange={setCryptoExperience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='BEGINNER'>Beginner (less than 1 year)</SelectItem>
                  <SelectItem value='INTERMEDIATE'>Intermediate (1-3 years)</SelectItem>
                  <SelectItem value='ADVANCED'>Advanced (3-5 years)</SelectItem>
                  <SelectItem value='EXPERT'>Expert (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Platforms & tools you know</label>
              <div className='flex flex-wrap gap-2'>
                {CHAINS.map((chain) => (
                  <ToggleChip
                    key={chain}
                    label={chain}
                    selected={selectedChains.includes(chain)}
                    onToggle={() => toggleItem(selectedChains, setSelectedChains, chain)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Domain expertise</label>
              <div className='flex flex-wrap gap-2'>
                {DOMAINS.map((domain) => (
                  <ToggleChip
                    key={domain}
                    label={domain}
                    selected={selectedDomains.includes(domain)}
                    onToggle={() => toggleItem(selectedDomains, setSelectedDomains, domain)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Coding languages (optional)</label>
              <div className='flex flex-wrap gap-2'>
                {CODING_LANGS.map((lang) => (
                  <ToggleChip
                    key={lang}
                    label={lang}
                    selected={selectedCodingLangs.includes(lang)}
                    onToggle={() => toggleItem(selectedCodingLangs, setSelectedCodingLangs, lang)}
                  />
                ))}
              </div>
            </div>

            <div className='space-y-3'>
              <label className='text-sm font-medium text-gray-700 block'>Additional experience</label>
              <div className='flex items-center gap-2'>
                <Checkbox checked={moderationExp} onCheckedChange={setModerationExp} id='moderation' />
                <label htmlFor='moderation' className='text-sm'>Community moderation experience</label>
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox checked={researchExp} onCheckedChange={setResearchExp} id='research' />
                <label htmlFor='research' className='text-sm'>Academic or industry research experience</label>
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox checked={fraudDetectionExp} onCheckedChange={setFraudDetectionExp} id='fraud' />
                <label htmlFor='fraud' className='text-sm'>Scam/fraud detection experience</label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Languages</h2>
              <p className='text-gray-600'>Select languages you can work in. Some projects require specific languages.</p>
            </div>
            <div className='flex flex-wrap gap-2'>
              {SPOKEN_LANGS.map((lang) => (
                <ToggleChip
                  key={lang}
                  label={lang}
                  selected={selectedLanguages.includes(lang)}
                  onToggle={() => toggleItem(selectedLanguages, setSelectedLanguages, lang)}
                />
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Availability</h2>
              <p className='text-gray-600'>Let us know when and how much you can work.</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Your timezone</label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder='Select timezone...' />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Hours per week</label>
              <Select value={hoursPerWeek} onValueChange={setHoursPerWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1-5'>1-5 hours</SelectItem>
                  <SelectItem value='5-10'>5-10 hours</SelectItem>
                  <SelectItem value='10-20'>10-20 hours</SelectItem>
                  <SelectItem value='20-40'>20-40 hours</SelectItem>
                  <SelectItem value='40+'>40+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Status</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='AVAILABLE'>Available for work</SelectItem>
                  <SelectItem value='UNAVAILABLE'>Not available right now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Payout method</h2>
              <p className='text-gray-600'>How would you like to receive payments?</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Payout method</label>
              <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='SOLANA_WALLET'>Solana Wallet (USDC)</SelectItem>
                  <SelectItem value='ETHEREUM_WALLET' disabled>Ethereum Wallet (coming soon)</SelectItem>
                  <SelectItem value='FIAT_PLACEHOLDER' disabled>Bank Transfer (coming soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Wallet address</label>
              <Input
                value={payoutWallet}
                onChange={(e) => setPayoutWallet(e.target.value)}
                placeholder='Your Solana wallet address'
              />
              <p className='text-xs text-gray-500 mt-1'>
                This is pre-filled with your connected wallet. You can change it later in settings.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Almost done</h2>
              <p className='text-gray-600'>Review and accept the contributor agreement.</p>
            </div>
            <Card>
              <CardContent className='p-6 space-y-4'>
                <div className='flex items-start gap-3'>
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={setAgreedToTerms}
                    id='terms'
                  />
                  <label htmlFor='terms' className='text-sm leading-relaxed'>
                    I agree to the Workclaw Terms of Service and understand that my work will be used for AI training purposes. I will be compensated for approved submissions.
                  </label>
                </div>
                <div className='flex items-start gap-3'>
                  <Checkbox
                    checked={agreedToCodeOfConduct}
                    onCheckedChange={setAgreedToCodeOfConduct}
                    id='conduct'
                  />
                  <label htmlFor='conduct' className='text-sm leading-relaxed'>
                    I agree to the Code of Conduct and will submit honest, high-quality work. I understand that fraudulent or low-effort submissions may result in score penalties or account suspension.
                  </label>
                </div>
              </CardContent>
            </Card>
            <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
              <h3 className='text-sm font-semibold text-gray-900 mb-2'>What happens next?</h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>1. Browse available screening tests to prove your expertise</li>
                <li>2. Pass screenings to unlock paid projects</li>
                <li>3. Complete tasks and earn USDC for approved work</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='max-w-2xl mx-auto'>
      {/* Progress Steps */}
      <div className='flex items-center justify-between mb-8 overflow-x-auto pb-2'>
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isComplete = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={step.id} className='flex items-center'>
              <button
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  isComplete && 'text-green-700 bg-green-50 cursor-pointer',
                  isCurrent && 'text-gray-900 bg-gray-100',
                  !isComplete && !isCurrent && 'text-gray-400'
                )}
              >
                {isComplete ? (
                  <CheckCircle className='h-4 w-4 text-green-600' />
                ) : (
                  <Icon className='h-4 w-4' />
                )}
                <span className='hidden sm:inline'>{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={cn('w-6 h-px mx-1', isComplete ? 'bg-green-300' : 'bg-gray-200')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className='mb-8'>
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className='flex justify-between'>
        <Button
          variant='outline'
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
        >
          <ChevronLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className='h-4 w-4 ml-2' />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed() || isSubmitting}
            className='bg-gray-900 hover:bg-gray-800'
          >
            {isSubmitting ? 'Setting up...' : 'Complete Setup'}
          </Button>
        )}
      </div>
    </div>
  );
}
