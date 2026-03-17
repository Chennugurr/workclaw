'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, X, Link2 } from 'lucide-react';
import axios from '@/lib/axios';
import { useAppState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PLATFORMS = [
  { value: 'website', label: 'Website' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'discord', label: 'Discord' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'other', label: 'Other' },
];

export default function PageContent() {
  const { organization: org } = useAppState();
  const orgData = org?.selected || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [links, setLinks] = useState(
    orgData.socialLinks || [{ platform: 'website', url: '' }]
  );

  const addLink = () => {
    setLinks([...links, { platform: 'other', url: '' }]);
  };

  const removeLink = (idx) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const updateLink = (idx, field, value) => {
    setLinks(links.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const save = async () => {
    setIsSubmitting(true);
    try {
      await axios.patch(`/orgs/${orgData.id}`, {
        socialLinks: links.filter((l) => l.url.trim()),
      });
      toast.success('Social links saved');
    } catch {
      toast.error('Failed to save social links');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold flex items-center gap-2'>
        <Link2 className='h-5 w-5' />
        Organization Social Links
      </h2>

      <Card>
        <CardContent className='p-5 space-y-4'>
          {links.map((link, idx) => (
            <div key={idx} className='flex items-center gap-2'>
              <Select value={link.platform} onValueChange={(v) => updateLink(idx, 'platform', v)}>
                <SelectTrigger className='w-36'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder='https://...'
                value={link.url}
                onChange={(e) => updateLink(idx, 'url', e.target.value)}
                className='flex-1'
              />
              {links.length > 1 && (
                <Button variant='ghost' size='icon' onClick={() => removeLink(idx)}>
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
          ))}
          <Button variant='outline' size='sm' onClick={addLink}>
            <Plus className='h-3.5 w-3.5 mr-1' />
            Add Link
          </Button>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
