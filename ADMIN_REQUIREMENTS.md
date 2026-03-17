# Admin Backoffice Requirements

## Modules

### 1. Users
- List all users with search, filter by role/tier/status
- View user detail: profile, wallet, sessions, scores, flags
- Actions: approve, suspend, ban, adjust tier, reset screening, impersonate (view-as)

### 2. Contributors
- List contributors with quality scores, earnings, task volume
- Filter by: tier, skill, domain, quality score range, active/inactive
- View contributor detail: task history, quality trends, screening results, earnings, flags
- Actions: adjust score, override tier, assign to project, suspend from project

### 3. Customers
- List organizations with project count, spend, active status
- View org detail: projects, team, billing, task throughput
- Actions: approve, suspend, adjust billing

### 4. Projects
- List all projects with status, contributor count, task progress
- Filter by: status, task type, domain, customer
- View project detail: tasks, contributors, quality metrics, payouts
- Actions: open, pause, archive, force-close, reassign reviewers, edit settings

### 5. Screenings
- Create and manage screening tests
- Question bank management
- View attempt analytics per screening
- Manual review queue for pending answers
- Actions: create, edit, archive, override results

### 6. Task Queues
- View task distribution across projects
- Monitor assignment rates, completion rates, queue depths
- Create gold tasks
- Edit task instructions globally or per-batch
- Actions: reassign, expire, duplicate

### 7. Review Queues
- Monitor reviewer workload and throughput
- View review quality and inter-reviewer agreement
- Assign reviewers to projects
- Actions: reassign reviews, override verdicts, escalate

### 8. Payouts
- View payout pipeline: pending, approved, processing, completed, failed
- Batch management: create batches, approve, execute
- Individual payout management
- Ledger audit view
- Actions: approve, hold, release, freeze, dispute, manual adjustment

### 9. Disputes
- View all disputes with status and priority
- Dispute detail: context, evidence, timeline
- Actions: investigate, resolve, dismiss, escalate

### 10. Fraud & Risk
- Dashboard: integrity scores, flag counts, suspicious patterns
- Active fraud flags with severity
- Duplicate account detection results
- Speed anomaly alerts
- Actions: investigate, confirm fraud, dismiss, ban user

### 11. Announcements
- Create platform-wide announcements
- Target by role (all, contributors, customers)
- Set expiration dates
- Actions: create, edit, activate, deactivate

### 12. Settings
- Feature flags (toggle features without deploy)
- Platform configuration (min payouts, fee rates, cooldowns)
- Taxonomy management (skills, domains, chains)
- Actions: toggle flags, update config

## UI Requirements

- Reusable `AdminDataTable` component with:
  - Server-side pagination
  - Search
  - Column sorting
  - Bulk actions
  - Row actions dropdown
  - Filter sidebar
- Consistent detail view pattern: header with actions → tabs → content
- Audit trail visible on every entity (who changed what, when)
- Quick stats cards at top of each module

## Access Control

| Role | Access |
|------|--------|
| ADMIN | Full access to all modules |
| REVIEWER | Review queues, screening review, limited contributor view |
| CUSTOMER | Own org's projects, contributors, results only |
| CONTRIBUTOR | No admin access |

## Audit Logging

Every admin action creates an `AuditLog` entry:
```json
{
  "actorId": "admin_user_id",
  "action": "user.suspend",
  "target": "User",
  "targetId": "user_id",
  "details": { "reason": "Fraud confirmed", "previousStatus": "ACTIVE" },
  "ipAddress": "..."
}
```
