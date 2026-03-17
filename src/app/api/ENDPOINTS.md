## API v1

All endpoints are prefixed with `/api`

### **Authentication Endpoints**

1. **Authenticate User (SIWE)**: `POST /auth/siwe`
2. **Refresh Token**: `POST /auth/refresh-token`
3. **Get Current User**: `GET /auth/whoami`

### **Skill Endpoints**

1. **Create Skill**: `POST /skills`
2. **Get Skill**: `GET /skills/[skillId]`
3. **Update Skill**: `PATCH /skills/[skillId]`
4. **Delete Skill**: `DELETE /skills/[skillId]`

### **User Endpoints**

1. **Get User**: `GET /users/[userId]`
2. **Create User Profile**: `POST /users/[userId]/profile`
3. **Get User Profile**: `GET /users/[userId]/profile`
4. **Update User Profile**: `PATCH /users/[userId]/profile`
5. **Add User Skill**: `POST /users/[userId]/skills`
6. **Update User Skill**: `PATCH /users/[userId]/skills/[skillId]`
7. **Remove User Skill**: `DELETE /users/[userId]/skills/[skillId]`

### **Organization Endpoints**

1. **Create Organization**: `POST /orgs`
2. **Get Organization**: `GET /orgs/[orgId]`
3. **Update Organization**: `PATCH /orgs/[orgId]`
4. **Delete Organization**: `DELETE /orgs/[orgId]`
5. **Add Organization Staff**: `POST /orgs/[orgId]/staffs`
6. **Update Organization Staff**: `PATCH /orgs/[orgId]/staffs/[userId]`
7. **Remove Organization Staff**: `DELETE /orgs/[orgId]/staffs/[userId]`

### **Job Endpoints**

1. **Create Job**: `POST /orgs/[orgId]/jobs`
2. **Get Job**: `GET /orgs/[orgId]/jobs/[jobId]`
3. **Update Job**: `PATCH /orgs/[orgId]/jobs/[jobId]`
4. **Delete Job**: `DELETE /orgs/[orgId]/jobs/[jobId]`
5. **Add Job Skill**: `POST /orgs/[orgId]/jobs/[jobId]/skills`
6. **Update Job Skill**: `PATCH /orgs/[orgId]/jobs/[jobId]/skills/[skillId]`
7. **Remove Job Skill**: `DELETE /orgs/[orgId]/jobs/[jobId]/skills/[skillId]`
8. **Add Job Recruiter**: `POST /orgs/[orgId]/jobs/[jobId]/recruiters`
9. **Update Job Recruiter**: `PATCH /orgs/[orgId]/jobs/[jobId]/recruiters/[recruiterId]`
10. **Remove Job Recruiter**: `DELETE /orgs/[orgId]/jobs/[jobId]/recruiters/[recruiterId]`

### **Proposal Endpoints**

1. **Create Job Proposal**: `POST /orgs/[orgId]/jobs/[jobId]/proposals`
2. **Get Proposal**: `GET /orgs/[orgId]/jobs/[jobId]/proposals/[proposalId]`
3. **Update Proposal**: `PATCH /orgs/[orgId]/jobs/[jobId]/proposals/[proposalId]`
4. **Delete Proposal**: `DELETE /orgs/[orgId]/jobs/[jobId]/proposals/[proposalId]`
5. **Update Proposal Status**: `PATCH /orgs/[orgId]/jobs/[jobId]/proposals/[proposalId]/status`

### **Search Endpoints**

1. **Search Skills**: `GET /search/skills?q={query}&userId={userId}&jobId={jobId}&page={page}&limit={limit}&sort={field}&order={asc|desc}`
   - `q` (optional): Search query
   - `userId` (optional): User ID to filter skills by
   - `jobId` (optional): Job ID to filter skills by
   - **Note**: `userId` and `jobId` cannot coexist in the same request
2. **Search Candidates**: `GET /search/candidates?q={query}&page={page}&limit={limit}&sort={field}&order={asc|desc}`
   - `q` (optional): Search query
3. **Search Organizations**: `GET /search/orgs?q={query}&userId={userId}&page={page}&limit={limit}&sort={field}&order={asc|desc}`
   - `q` (optional): Search query
   - `userId` (optional): User ID to filter organizations by
4. **Search Staffs**: `GET /search/staffs?q={query}&orgId={orgId}&page={page}&limit={limit}&sort={field}&order={asc|desc}`
   - `q` (optional): Search query
   - `orgId` (required): Organization ID to filter staff by
5. **Search Jobs**: `GET /search/jobs?q={query}&orgId={orgId}&page={page}&limit={limit}&sort={field}&order={asc|desc}`
   - `q` (optional): Search query
   - `orgId` (optional): Organization ID to filter jobs by
6. **Search Recruiters**: `GET /search/recruiters?q={query}&orgId={orgId}&jobId={jobId}&page={page}&limit={limit}&sort={field}&order={asc|desc}`
   - `q` (optional): Search query
   - `orgId` (required): Organization ID to filter recruiters by
   - `jobId` (optional): Job ID to filter recruiters by
7. **Search Proposals**: `GET /search/proposals?q={query}&userId={userId}&orgId={orgId}&jobId={jobId}&page={page}&limit={limit}&sort={field}&order={asc|desc}`
   - `q` (optional): Search query
   - `userId` (optional): User ID to filter proposals by
   - `orgId` (optional): Organization ID to filter proposals by
   - `jobId` (optional): Job ID to filter proposals by
   - **Note**: Only one of `userId`, `orgId`, or `jobId` should be provided in a single request

### **Analytics Endpoints**

1. **Get Platform Statistics**: `GET /analytics/platform`
2. **Get Skill Analytics**: `GET /analytics/skills/[skillId]`
3. **Get Candidate Analytics**: `GET /analytics/candidates/[candidateId]`
4. **Get Organization Analytics**: `GET /analytics/orgs/[orgId]`
5. **Get Job Analytics**: `GET /analytics/jobs/[jobId]`
6. **Get Market Trends**: `GET /analytics/market-trends`

### **Rate Limiting**

All endpoints are subject to rate limiting. The following headers will be included in responses:

- `X-RateLimit-Limit`: The maximum number of requests allowed per hour
- `X-RateLimit-Remaining`: The number of requests remaining in the current rate limit window
- `X-RateLimit-Reset`: The time at which the current rate limit window resets in UTC epoch seconds

### **HATEOAS Links**

All responses will include a `_links` object with relevant links for navigation and related resources.
