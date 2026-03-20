'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
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

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'SCENARIO_BASED', label: 'Scenario Based' },
  { value: 'MANUAL_REVIEW', label: 'Manual Review' },
];

const EMPTY_FORM = {
  questionType: 'MULTIPLE_CHOICE',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  points: 1,
  order: 1,
};

export default function Page() {
  const router = useRouter();
  const { screeningId } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: screening, isLoading, mutate } = useAppSWR(`/admin/screenings/${screeningId}`);
  const questions = screening?.questions || [];

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      order: questions.length + 1,
    });
    setDialogOpen(true);
  };

  const openEdit = (question) => {
    setEditingId(question.id);
    const opts = Array.isArray(question.options)
      ? question.options
      : ['', '', '', ''];
    setForm({
      questionType: question.questionType || 'MULTIPLE_CHOICE',
      question: question.question || '',
      options: opts,
      correctAnswer: typeof question.correctAnswer === 'object'
        ? JSON.stringify(question.correctAnswer)
        : String(question.correctAnswer ?? ''),
      points: question.points ?? 1,
      order: question.order ?? 1,
    });
    setDialogOpen(true);
  };

  const openDelete = (id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isMCQ = form.questionType === 'MULTIPLE_CHOICE';
      const payload = {
        questionType: form.questionType,
        question: form.question,
        options: isMCQ ? form.options.filter((o) => o.trim() !== '') : null,
        correctAnswer: form.correctAnswer || null,
        points: parseFloat(form.points),
        order: parseInt(form.order, 10),
      };

      if (editingId) {
        const res = await axios.patch(
          `/admin/screenings/${screeningId}/questions/${editingId}`,
          payload
        );
        if (res.data.status === 'success') {
          toast.success('Question updated');
        }
      } else {
        const res = await axios.post(
          `/admin/screenings/${screeningId}/questions`,
          payload
        );
        if (res.data.status === 'success') {
          toast.success('Question added');
        }
      }
      setDialogOpen(false);
      mutate();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `/admin/screenings/${screeningId}/questions/${deletingId}`
      );
      if (res.data.status === 'success') {
        toast.success('Question deleted');
        mutate();
      }
    } catch (error) {
      toast.error('Failed to delete question');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateOption = (index, value) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  };

  const addOption = () => {
    setForm((prev) => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (index) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className='space-y-3'>
        <div className='h-8 w-48 bg-gray-100 rounded animate-pulse' />
        <div className='h-32 bg-gray-100 rounded-lg animate-pulse' />
        <div className='h-64 bg-gray-100 rounded-lg animate-pulse' />
      </div>
    );
  }

  if (!screening) {
    return (
      <div className='text-center py-12 text-gray-500'>
        Screening not found.
        <Button variant='link' onClick={() => router.push('/app/admin/screenings')}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant='ghost'
        className='mb-4'
        onClick={() => router.push('/app/admin/screenings')}
      >
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Screenings
      </Button>

      {/* Screening Metadata */}
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='flex items-start justify-between'>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <h1 className='text-2xl font-bold'>{screening.title}</h1>
                <Badge className={`text-xs ${STATUS_COLORS[screening.status]}`}>
                  {screening.status}
                </Badge>
              </div>
              {screening.description && (
                <p className='text-gray-600 mb-3'>{screening.description}</p>
              )}
              <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                <span>Domain: <strong>{screening.domain}</strong></span>
                <span>Passing Score: <strong>{Math.round((screening.passingScore ?? 0) * 100)}%</strong></span>
                <span>Max Attempts: <strong>{screening.maxAttempts}</strong></span>
                {screening.timeLimitMins && (
                  <span>Time Limit: <strong>{screening.timeLimitMins} min</strong></span>
                )}
                <span>Attempts: <strong>{screening._count?.attempts ?? 0}</strong></span>
                {screening.project && (
                  <span>Project: <strong>{screening.project.title}</strong></span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold'>
          Questions ({questions.length})
        </h2>
        <Button onClick={openCreate}>
          <Plus className='h-4 w-4 mr-2' />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center text-gray-500'>
            No questions yet. Add one to get started.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16'>Order</TableHead>
                <TableHead className='w-40'>Type</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className='w-20 text-center'>Points</TableHead>
                <TableHead className='w-24 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className='font-mono'>{question.order}</TableCell>
                  <TableCell>
                    <Badge variant='outline' className='text-xs'>
                      {QUESTION_TYPES.find((t) => t.value === question.questionType)?.label || question.questionType}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-md'>
                    <p className='truncate'>{question.question}</p>
                  </TableCell>
                  <TableCell className='text-center'>{question.points}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(question)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openDelete(question.id)}
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

      {/* Create / Edit Question Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div>
              <Label htmlFor='questionType'>Question Type</Label>
              <Select
                value={form.questionType}
                onValueChange={(v) => updateForm('questionType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='question'>Question</Label>
              <Textarea
                id='question'
                value={form.question}
                onChange={(e) => updateForm('question', e.target.value)}
                placeholder='Enter the question text...'
                rows={4}
              />
            </div>

            {form.questionType === 'MULTIPLE_CHOICE' && (
              <div>
                <Label>Options</Label>
                <div className='space-y-2 mt-1'>
                  {form.options.map((option, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <span className='text-xs text-gray-400 w-4'>{index + 1}.</span>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {form.options.length > 2 && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='flex-shrink-0'
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className='h-3 w-3 text-red-400' />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={addOption}
                  >
                    <Plus className='h-3 w-3 mr-1' />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor='correctAnswer'>Correct Answer</Label>
              <Input
                id='correctAnswer'
                value={form.correctAnswer}
                onChange={(e) => updateForm('correctAnswer', e.target.value)}
                placeholder={
                  form.questionType === 'MULTIPLE_CHOICE'
                    ? 'e.g. Option text or index'
                    : 'Expected answer or keywords'
                }
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='points'>Points</Label>
                <Input
                  id='points'
                  type='number'
                  min='0'
                  step='0.5'
                  value={form.points}
                  onChange={(e) => updateForm('points', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='order'>Order</Label>
                <Input
                  id='order'
                  type='number'
                  min='1'
                  value={form.order}
                  onChange={(e) => updateForm('order', e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.question}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-gray-600'>
            Are you sure you want to delete this question? This cannot be undone.
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
