import dynamic from 'next/dynamic';

const TASK_TYPE_COMPONENTS = {
  SINGLE_RESPONSE_RATING: dynamic(() => import('./single-response-rating')),
  PAIRWISE_COMPARISON: dynamic(() => import('./pairwise-comparison')),
  MULTI_RESPONSE_RANKING: dynamic(() => import('./multi-response-ranking')),
  LABEL_CLASSIFICATION: dynamic(() => import('./label-classification')),
  SCAM_CLASSIFICATION: dynamic(() => import('./label-classification')),
  CODE_REVIEW: dynamic(() => import('./code-review')),
  FACTUALITY_VERIFICATION: dynamic(() => import('./factuality-verification')),
  // These reuse existing components with different data shapes:
  SAFETY_REVIEW: dynamic(() => import('./label-classification')),
  CONTRACT_VALIDATION: dynamic(() => import('./factuality-verification')),
};

export function getTaskComponent(taskType) {
  return TASK_TYPE_COMPONENTS[taskType] || null;
}

export const TASK_TYPE_LABELS = {
  SINGLE_RESPONSE_RATING: 'Response Rating',
  PAIRWISE_COMPARISON: 'Comparison',
  MULTI_RESPONSE_RANKING: 'Ranking',
  LABEL_CLASSIFICATION: 'Classification',
  TEXT_ANNOTATION: 'Annotation',
  CODE_REVIEW: 'Code Review',
  FACTUALITY_VERIFICATION: 'Fact Check',
  SAFETY_REVIEW: 'Safety Review',
  SCAM_CLASSIFICATION: 'Scam Detection',
  CONTRACT_VALIDATION: 'Contract Review',
  RESEARCH_GRADING: 'Research Review',
  AGENT_EVALUATION: 'Agent Testing',
  PROMPT_WRITING: 'Prompt Writing',
  TRANSLATION_REVIEW: 'Translation Review',
};
