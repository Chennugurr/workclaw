'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function PairwiseComparison({ task, submission, onSave, readOnly }) {
  const { prompt, responseA, responseB, criteria, dimensions } = task.data;
  const [preferred, setPreferred] = useState(submission?.response?.preferred || null);
  const [dimPrefs, setDimPrefs] = useState(submission?.response?.dimensions || {});

  useEffect(() => {
    if (submission?.response) {
      setPreferred(submission.response.preferred || null);
      setDimPrefs(submission.response.dimensions || {});
    }
  }, [submission]);

  const handlePrefer = (choice) => {
    if (readOnly) return;
    setPreferred(choice);
    onSave({ preferred: choice, dimensions: dimPrefs });
  };

  const handleDimPref = (dim, choice) => {
    if (readOnly) return;
    const updated = { ...dimPrefs, [dim]: choice };
    setDimPrefs(updated);
    onSave({ preferred, dimensions: updated });
  };

  const choices = ['A', 'B', 'TIE'];

  return (
    <div className='space-y-6'>
      {/* Prompt */}
      <Card>
        <CardContent className='p-5'>
          <h3 className='text-sm font-medium text-gray-500 mb-2'>Prompt</h3>
          <p className='text-sm'>{prompt}</p>
          {criteria && (
            <p className='text-xs text-gray-400 mt-2 italic'>{criteria}</p>
          )}
        </CardContent>
      </Card>

      {/* Responses side by side */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card
          className={cn(
            'cursor-pointer transition-all',
            preferred === 'A' ? 'ring-2 ring-gray-900' : 'hover:shadow-md'
          )}
          onClick={() => handlePrefer('A')}
        >
          <CardContent className='p-5'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-sm font-semibold'>Response A</h3>
              {preferred === 'A' && (
                <span className='text-xs bg-gray-900 text-white px-2 py-0.5 rounded'>Preferred</span>
              )}
            </div>
            <div className='text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded'>{responseA}</div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all',
            preferred === 'B' ? 'ring-2 ring-gray-900' : 'hover:shadow-md'
          )}
          onClick={() => handlePrefer('B')}
        >
          <CardContent className='p-5'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-sm font-semibold'>Response B</h3>
              {preferred === 'B' && (
                <span className='text-xs bg-gray-900 text-white px-2 py-0.5 rounded'>Preferred</span>
              )}
            </div>
            <div className='text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded'>{responseB}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tie option */}
      <button
        onClick={() => handlePrefer('TIE')}
        disabled={readOnly}
        className={cn(
          'w-full py-2 rounded-lg text-sm font-medium border transition-colors',
          preferred === 'TIE'
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
        )}
      >
        Tie — Both are equal
      </button>

      {/* Per-dimension preferences */}
      {dimensions && dimensions.length > 0 && (
        <div className='space-y-3 pt-4 border-t'>
          <h3 className='text-sm font-semibold'>Per-Dimension Comparison</h3>
          {dimensions.map((dim) => (
            <div key={dim} className='flex items-center gap-3'>
              <span className='text-sm capitalize w-24'>{dim}</span>
              <div className='flex gap-2'>
                {choices.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleDimPref(dim, c)}
                    disabled={readOnly}
                    className={cn(
                      'px-3 py-1 rounded text-xs font-medium border transition-colors',
                      dimPrefs[dim] === c
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
