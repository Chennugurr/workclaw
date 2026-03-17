'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ASSESSMENTS = ['approved', 'needs_revision', 'rejected'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function CodeReview({ task, submission, onSave, readOnly }) {
  const { language, code, context, reviewAreas = [] } = task.data;
  const [issues, setIssues] = useState(submission?.response?.issues || []);
  const [assessment, setAssessment] = useState(submission?.response?.overallAssessment || '');
  const [summary, setSummary] = useState(submission?.response?.summary || '');

  useEffect(() => {
    if (submission?.response) {
      setIssues(submission.response.issues || []);
      setAssessment(submission.response.overallAssessment || '');
      setSummary(submission.response.summary || '');
    }
  }, [submission]);

  const save = (updated) => {
    const merged = {
      issues: updated?.issues ?? issues,
      overallAssessment: updated?.overallAssessment ?? assessment,
      summary: updated?.summary ?? summary,
    };
    onSave(merged);
  };

  const addIssue = () => {
    const updated = [...issues, { line: '', severity: 'medium', area: reviewAreas[0] || '', comment: '' }];
    setIssues(updated);
    save({ issues: updated });
  };

  const updateIssue = (index, field, value) => {
    const updated = issues.map((issue, i) =>
      i === index ? { ...issue, [field]: value } : issue
    );
    setIssues(updated);
    save({ issues: updated });
  };

  const removeIssue = (index) => {
    const updated = issues.filter((_, i) => i !== index);
    setIssues(updated);
    save({ issues: updated });
  };

  return (
    <div className='space-y-6'>
      {/* Code */}
      <Card>
        <CardContent className='p-5'>
          <div className='flex items-center gap-2 mb-3'>
            <h3 className='text-sm font-medium text-gray-500'>Code</h3>
            {language && <Badge variant='secondary' className='text-xs'>{language}</Badge>}
          </div>
          {context && <p className='text-xs text-gray-400 mb-3'>{context}</p>}
          <pre className='text-xs bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto'>
            <code>{code}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Review Areas */}
      {reviewAreas.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          <span className='text-xs text-gray-500'>Review for:</span>
          {reviewAreas.map((area) => (
            <Badge key={area} variant='outline' className='text-xs capitalize'>
              {area.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      )}

      {/* Issues */}
      <div>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-sm font-semibold'>Issues Found</h3>
          {!readOnly && (
            <Button variant='outline' size='sm' onClick={addIssue}>
              <Plus className='h-3.5 w-3.5 mr-1' />
              Add Issue
            </Button>
          )}
        </div>

        {issues.length === 0 ? (
          <p className='text-sm text-gray-400 italic'>No issues reported yet.</p>
        ) : (
          <div className='space-y-3'>
            {issues.map((issue, i) => (
              <Card key={i}>
                <CardContent className='p-4'>
                  <div className='grid grid-cols-3 gap-3 mb-3'>
                    <div>
                      <label className='text-xs text-gray-500'>Line</label>
                      <Input
                        type='number'
                        value={issue.line}
                        onChange={(e) => updateIssue(i, 'line', parseInt(e.target.value) || '')}
                        placeholder='Line #'
                        disabled={readOnly}
                        className='h-8 text-sm'
                      />
                    </div>
                    <div>
                      <label className='text-xs text-gray-500'>Severity</label>
                      <Select
                        value={issue.severity}
                        onValueChange={(v) => updateIssue(i, 'severity', v)}
                        disabled={readOnly}
                      >
                        <SelectTrigger className='h-8 text-sm'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITIES.map((s) => (
                            <SelectItem key={s} value={s} className='capitalize'>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='text-xs text-gray-500'>Area</label>
                      <Select
                        value={issue.area}
                        onValueChange={(v) => updateIssue(i, 'area', v)}
                        disabled={readOnly}
                      >
                        <SelectTrigger className='h-8 text-sm'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {reviewAreas.map((a) => (
                            <SelectItem key={a} value={a} className='capitalize'>
                              {a.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Textarea
                      value={issue.comment}
                      onChange={(e) => updateIssue(i, 'comment', e.target.value)}
                      placeholder='Describe the issue...'
                      className='min-h-[60px] text-sm flex-1'
                      disabled={readOnly}
                    />
                    {!readOnly && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-red-400 hover:text-red-600 shrink-0'
                        onClick={() => removeIssue(i)}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Overall Assessment */}
      <div className='space-y-3 pt-4 border-t'>
        <h3 className='text-sm font-semibold'>Overall Assessment</h3>
        <div className='flex gap-2'>
          {ASSESSMENTS.map((a) => (
            <button
              key={a}
              onClick={() => {
                if (readOnly) return;
                setAssessment(a);
                save({ overallAssessment: a });
              }}
              disabled={readOnly}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize',
                assessment === a
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {a.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <Textarea
          value={summary}
          onChange={(e) => {
            setSummary(e.target.value);
            save({ summary: e.target.value });
          }}
          placeholder='Write a brief summary of your review...'
          className='min-h-[80px] text-sm'
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
