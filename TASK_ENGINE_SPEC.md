# Task Engine Specification

## Architecture Goal

A modular task framework where new task types can be added without rewriting the product. Each task type is a pluggable component that implements a common interface.

## Task Type Interface

Every task type component receives:

```typescript
interface TaskProps {
  task: {
    id: string
    taskType: TaskType
    data: Record<string, any>      // task-specific content
    instructions: string | null
    rubric: Record<string, any> | null
    examples: Record<string, any>[] | null
  }
  submission: {
    response: Record<string, any> | null
    confidence: number | null
    reasoning: string | null
    isDraft: boolean
  }
  onSave: (response: Record<string, any>) => void
  onSubmit: (response: Record<string, any>, confidence: number, reasoning?: string) => void
  readOnly?: boolean   // for review mode
}
```

## Core Task Types

### 1. Single Response Rating
**Purpose:** Rate a single AI-generated response on quality dimensions.
**Data shape:**
```json
{
  "prompt": "What is MEV?",
  "response": "MEV stands for Maximal Extractable Value...",
  "dimensions": ["accuracy", "completeness", "clarity"],
  "scale": { "min": 1, "max": 5 }
}
```
**Response shape:**
```json
{
  "ratings": { "accuracy": 4, "completeness": 3, "clarity": 5 },
  "overallRating": 4
}
```

### 2. Pairwise Comparison
**Purpose:** Choose which of two AI responses is better.
**Data shape:**
```json
{
  "prompt": "Explain impermanent loss",
  "responseA": "Impermanent loss occurs when...",
  "responseB": "IL is a concept in DeFi...",
  "criteria": "Which response is more accurate and helpful?"
}
```
**Response shape:**
```json
{
  "preferred": "A" | "B" | "TIE",
  "dimensions": { "accuracy": "A", "clarity": "B" }
}
```

### 3. Multi-Response Ranking
**Purpose:** Rank 3+ responses from best to worst.
**Data shape:**
```json
{
  "prompt": "Summarize this governance proposal",
  "responses": [
    { "id": "r1", "text": "..." },
    { "id": "r2", "text": "..." },
    { "id": "r3", "text": "..." }
  ]
}
```
**Response shape:**
```json
{
  "ranking": ["r2", "r1", "r3"]
}
```

### 4. Label Classification
**Purpose:** Apply one or more labels to content.
**Data shape:**
```json
{
  "content": "🔥 GUARANTEED 100x! Send 1 SOL to...",
  "contentType": "discord_message",
  "labels": ["safe", "scam", "phishing", "impersonation", "spam", "other"],
  "multiSelect": false
}
```
**Response shape:**
```json
{
  "selectedLabels": ["scam"]
}
```

### 5. Code Review
**Purpose:** Review code for correctness, security, style.
**Data shape:**
```json
{
  "language": "solidity",
  "code": "contract Vault { ... }",
  "context": "This is a DeFi vault contract",
  "reviewAreas": ["security", "correctness", "gas_optimization"]
}
```
**Response shape:**
```json
{
  "issues": [
    { "line": 42, "severity": "high", "area": "security", "comment": "Reentrancy vulnerability" }
  ],
  "overallAssessment": "needs_revision",
  "summary": "..."
}
```

### 6. Factuality Verification
**Purpose:** Verify whether AI-generated claims are factually correct.
**Data shape:**
```json
{
  "claim": "Uniswap V3 introduced concentrated liquidity in May 2021",
  "context": "AI-generated DeFi history summary",
  "sourceHints": ["uniswap.org", "ethereum.org"]
}
```
**Response shape:**
```json
{
  "verdict": "correct" | "incorrect" | "partially_correct" | "unverifiable",
  "correction": "...",
  "sources": ["..."]
}
```

### 7. Safety Review
**Purpose:** Assess whether AI output is safe to show users.
**Data shape:**
```json
{
  "content": "To drain funds from the contract, you could...",
  "context": "Response to a user asking about smart contract security",
  "safetyCategories": ["harmful_instructions", "financial_advice", "misleading", "appropriate"]
}
```
**Response shape:**
```json
{
  "safetyRating": "unsafe",
  "categories": ["harmful_instructions"],
  "explanation": "..."
}
```

### 8. Scam/Phishing Classification
**Purpose:** Classify crypto messages for scam/phishing/impersonation.
**Data shape:**
```json
{
  "message": "...",
  "source": "telegram",
  "metadata": { "username": "...", "channel": "..." },
  "categories": ["safe", "scam", "phishing", "rugpull", "impersonation", "spam"]
}
```

### 9. Smart Contract Explanation Validation
**Purpose:** Check whether an AI explanation of a contract is correct.
**Data shape:**
```json
{
  "contractCode": "...",
  "aiExplanation": "This contract implements a token swap...",
  "chain": "ethereum"
}
```
**Response shape:**
```json
{
  "accuracy": "partially_correct",
  "errors": [{ "claim": "...", "correction": "..." }],
  "dangerousErrors": true
}
```

### 10. Prompt Writing/Improvement
**Purpose:** Write or improve prompts for blockchain AI agents.
**Data shape:**
```json
{
  "useCase": "wallet risk assessment agent",
  "existingPrompt": "...",      // null for writing tasks
  "targetBehavior": "...",
  "constraints": ["..."]
}
```
**Response shape:**
```json
{
  "prompt": "...",
  "rationale": "..."
}
```

## Workspace Layout

```
┌──────────────────────────────────────────────────┐
│ TopBar: Project Name | Task X of Y | Timer       │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│ Instructions│      Task Content Area             │
│ Panel      │      (task-type specific)           │
│            │                                     │
│ ─────────  │                                     │
│            │                                     │
│ Rubric     │                                     │
│ Panel      │                                     │
│            │                                     │
│ ─────────  │                                     │
│            │ ┌─────────────────────────────────┐ │
│ Examples   │ │ Confidence: [━━━━━━━━━━] 0.85   │ │
│ Panel      │ │ Reasoning: [text area]          │ │
│            │ │ [Save Draft]  [Submit]           │ │
│            │ └─────────────────────────────────┘ │
└────────────┴─────────────────────────────────────┘
```

## Task Lifecycle

```
AVAILABLE → ASSIGNED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
                                                         ↓
                                                   REVISION_REQUESTED → resubmit
```

## Quality Mechanisms

### Gold Tasks (Hidden Benchmarks)
- A percentage of tasks (configurable per project, default 5%) are gold tasks
- Gold tasks have known correct answers
- Contributors don't know which tasks are gold
- Gold task accuracy feeds into contributor quality score

### Consensus Scoring
- Same task assigned to multiple contributors
- Agreement between contributors measured
- Outlier responses flagged for review

### Speed Anomalies
- Track time per task
- Flag submissions that are impossibly fast
- Minimum time threshold per task type

### Autosave
- Auto-save draft every 30 seconds
- Restore draft on return to task
- Clear draft on successful submit

## Task Assignment Algorithm

1. Filter projects by contributor skills, screenings, tier, region, language
2. Weight by: skill match score, past project performance, quality score
3. Avoid re-assigning tasks that contributor already completed
4. Respect project capacity limits
5. Prioritize tasks nearing deadline
6. Balance workload across contributors
