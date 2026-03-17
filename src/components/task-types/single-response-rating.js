'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function SingleResponseRating({ task, submission, onSave, readOnly }) {
  const { prompt, response, dimensions = [], scale = { min: 1, max: 5 } } = task.data;
  const [ratings, setRatings] = useState(submission?.response?.ratings || {});
  const [overallRating, setOverallRating] = useState(submission?.response?.overallRating || null);

  useEffect(() => {
    if (submission?.response) {
      setRatings(submission.response.ratings || {});
      setOverallRating(submission.response.overallRating || null);
    }
  }, [submission]);

  const handleRate = (dimension, value) => {
    if (readOnly) return;
    const updated = { ...ratings, [dimension]: value };
    setRatings(updated);
    onSave({ ratings: updated, overallRating });
  };

  const handleOverall = (value) => {
    if (readOnly) return;
    setOverallRating(value);
    onSave({ ratings, overallRating: value });
  };

  const scaleRange = Array.from(
    { length: scale.max - scale.min + 1 },
    (_, i) => scale.min + i
  );

  return (
    <div className='space-y-6'>
      {/* Prompt */}
      <Card>
        <CardContent className='p-5'>
          <h3 className='text-sm font-medium text-gray-500 mb-2'>Prompt</h3>
          <p className='text-sm'>{prompt}</p>
        </CardContent>
      </Card>

      {/* Response */}
      <Card>
        <CardContent className='p-5'>
          <h3 className='text-sm font-medium text-gray-500 mb-2'>AI Response</h3>
          <div className='text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg'>{response}</div>
        </CardContent>
      </Card>

      {/* Dimension Ratings */}
      {dimensions.map((dim) => (
        <div key={dim} className='space-y-2'>
          <label className='text-sm font-medium capitalize'>{dim}</label>
          <div className='flex gap-2'>
            {scaleRange.map((val) => (
              <button
                key={val}
                onClick={() => handleRate(dim, val)}
                disabled={readOnly}
                className={cn(
                  'h-10 w-10 rounded-lg text-sm font-medium transition-colors border',
                  ratings[dim] === val
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                )}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Overall Rating */}
      <div className='space-y-2 pt-2 border-t'>
        <label className='text-sm font-semibold'>Overall Rating</label>
        <div className='flex gap-2'>
          {scaleRange.map((val) => (
            <button
              key={val}
              onClick={() => handleOverall(val)}
              disabled={readOnly}
              className={cn(
                'h-12 w-12 rounded-lg text-sm font-bold transition-colors border-2',
                overallRating === val
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
