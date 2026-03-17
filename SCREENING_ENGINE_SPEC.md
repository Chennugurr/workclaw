# Screening Engine Specification

## Purpose

Screenings are qualification tests that contributors must pass to unlock work on specific projects or domains. They ensure contributors have the expertise needed for quality work.

## Supported Screening Domains

| Domain | Description |
|--------|-------------|
| Solidity Knowledge | Smart contract development understanding |
| DeFi Knowledge | DeFi protocols, mechanisms, risks |
| Scam Detection | Identifying scams, phishing, rugpulls |
| Prompt Evaluation | Assessing prompt quality for AI systems |
| Ranking Judgment | Ability to consistently rank outputs |
| Factuality Review | Verifying factual claims about crypto |
| Moderation Judgment | Content moderation decision-making |
| Crypto Terminology | General crypto/blockchain vocabulary |
| Blockchain Security | Security concepts, attack vectors |
| Multilingual Review | Quality assessment in non-English languages |

## Question Types

### Multiple Choice
```json
{
  "questionType": "MULTIPLE_CHOICE",
  "question": "What does MEV stand for in Ethereum?",
  "options": [
    { "id": "a", "text": "Maximum Extractable Value" },
    { "id": "b", "text": "Maximal Extractable Value" },
    { "id": "c", "text": "Miner Extractable Value" },
    { "id": "d", "text": "Minimal Entry Verification" }
  ],
  "correctAnswer": { "id": "b" },
  "points": 1
}
```

### Short Answer
```json
{
  "questionType": "SHORT_ANSWER",
  "question": "Explain what impermanent loss is in 2-3 sentences.",
  "correctAnswer": null,
  "points": 2
}
```
Short answers require manual review unless auto-grading keywords are configured.

### Scenario-Based
```json
{
  "questionType": "SCENARIO_BASED",
  "question": "A user in a Telegram group posts: 'I'm from the Uniswap team. Send your seed phrase to verify your wallet for the airdrop.' What classification would you give this message?",
  "options": [
    { "id": "a", "text": "Safe - legitimate team communication" },
    { "id": "b", "text": "Scam - social engineering attack" },
    { "id": "c", "text": "Spam - unsolicited marketing" },
    { "id": "d", "text": "Impersonation - fake team member" }
  ],
  "correctAnswer": { "id": "d" },
  "points": 3
}
```

### Manual Review
Questions where human reviewers grade the response. Used for complex scenarios where auto-grading isn't possible.

## Screening Flow

```
1. Contributor browses available screenings
2. Clicks "Start Screening" → timer starts (if time-limited)
3. Answers questions sequentially
4. Submits attempt
5. Auto-graded questions scored immediately
6. Manual review questions queued for reviewers
7. Final score calculated after all questions graded
8. Pass/fail determined against threshold
9. If passed: contributor unlocks associated projects/domains
10. If failed: retake available after cooldown (if attempts remain)
```

## Scoring

```
score = sum(earned_points) / sum(total_points) * 100
passed = score >= passingScore (default 70%)
```

## Policies

### Retakes
- Default max attempts: 3
- Cooldown between attempts: 24 hours (configurable)
- Questions may be randomized/rotated between attempts

### Unlocking
- Passing a screening unlocks projects that require it
- Some screenings are prerequisites for others (chain: basic crypto → DeFi → advanced DeFi)
- Higher scores may unlock higher-paying tiers of the same domain

### Manual Override
- Admins can manually pass/fail a contributor for any screening
- Used for: portfolio review, interview-based qualification, special circumstances

## Admin Management

Admins can:
- Create/edit/archive screenings
- Add/edit/remove questions
- Set passing thresholds and attempt limits
- View attempt analytics (pass rate, average score, question difficulty)
- Manually review short answer and scenario responses
- Override pass/fail status
- Link screenings to projects

## Screening History (Contributor View)

```
┌──────────────────────────────────────────────────┐
│ My Screenings                                     │
├──────────────────────────────────────────────────┤
│ ✅ Crypto Terminology     Score: 92%  Passed     │
│ ✅ DeFi Knowledge         Score: 85%  Passed     │
│ ❌ Solidity Knowledge     Score: 55%  Failed     │
│    → 2 retakes remaining. Available in 22h       │
│ 🔒 Blockchain Security   Requires: Crypto Term.  │
│ ⏳ Scam Detection         Score: pending review   │
│ 📋 Prompt Evaluation      Not started             │
└──────────────────────────────────────────────────┘
```
