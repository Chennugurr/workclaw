# Workclaw — Component Inventory

## UI Primitives (shadcn/ui) — KEEP ALL

All 47 shadcn/ui components are kept as-is. These are the design system foundation.

Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip

---

## Existing Custom Components

| Component | Path | Decision | Notes |
|-----------|------|----------|-------|
| AuthGuard | `src/components/guards/auth.guard.js` | EXTEND | Add role parameter (contributor, customer, reviewer, admin) |
| JobForm | `src/components/forms/job/` | REWRITE → ProjectForm | Different fields, task types |
| OrganizationSwitcher | `src/components/organization-switcher/` | KEEP | Works for customer role |
| MdxEditor | `src/components/mdx-editor/` | KEEP | For project descriptions, task instructions |
| FeatureComingSoon | `src/components/feature-coming-soon/` | KEEP | Still useful during build-out |
| JobPositionBadge | `src/components/job-position-badge/` | REMOVE | Not applicable |
| JobStatusBadge | `src/components/job-status-badge/` | REWRITE → ProjectStatusBadge | New lifecycle states |
| ProposalStatusBadge | `src/components/proposal-status-badge/` | REWRITE → ApplicationStatusBadge | New statuses |
| Pagination | `src/components/pagination/` | KEEP | Reusable |
| MVPBanner | `src/components/banners/mvp/` | REMOVE | Old branding |

---

## New Components to Build

### Layout & Navigation
| Component | Purpose |
|-----------|---------|
| AppShell | Main app layout with sidebar, header, content area |
| Sidebar | Role-aware navigation sidebar |
| TopBar | Header with notifications, profile, org switcher |
| RoleSwitcher | Switch between contributor/customer/reviewer/admin views |
| OnboardingWizard | Multi-step onboarding flow |

### Dashboard Widgets
| Component | Purpose |
|-----------|---------|
| EarningsWidget | Show today/week/month/lifetime earnings |
| QualityScoreCard | Display quality score with trend |
| ActiveProjectsWidget | List active projects |
| TaskStreakWidget | Show completion streaks |
| OnboardingProgressWidget | Onboarding completion tracker |
| ScreeningProgressWidget | Screening completion status |
| AnnouncementBanner | Platform announcements |
| RecommendedTasksWidget | Suggested tasks based on skills |

### Opportunity & Project
| Component | Purpose |
|-----------|---------|
| OpportunityCard | Opportunity listing card (title, domain, pay, skills, slots) |
| OpportunityFilters | Filter bar for opportunities |
| ProjectCard | Project card for customer dashboard |
| ProjectStatusBadge | Project lifecycle status display |
| ProjectCreationWizard | Multi-step project creation |
| RequirementsList | Display project requirements |
| SkillMatchIndicator | Show skill match percentage |

### Task Workspace
| Component | Purpose |
|-----------|---------|
| TaskWorkspace | Main task completion container |
| InstructionsPanel | Task instructions display (collapsible) |
| RubricPanel | Scoring rubric display |
| ExamplesPanel | Example responses display |
| TaskTimer | Time tracking for tasks |
| SingleRatingTask | Rate a single AI response |
| PairwiseComparisonTask | Compare two responses side-by-side |
| RankingTask | Rank multiple responses |
| LabelClassificationTask | Apply labels/categories |
| CodeReviewTask | Review code with annotations |
| FactualityReviewTask | Verify factual claims |
| ConfidenceSlider | Confidence score input |
| ReasoningField | Free-text reasoning input |
| TaskSubmitBar | Draft/submit actions with autosave indicator |

### Screening
| Component | Purpose |
|-----------|---------|
| ScreeningCard | Screening test listing card |
| ScreeningTestView | Test-taking UI |
| MultipleChoiceQuestion | MCQ question component |
| ShortAnswerQuestion | Short answer input |
| ScenarioQuestion | Scenario-based question |
| ScreeningResultCard | Score and pass/fail display |

### Review & Quality
| Component | Purpose |
|-----------|---------|
| ReviewQueueItem | Submission in review queue |
| ReviewWorkspace | Review UI with approve/reject/revise/escalate |
| QualityHistoryChart | Quality score over time |
| ContributorWatchlistItem | Low-quality contributor alert |
| GoldTaskManager | Gold task creation/management |

### Earnings & Payouts
| Component | Purpose |
|-----------|---------|
| EarningsChart | Earnings over time (Recharts) |
| PayoutHistoryTable | Payout history with statuses |
| PayoutMethodCard | Payout method display/edit |
| EarningsBreakdown | Per-task, bonus, streak breakdown |
| PendingPayoutCard | Pending payout status |

### Reputation
| Component | Purpose |
|-----------|---------|
| ContributorLevelBadge | Level display (new → elite) |
| BadgeGrid | Display earned badges |
| ReputationCard | Reputation summary |
| TrustScoreIndicator | Trust score visual |

### Notifications
| Component | Purpose |
|-----------|---------|
| NotificationCenter | Dropdown/panel for notifications |
| NotificationItem | Individual notification |
| NotificationBadge | Unread count indicator |

### Admin
| Component | Purpose |
|-----------|---------|
| AdminDataTable | Reusable data table with search, filters, actions |
| UserManagementRow | User row with actions (approve, ban, adjust) |
| FraudAlertCard | Fraud flag display |
| PayoutBatchManager | Batch payout controls |
| AnnouncementEditor | Create/edit announcements |
| FeatureFlagToggle | Feature flag controls |

### Marketing/Public
| Component | Purpose |
|-----------|---------|
| HeroSection | Landing page hero |
| HowItWorksSection | Step-by-step explainer |
| TaskTypesSection | Task type showcase |
| ExpertiseAreasSection | Domain areas display |
| TestimonialCard | Contributor/customer testimonial |
| CTASection | Call-to-action blocks |
| FAQAccordion | FAQ section |

---

## Hooks (Existing → Extended)

| Hook | Path | Decision |
|------|------|----------|
| `useAppSwr` | `src/hooks/use-app-swr.js` | KEEP |
| `usePaginateSwr` | `src/hooks/use-paginate-swr.js` | KEEP |
| `useSIWS` | `src/hooks/use-siws.js` | KEEP |
| `useTask` | — | NEW: Task state management |
| `useScreening` | — | NEW: Screening test state |
| `useEarnings` | — | NEW: Earnings data fetching |
| `useNotifications` | — | NEW: Notification polling |
| `useTaskTimer` | — | NEW: Task timing logic |
| `useAutosave` | — | NEW: Autosave with debounce |

---

## Providers (Existing → Extended)

| Provider | Path | Decision |
|----------|------|----------|
| ThemeProvider | `src/context/theme.js` | KEEP |
| ReownProvider | `src/providers/reown/` | KEEP |
| RootProviders | `src/providers/index.jsx` | EXTEND: Add notification, task providers |
