'use client';

import { useState, useEffect } from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MultiResponseRanking({ task, submission, onSave, readOnly }) {
  const { prompt, responses = [] } = task.data;
  const [ranking, setRanking] = useState(
    submission?.response?.ranking || responses.map((r) => r.id)
  );

  useEffect(() => {
    if (submission?.response?.ranking) {
      setRanking(submission.response.ranking);
    }
  }, [submission]);

  const moveUp = (index) => {
    if (readOnly || index === 0) return;
    const updated = [...ranking];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setRanking(updated);
    onSave({ ranking: updated });
  };

  const moveDown = (index) => {
    if (readOnly || index === ranking.length - 1) return;
    const updated = [...ranking];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setRanking(updated);
    onSave({ ranking: updated });
  };

  const responseMap = Object.fromEntries(responses.map((r) => [r.id, r]));

  return (
    <div className='space-y-6'>
      {/* Prompt */}
      <Card>
        <CardContent className='p-5'>
          <h3 className='text-sm font-medium text-gray-500 mb-2'>Prompt</h3>
          <p className='text-sm'>{prompt}</p>
        </CardContent>
      </Card>

      {/* Ranking */}
      <div>
        <h3 className='text-sm font-semibold mb-3'>
          Rank from best (top) to worst (bottom)
        </h3>
        <div className='space-y-2'>
          {ranking.map((id, index) => {
            const resp = responseMap[id];
            if (!resp) return null;
            return (
              <Card key={id} className='group'>
                <CardContent className='p-4 flex items-start gap-3'>
                  <div className='flex flex-col items-center gap-1 pt-1'>
                    <span className='text-xs font-bold text-gray-400 w-6 h-6 flex items-center justify-center bg-gray-100 rounded'>
                      {index + 1}
                    </span>
                    {!readOnly && (
                      <>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className='h-3 w-3' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() => moveDown(index)}
                          disabled={index === ranking.length - 1}
                        >
                          <ArrowDown className='h-3 w-3' />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded'>
                      {resp.text}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
