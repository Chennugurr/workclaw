'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { User } from 'lucide-react';
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

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
  'Russian', 'Italian', 'Dutch', 'Turkish', 'Indonesian',
];

export default function PageContent() {
  const user = useAppState((s) => s.user);
  const profile = user?.profile || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bio, setBio] = useState(profile.bio || '');
  const [country, setCountry] = useState(profile.country || '');
  const [language, setLanguage] = useState(profile.language || 'English');

  const save = async () => {
    setIsSubmitting(true);
    try {
      const method = !user.profile ? 'post' : 'patch';
      await axios[method](`/users/${user.id}/profile`, {
        bio,
        country,
        language,
      });
      toast.success('Profile details saved');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold flex items-center gap-2'>
        <User className='h-5 w-5' />
        Extended Profile
      </h2>

      <Card>
        <CardContent className='p-5 space-y-4'>
          <div>
            <Label>Bio</Label>
            <Textarea
              className='mt-1'
              rows={4}
              placeholder='Tell organizations about your background and expertise...'
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
            />
            <p className='text-xs text-gray-400 mt-1'>{bio.length}/500</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label>Country / Region</Label>
              <Input
                className='mt-1'
                placeholder='e.g., United States'
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div>
              <Label>Primary Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className='mt-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
