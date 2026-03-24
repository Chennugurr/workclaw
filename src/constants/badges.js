/**
 * HumanLayer Badge Definitions
 *
 * Badges are earned through specific achievements and displayed on contributor profiles.
 * Each badge has criteria that are checked when reputation events occur.
 */

export const BADGES = [
  // Screening-based badges
  {
    id: 'solidity_verified',
    name: 'Solidity Verified',
    icon: '📜',
    description: 'Passed the Solidity Knowledge screening',
    category: 'expertise',
    criteria: { type: 'screening_passed', domain: 'Solidity Knowledge' },
  },
  {
    id: 'defi_analyst',
    name: 'DeFi Analyst',
    icon: '💰',
    description: 'Passed the DeFi Knowledge screening',
    category: 'expertise',
    criteria: { type: 'screening_passed', domain: 'DeFi Knowledge' },
  },
  {
    id: 'scam_hunter',
    name: 'Scam Hunter',
    icon: '🔒',
    description: 'Passed the Scam Detection screening',
    category: 'expertise',
    criteria: { type: 'screening_passed', domain: 'Scam Detection' },
  },
  {
    id: 'ai_rater',
    name: 'AI Rater',
    icon: '🤖',
    description: 'Passed the Prompt Evaluation screening',
    category: 'expertise',
    criteria: { type: 'screening_passed', domain: 'Prompt Evaluation' },
  },
  {
    id: 'fact_checker',
    name: 'Fact Checker',
    icon: '✅',
    description: 'Passed the Factuality Review screening',
    category: 'expertise',
    criteria: { type: 'screening_passed', domain: 'Factuality Review' },
  },
  {
    id: 'security_expert',
    name: 'Security Expert',
    icon: '🛡️',
    description: 'Passed the Blockchain Security screening',
    category: 'expertise',
    criteria: { type: 'screening_passed', domain: 'Blockchain Security' },
  },
  {
    id: 'multilingual',
    name: 'Multilingual Reviewer',
    icon: '🌐',
    description: 'Passed the Multilingual Review screening',
    category: 'expertise',
    criteria: { type: 'screening_passed', domain: 'Multilingual Review' },
  },
  {
    id: 'moderator',
    name: 'Content Moderator',
    icon: '⚖️',
    description: 'Passed the Moderation Judgment screening',
    category: 'expertise',
    criteria: { type: 'screening_passed', domain: 'Moderation Judgment' },
  },

  // Task volume badges
  {
    id: 'first_task',
    name: 'First Task',
    icon: '🎯',
    description: 'Completed your first task',
    category: 'milestone',
    criteria: { type: 'tasks_approved', count: 1 },
  },
  {
    id: 'task_10',
    name: 'Getting Started',
    icon: '🔥',
    description: 'Completed 10 approved tasks',
    category: 'milestone',
    criteria: { type: 'tasks_approved', count: 10 },
  },
  {
    id: 'task_50',
    name: 'Consistent Contributor',
    icon: '⚡',
    description: 'Completed 50 approved tasks',
    category: 'milestone',
    criteria: { type: 'tasks_approved', count: 50 },
  },
  {
    id: 'task_100',
    name: 'Centurion',
    icon: '💎',
    description: 'Completed 100 approved tasks',
    category: 'milestone',
    criteria: { type: 'tasks_approved', count: 100 },
  },
  {
    id: 'task_500',
    name: 'Powerhouse',
    icon: '🏆',
    description: 'Completed 500 approved tasks',
    category: 'milestone',
    criteria: { type: 'tasks_approved', count: 500 },
  },

  // Quality badges
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    icon: '✨',
    description: '95%+ acceptance rate over 50+ tasks',
    category: 'quality',
    criteria: { type: 'acceptance_rate', rate: 0.95, minTasks: 50 },
  },
  {
    id: 'gold_standard',
    name: 'Gold Standard',
    icon: '🥇',
    description: '100% gold task accuracy over 10+ gold tasks',
    category: 'quality',
    criteria: { type: 'gold_accuracy', rate: 1.0, minGoldTasks: 10 },
  },
  {
    id: 'reliable',
    name: 'Reliable',
    icon: '🤝',
    description: '90%+ acceptance rate over 20+ tasks',
    category: 'quality',
    criteria: { type: 'acceptance_rate', rate: 0.9, minTasks: 20 },
  },

  // Screening count badges
  {
    id: 'polymath',
    name: 'Polymath',
    icon: '🧠',
    description: 'Passed 5 or more different screenings',
    category: 'expertise',
    criteria: { type: 'screenings_passed', count: 5 },
  },
  {
    id: 'specialist',
    name: 'Specialist',
    icon: '🎓',
    description: 'Passed 3 or more different screenings',
    category: 'expertise',
    criteria: { type: 'screenings_passed', count: 3 },
  },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export const BADGE_CATEGORIES = {
  expertise: { label: 'Expertise', description: 'Earned through screening tests' },
  milestone: { label: 'Milestones', description: 'Earned through task volume' },
  quality: { label: 'Quality', description: 'Earned through consistent high-quality work' },
};
