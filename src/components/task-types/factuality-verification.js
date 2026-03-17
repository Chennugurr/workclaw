'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VERDICTS = ['correct', 'incorrect', 'partially_correct', 'unverifiable'];

export default function FactualityVerification({ task, submission, onSave, readOnly }) {
  const { claim, context, sourceHints = [] } = task.data;
  const [verdict, setVerdict] = useState(submission?.response?.verdict || '');
  const [correction, setCorrection] = useState(submission?.response?.correction || '');
  const [sources, setSources] = useState(submission?.response?.sources || ['']);

  useEffect(() => {
    if (submission?.response) {
      setVerdict(submission.response.verdict || '');
      setCorrection(submission.response.correction || '');
      setSources(submission.response.sources || ['']);
    }
  }, [submission]);

  const save = (updated) => {
    onSave({
      verdict: updated?.verdict ?? verdict,
      correction: updated?.correction ?? correction,
      sources: (updated?.sources ?? sources).filter(Boolean),
    });
  };

  return (
    <div className='space-y-6'>
      {/* Claim */}
      <Card>
        <CardContent className='p-5'>
          <h3 className='text-sm font-medium text-gray-500 mb-2'>Claim to Verify</h3>
          <p className='text-base font-medium'>{claim}</p>
          {context && (
            <p className='text-xs text-gray-400 mt-2'>Context: {context}</p>
          )}
        </CardContent>
      </Card>

      {/* Source hints */}
      {sourceHints.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          <span className='text-xs text-gray-500'>Suggested sources:</span>
          {sourceHints.map((s) => (
            <Badge key={s} variant='outline' className='text-xs'>{s}</Badge>
          ))}
        </div>
      )}

      {/* Verdict */}
      <div>
        <h3 className='text-sm font-semibold mb-3'>Verdict</h3>
        <div className='flex flex-wrap gap-2'>
          {VERDICTS.map((v) => (
            <button
              key={v}
              onClick={() => {
                if (readOnly) return;
                setVerdict(v);
                save({ verdict: v });
              }}
              disabled={readOnly}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize',
                verdict === v
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {v.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Correction */}
      {(verdict === 'incorrect' || verdict === 'partially_correct') && (
        <div>
          <h3 className='text-sm font-semibold mb-2'>Correction</h3>
          <Textarea
            value={correction}
            onChange={(e) => {
              setCorrection(e.target.value);
              save({ correction: e.target.value });
            }}
            placeholder='What is the correct information?'
            className='min-h-[80px] text-sm'
            disabled={readOnly}
          />
        </div>
      )}

      {/* Sources */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-sm font-semibold'>Sources</h3>
          {!readOnly && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const updated = [...sources, ''];
                setSources(updated);
              }}
            >
              <Plus className='h-3.5 w-3.5 mr-1' />
              Add
            </Button>
          )}
        </div>
        <div className='space-y-2'>
          {sources.map((src, i) => (
            <div key={i} className='flex gap-2'>
              <Input
                value={src}
                onChange={(e) => {
                  const updated = sources.map((s, j) => (j === i ? e.target.value : s));
                  setSources(updated);
                  save({ sources: updated });
                }}
                placeholder='URL or source reference'
                className='text-sm'
                disabled={readOnly}
              />
              {!readOnly && sources.length > 1 && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-9 w-9 text-red-400 shrink-0'
                  onClick={() => {
                    const updated = sources.filter((_, j) => j !== i);
                    setSources(updated);
                    save({ sources: updated });
                  }}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
