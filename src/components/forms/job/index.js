'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  Settings2,
  Shield,
  DollarSign,
} from 'lucide-react';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TASK_TYPE_LABELS } from '@/components/task-types';

const STEPS = [
  { key: 'basics', label: 'Basics', icon: FileText },
  { key: 'compensation', label: 'Compensation', icon: DollarSign },
  { key: 'quality', label: 'Quality & Access', icon: Shield },
  { key: 'settings', label: 'Settings', icon: Settings2 },
];

const DOMAINS = [
  'DeFi', 'Smart Contracts', 'Security', 'NFTs', 'Infrastructure',
  'Governance', 'AI/ML', 'Research', 'Content', 'Compliance',
  'Gaming', 'DAOs', 'Layer 2', 'Cross-chain', 'Privacy',
];

const CHAIN_TAGS = [
  'Ethereum', 'Solana', 'Polygon', 'Arbitrum', 'Optimism',
  'Avalanche', 'BNB Chain', 'Base', 'Cosmos', 'Bitcoin',
  'TON', 'Sui', 'Aptos', 'Near', 'Polkadot',
];

const TIER_LABELS = {
  NEW: 'New (Anyone)',
  VERIFIED: 'Verified (10+ tasks)',
  SKILLED: 'Skilled (50+ tasks)',
  TRUSTED: 'Trusted (100+ tasks)',
  EXPERT: 'Expert (200+ tasks)',
  ELITE_REVIEWER: 'Elite Reviewer (500+ tasks)',
};

const DIFFICULTY_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
};

export default function ProjectWizard({ project }) {
  const router = useRouter();
  const { organization: { selected: org } } = useAppState();
  const isEdit = !!project?.id;
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    taskType: project?.taskType || '',
    domain: project?.domain || [],
    chainTags: project?.chainTags || [],
    modelOrUseCase: project?.modelOrUseCase || '',
    payModel: project?.payModel || 'PER_TASK',
    rateAmount: project?.rateAmount ? parseFloat(project.rateAmount) : 0,
    difficulty: project?.difficulty || 'INTERMEDIATE',
    qualityThreshold: project?.qualityThreshold ?? 0.8,
    qualityBonusEligible: project?.qualityBonusEligible ?? false,
    capacity: project?.capacity || '',
    taskVolume: project?.taskVolume || '',
    goldTaskRatio: project?.goldTaskRatio ?? 0.05,
    visibility: project?.visibility || 'PUBLIC',
    requiredTier: project?.requiredTier || 'NEW',
    regionLimits: project?.regionLimits || [],
    languageLimits: project?.languageLimits || [],
    reviewPolicy: project?.reviewPolicy || '',
    disputeRules: project?.disputeRules || '',
    payoutRules: project?.payoutRules || '',
    status: project?.status || 'DRAFT',
  });

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key, item) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((i) => i !== item)
        : [...prev[key], item],
    }));
  };

  const canProceed = () => {
    if (step === 0) return form.title && form.description && form.taskType;
    if (step === 1) return form.rateAmount > 0;
    return true;
  };

  const handleSubmit = async (asDraft = true) => {
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        rateAmount: parseFloat(form.rateAmount) || 0,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        taskVolume: form.taskVolume ? parseInt(form.taskVolume) : null,
        modelOrUseCase: form.modelOrUseCase || null,
        reviewPolicy: form.reviewPolicy || null,
        disputeRules: form.disputeRules || null,
        payoutRules: form.payoutRules || null,
        status: asDraft ? 'DRAFT' : 'OPEN',
      };

      let res;
      if (isEdit) {
        res = await axios.patch(`/orgs/${org.id}/projects/${project.id}`, payload);
      } else {
        res = await axios.post(`/orgs/${org.id}/projects`, payload);
      }

      if (res.data.status === 'success') {
        toast.success(isEdit ? 'Project updated' : asDraft ? 'Project saved as draft' : 'Project published');
        if (!isEdit) {
          router.push(`/app/customer/projects/${res.data.data.id}/edit`);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.message || 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold mb-1'>
        {isEdit ? 'Edit Project' : 'Create New Project'}
      </h1>
      <p className='text-gray-500 mb-6'>
        {isEdit ? 'Update your project configuration.' : 'Set up a new AI work project for contributors.'}
      </p>

      {/* Step Indicator */}
      <div className='flex items-center gap-2 mb-8'>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <button
              key={s.key}
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : isDone
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isDone ? <Check className='h-4 w-4' /> : <Icon className='h-4 w-4' />}
              <span className='hidden sm:inline'>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step 0: Basics */}
      {step === 0 && (
        <div className='space-y-6'>
          <div>
            <label className='text-sm font-medium mb-2 block'>Project Title</label>
            <Input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder='e.g. GPT-4 Response Quality Rating'
              disabled={isLoading}
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>Task Type</label>
            <Select value={form.taskType} onValueChange={(v) => updateField('taskType', v)}>
              <SelectTrigger>
                <SelectValue placeholder='Select task type' />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder='Describe what contributors will be doing in this project...'
              rows={5}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>Model / Use Case</label>
            <Input
              value={form.modelOrUseCase}
              onChange={(e) => updateField('modelOrUseCase', e.target.value)}
              placeholder='e.g. GPT-4, Claude, Llama 3'
              disabled={isLoading}
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-3 block'>Domains</label>
            <div className='flex flex-wrap gap-2'>
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  type='button'
                  onClick={() => toggleArrayItem('domain', d)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.domain.includes(d)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='text-sm font-medium mb-3 block'>Chain Tags</label>
            <div className='flex flex-wrap gap-2'>
              {CHAIN_TAGS.map((c) => (
                <button
                  key={c}
                  type='button'
                  onClick={() => toggleArrayItem('chainTags', c)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.chainTags.includes(c)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Compensation */}
      {step === 1 && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium mb-2 block'>Pay Model</label>
              <Select value={form.payModel} onValueChange={(v) => updateField('payModel', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PER_TASK'>Per Task</SelectItem>
                  <SelectItem value='HOURLY'>Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium mb-2 block'>
                Rate (USDC {form.payModel === 'PER_TASK' ? 'per task' : 'per hour'})
              </label>
              <Input
                type='number'
                step='0.01'
                value={form.rateAmount || ''}
                onChange={(e) => updateField('rateAmount', e.target.value)}
                placeholder='0.00'
                disabled={isLoading}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium mb-2 block'>Difficulty</label>
              <Select value={form.difficulty} onValueChange={(v) => updateField('difficulty', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium mb-2 block'>Contributor Capacity</label>
              <Input
                type='number'
                value={form.capacity}
                onChange={(e) => updateField('capacity', e.target.value)}
                placeholder='Max concurrent contributors (optional)'
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>Task Volume (estimated)</label>
            <Input
              type='number'
              value={form.taskVolume}
              onChange={(e) => updateField('taskVolume', e.target.value)}
              placeholder='Total number of tasks (optional)'
              disabled={isLoading}
            />
          </div>

          <Card>
            <CardContent className='p-4'>
              <label className='flex items-center gap-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={form.qualityBonusEligible}
                  onChange={(e) => updateField('qualityBonusEligible', e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300'
                />
                <div>
                  <p className='text-sm font-medium'>Enable Quality Bonuses</p>
                  <p className='text-xs text-gray-500'>
                    Top performers earn bonus payouts based on review scores.
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Quality & Access */}
      {step === 2 && (
        <div className='space-y-6'>
          <div>
            <label className='text-sm font-medium mb-2 block'>
              Quality Threshold: {Math.round(form.qualityThreshold * 100)}%
            </label>
            <Slider
              value={[form.qualityThreshold * 100]}
              onValueChange={([v]) => updateField('qualityThreshold', v / 100)}
              min={50}
              max={100}
              step={5}
            />
            <p className='text-xs text-gray-500 mt-1'>
              Minimum acceptance rate required for contributors to remain active.
            </p>
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>
              Gold Task Ratio: {Math.round(form.goldTaskRatio * 100)}%
            </label>
            <Slider
              value={[form.goldTaskRatio * 100]}
              onValueChange={([v]) => updateField('goldTaskRatio', v / 100)}
              min={0}
              max={25}
              step={1}
            />
            <p className='text-xs text-gray-500 mt-1'>
              Percentage of tasks that are hidden quality benchmarks.
            </p>
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>Required Contributor Tier</label>
            <Select value={form.requiredTier} onValueChange={(v) => updateField('requiredTier', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIER_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>Visibility</label>
            <Select value={form.visibility} onValueChange={(v) => updateField('visibility', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='PUBLIC'>Public — Visible to all contributors</SelectItem>
                <SelectItem value='PRIVATE'>Private — Only invited contributors</SelectItem>
                <SelectItem value='INVITE_ONLY'>Invite Only — Application required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='text-sm font-medium mb-3 block'>Region Limits (optional)</label>
            <Input
              value={form.regionLimits.join(', ')}
              onChange={(e) =>
                updateField(
                  'regionLimits',
                  e.target.value ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean) : []
                )
              }
              placeholder='e.g. US, EU, Asia (comma-separated, leave empty for no limits)'
              disabled={isLoading}
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-3 block'>Language Limits (optional)</label>
            <Input
              value={form.languageLimits.join(', ')}
              onChange={(e) =>
                updateField(
                  'languageLimits',
                  e.target.value ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean) : []
                )
              }
              placeholder='e.g. English, Spanish (comma-separated, leave empty for no limits)'
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Step 3: Settings */}
      {step === 3 && (
        <div className='space-y-6'>
          <div>
            <label className='text-sm font-medium mb-2 block'>Review Policy</label>
            <Textarea
              value={form.reviewPolicy}
              onChange={(e) => updateField('reviewPolicy', e.target.value)}
              placeholder='Describe how submissions should be reviewed (optional)...'
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>Dispute Rules</label>
            <Textarea
              value={form.disputeRules}
              onChange={(e) => updateField('disputeRules', e.target.value)}
              placeholder='Define dispute resolution process (optional)...'
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>Payout Rules</label>
            <Textarea
              value={form.payoutRules}
              onChange={(e) => updateField('payoutRules', e.target.value)}
              placeholder='Payout schedule and conditions (optional)...'
              rows={3}
              disabled={isLoading}
            />
          </div>

          <Card>
            <CardContent className='p-5'>
              <h3 className='font-semibold mb-3'>Project Summary</h3>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div><span className='text-gray-500'>Task Type:</span> {TASK_TYPE_LABELS[form.taskType] || '—'}</div>
                <div><span className='text-gray-500'>Pay:</span> ${form.rateAmount} USDC / {form.payModel === 'PER_TASK' ? 'task' : 'hour'}</div>
                <div><span className='text-gray-500'>Difficulty:</span> {DIFFICULTY_LABELS[form.difficulty]}</div>
                <div><span className='text-gray-500'>Min Tier:</span> {TIER_LABELS[form.requiredTier]}</div>
                <div><span className='text-gray-500'>Quality:</span> {Math.round(form.qualityThreshold * 100)}%</div>
                <div><span className='text-gray-500'>Gold Ratio:</span> {Math.round(form.goldTaskRatio * 100)}%</div>
                <div><span className='text-gray-500'>Domains:</span> {form.domain.join(', ') || '—'}</div>
                <div><span className='text-gray-500'>Chains:</span> {form.chainTags.join(', ') || '—'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className='flex items-center justify-between mt-8 pt-6 border-t'>
        <Button
          variant='outline'
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0 || isLoading}
        >
          <ArrowLeft className='h-4 w-4 mr-1' /> Back
        </Button>

        <div className='flex gap-2'>
          {step === STEPS.length - 1 ? (
            <>
              <Button
                variant='outline'
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
              >
                {isLoading ? 'Publishing...' : isEdit ? 'Update & Publish' : 'Publish Project'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed() || isLoading}
            >
              Next <ArrowRight className='h-4 w-4 ml-1' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
