'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LabelClassification({ task, submission, onSave, readOnly }) {
  const { content, contentType, labels = [], multiSelect = false } = task.data;
  const [selected, setSelected] = useState(submission?.response?.selectedLabels || []);

  useEffect(() => {
    if (submission?.response?.selectedLabels) {
      setSelected(submission.response.selectedLabels);
    }
  }, [submission]);

  const toggleLabel = (label) => {
    if (readOnly) return;
    let updated;
    if (multiSelect) {
      updated = selected.includes(label)
        ? selected.filter((l) => l !== label)
        : [...selected, label];
    } else {
      updated = selected.includes(label) ? [] : [label];
    }
    setSelected(updated);
    onSave({ selectedLabels: updated });
  };

  return (
    <div className='space-y-6'>
      {/* Content */}
      <Card>
        <CardContent className='p-5'>
          <div className='flex items-center gap-2 mb-3'>
            <h3 className='text-sm font-medium text-gray-500'>Content</h3>
            {contentType && (
              <Badge variant='secondary' className='text-xs'>{contentType}</Badge>
            )}
          </div>
          <div className='text-sm whitespace-pre-wrap bg-white/[0.04] p-4 rounded-lg border border-white/[0.08]'>
            {content}
          </div>
        </CardContent>
      </Card>

      {/* Labels */}
      <div>
        <h3 className='text-sm font-semibold mb-1'>
          {multiSelect ? 'Select all that apply' : 'Choose one label'}
        </h3>
        <p className='text-xs text-gray-400 mb-3'>
          Classify the content above into the appropriate category.
        </p>
        <div className='flex flex-wrap gap-2'>
          {labels.map((label) => (
            <button
              key={label}
              onClick={() => toggleLabel(label)}
              disabled={readOnly}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                selected.includes(label)
                  ? 'bg-white/[0.15] text-white border-white/40'
                  : 'bg-white/[0.05] text-white/70 border-white/[0.12] hover:border-white/30 hover:bg-white/[0.08]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
