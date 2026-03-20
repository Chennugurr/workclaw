'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import axios from '@/lib/axios';
import useAppSWR from '@/hooks/use-app-swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const DOMAINS = [
  'AI Prompt Evaluation',
  'Factuality Review',
  'Data Labeling QA',
  'Content Moderation',
  'Language Assessment',
  'Reasoning & Logic',
  'Code Review',
  'Image Annotation QA',
];

const EMPTY_FORM = {
  title: '',
  description: '',
  domain: '',
  passingScore: 0.7,
  maxAttempts: 3,
  timeLimitMins: '',
  status: 'DRAFT',
};

export default function Page() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
  const { data: result, isLoading, mutate } = useAppSWR(`/admin/screenings${query}`);
  const screenings = result?.data || [];

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (screening, e) => {
    e.stopPropagation();
    setEditingId(screening.id);
    setForm({
      title: screening.title || '',
      description: screening.description || '',
      domain: screening.domain || '',
      passingScore: screening.passingScore ?? 0.7,
      maxAttempts: screening.maxAttempts ?? 3,
      timeLimitMins: screening.timeLimitMins ?? '',
      status: screening.status || 'DRAFT',
    });
    setDialogOpen(true);
  };

  const openDelete = (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        passingScore: parseFloat(form.passingScore),
        maxAttempts: parseInt(form.maxAttempts, 10),
        timeLimitMins: form.timeLimitMins ? parseInt(form.timeLimitMins, 10) : null,
      };

      if (editingId) {
        const res = await axios.patch(`/admin/screenings/${editingId}`, payload);
        if (res.data.status === 'success') {
          toast.success('Screening updated');
        }
      } else {
        const res = await axios.post('/admin/screenings', payload);
        if (res.data.status === 'success') {
          toast.success('Screening created');
        }
      }
      setDialogOpen(false);
      mutate();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save screening');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/admin/screenings/${deletingId}`);
      if (res.data.status === 'success') {
        toast.success('Screening deleted');
        mutate();
      }
    } catch (error) {
      toast.error('Failed to delete screening');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Screening Management</h1>
        <Button onClick={openCreate}>
          <Plus className='h-4 w-4 mr-2' />
          Create Screening
        </Button>
      </div>

      <div className='mb-6'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            {Object.keys(STATUS_COLORS).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 bg-gray-100 rounded-lg animate-pulse' />
          ))}
        </div>
      ) : screenings.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center text-gray-500'>
            No screenings found. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-center'>Questions</TableHead>
                <TableHead className='text-center'>Attempts</TableHead>
                <TableHead className='text-center'>Passing Score</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {screenings.map((screening) => (
                <TableRow
                  key={screening.id}
                  className='cursor-pointer'
                  onClick={() => router.push(`/app/admin/screenings/${screening.id}`)}
                >
                  <TableCell>
                    <div>
                      <p className='font-medium'>{screening.title}</p>
                      <p className='text-xs text-gray-500'>
                        {dayjs(screening.createdAt).format('MMM D, YYYY')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className='text-sm'>{screening.domain}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${STATUS_COLORS[screening.status]}`}>
                      {screening.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center'>
                    {screening._count?.questions ?? 0}
                  </TableCell>
                  <TableCell className='text-center'>
                    {screening._count?.attempts ?? 0}
                  </TableCell>
                  <TableCell className='text-center'>
                    {Math.round((screening.passingScore ?? 0) * 100)}%
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={(e) => openEdit(screening, e)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={(e) => openDelete(screening.id, e)}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Screening' : 'Create Screening'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder='Screening title'
              />
            </div>
            <div>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder='Describe this screening...'
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor='domain'>Domain</Label>
              <Select value={form.domain} onValueChange={(v) => updateForm('domain', v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select domain' />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label htmlFor='passingScore'>Passing Score (0-1)</Label>
                <Input
                  id='passingScore'
                  type='number'
                  min='0'
                  max='1'
                  step='0.05'
                  value={form.passingScore}
                  onChange={(e) => updateForm('passingScore', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='maxAttempts'>Max Attempts</Label>
                <Input
                  id='maxAttempts'
                  type='number'
                  min='1'
                  value={form.maxAttempts}
                  onChange={(e) => updateForm('maxAttempts', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='timeLimitMins'>Time Limit (min)</Label>
                <Input
                  id='timeLimitMins'
                  type='number'
                  min='1'
                  value={form.timeLimitMins}
                  onChange={(e) => updateForm('timeLimitMins', e.target.value)}
                  placeholder='Optional'
                />
              </div>
            </div>
            <div>
              <Label htmlFor='status'>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateForm('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='DRAFT'>DRAFT</SelectItem>
                  <SelectItem value='ACTIVE'>ACTIVE</SelectItem>
                  <SelectItem value='ARCHIVED'>ARCHIVED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.domain}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete Screening</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-gray-600'>
            Are you sure you want to delete this screening? This will also delete all
            associated questions and cannot be undone.
          </p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
