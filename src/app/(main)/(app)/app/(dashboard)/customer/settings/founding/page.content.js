'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TEAM_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const INDUSTRIES = [
  'AI / Machine Learning', 'Blockchain / Web3', 'Data & Analytics',
  'Technology', 'Finance', 'Healthcare', 'Education', 'Research', 'Other',
];

export default function PageContent() {
  const { organization: org } = useAppState();
  const orgData = org?.selected || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    website: orgData.website || '',
    industry: orgData.industry || '',
    teamSize: orgData.teamSize || '',
    description: orgData.description || '',
  });

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const save = async () => {
    setIsSubmitting(true);
    try {
      await axios.patch(`/orgs/${orgData.id}`, form);
      toast.success('Organization info saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold flex items-center gap-2'>
        <Building2 className='h-5 w-5' />
        Organization Details
      </h2>

      <Card>
        <CardContent className='p-5 space-y-4'>
          <div>
            <Label>Organization Name</Label>
            <Input className='mt-1' value={orgData.name || ''} disabled />
            <p className='text-xs text-gray-400 mt-1'>
              Contact support to change your organization name.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(v) => update('industry', v)}>
                <SelectTrigger className='mt-1'>
                  <SelectValue placeholder='Select industry...' />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Team Size</Label>
              <Select value={form.teamSize} onValueChange={(v) => update('teamSize', v)}>
                <SelectTrigger className='mt-1'>
                  <SelectValue placeholder='Select size...' />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>{s} people</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Website</Label>
            <Input
              className='mt-1'
              placeholder='https://yourcompany.com'
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              className='mt-1'
              rows={4}
              placeholder='Describe your organization and the type of AI work you focus on...'
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              maxLength={1000}
            />
            <p className='text-xs text-gray-400 mt-1'>{form.description.length}/1000</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
