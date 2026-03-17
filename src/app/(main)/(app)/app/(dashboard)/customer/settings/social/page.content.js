'use client';

import { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FeatureComingSoon from '@/components/feature-coming-soon';

const socialPlatforms = [
  { name: 'Facebook', icon: <Facebook className='w-5 h-5 text-blue-600' /> },
  { name: 'Twitter', icon: <Twitter className='w-5 h-5 text-blue-400' /> },
  { name: 'Instagram', icon: <Instagram className='w-5 h-5 text-pink-600' /> },
  { name: 'Youtube', icon: <Youtube className='w-5 h-5 text-red-600' /> },
];

export default function PageContent() {
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: 'Facebook', url: '' },
    { id: 2, platform: 'Twitter', url: '' },
    { id: 3, platform: 'Instagram', url: '' },
    { id: 4, platform: 'Youtube', url: '' },
  ]);

  // TODO: impl page
  return <FeatureComingSoon />;

  const addNewSocialLink = () => {
    const newId = Math.max(...socialLinks.map((link) => link.id), 0) + 1;
    setSocialLinks([...socialLinks, { id: newId, platform: '', url: '' }]);
  };

  const removeSocialLink = (id) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id));
  };

  const updateSocialLink = (id, field, value) => {
    setSocialLinks(
      socialLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  return (
    <div className='space-y-6'>
      {socialLinks.map((link, index) => (
        <div key={link.id} className='space-y-2'>
          <Label>{`Social Link ${index + 1}`}</Label>
          <div className='flex items-center space-x-2'>
            <Select
              value={link.platform}
              onValueChange={(value) =>
                updateSocialLink(link.id, 'platform', value)
              }
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select platform' />
              </SelectTrigger>
              <SelectContent>
                {socialPlatforms.map((platform) => (
                  <SelectItem key={platform.name} value={platform.name}>
                    <div className='flex items-center'>
                      {platform.icon}
                      <span className='ml-2'>{platform.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder='Profile link/url...'
              value={link.url}
              onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
              className='flex-grow'
            />
            <Button
              variant='ghost'
              size='icon'
              onClick={() => removeSocialLink(link.id)}
              aria-label='Remove social link'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ))}

      <Button variant='outline' onClick={addNewSocialLink} className='w-full'>
        <Plus className='mr-2 h-4 w-4' /> Add New Social Link
      </Button>

      <Button className='w-full'>Save Changes</Button>
    </div>
  );
}
