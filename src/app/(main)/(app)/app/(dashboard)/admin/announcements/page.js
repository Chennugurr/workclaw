'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Plus, MoreHorizontal, Megaphone, Trash2, Eye, EyeOff } from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Page() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: announcements, isLoading, mutate } = useAppSWR('/admin/announcements');

  const handleCreate = async () => {
    if (!title || !body) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post('/admin/announcements', { title, body });
      if (res.data.status === 'success') {
        toast.success('Announcement created');
        setShowCreate(false);
        setTitle('');
        setBody('');
        mutate();
      }
    } catch (error) {
      toast.error('Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id, active) => {
    try {
      const res = await axios.patch(`/admin/announcements/${id}`, { active: !active });
      if (res.data.status === 'success') {
        toast.success(active ? 'Announcement hidden' : 'Announcement shown');
        mutate();
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/admin/announcements/${id}`);
      toast.success('Announcement deleted');
      mutate();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Announcements</h1>
        <Sheet open={showCreate} onOpenChange={setShowCreate}>
          <SheetTrigger asChild>
            <Button size='sm'>
              <Plus className='h-4 w-4 mr-1' /> New Announcement
            </Button>
          </SheetTrigger>
          <SheetContent side='right' className='w-[90vw] sm:w-[400px]'>
            <SheetHeader>
              <SheetTitle>Create Announcement</SheetTitle>
            </SheetHeader>
            <div className='space-y-4 mt-6'>
              <div>
                <label className='text-sm font-medium mb-2 block'>Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Announcement title'
                />
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>Body</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='Write your announcement...'
                  rows={6}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !title || !body}
                className='w-full'
              >
                {isSubmitting ? 'Creating...' : 'Publish Announcement'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : announcements?.length > 0 ? (
        <div className='space-y-2'>
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Megaphone className='h-4 w-4 text-blue-500' />
                      <p className='font-medium'>{a.title}</p>
                      <Badge className={a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                        {a.active ? 'Active' : 'Hidden'}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 line-clamp-2'>{a.body}</p>
                    <p className='text-xs text-gray-400 mt-1'>
                      {dayjs(a.createdAt).format('MMM D, YYYY h:mm A')}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => handleToggle(a.id, a.active)}>
                        {a.active ? <EyeOff className='mr-2 h-4 w-4' /> : <Eye className='mr-2 h-4 w-4' />}
                        {a.active ? 'Hide' : 'Show'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(a.id)} className='text-red-600'>
                        <Trash2 className='mr-2 h-4 w-4' /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='p-8 text-center'>
            <Megaphone className='h-12 w-12 mx-auto text-gray-300 mb-3' />
            <p className='text-gray-500'>No announcements yet.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
