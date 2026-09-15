# Rules.md

# ServiceFlow Development Rules

## 1. Core Rule

Build the product as if a real service business will use it.

Do not create fake functionality simply to make the demo look impressive.

---

# 2. What To Use

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js server/API capabilities or Node.js
- TypeScript

### Database

- PostgreSQL
- Prisma

### Validation

- Zod

### Version Control

- Git
- GitHub

### Deployment

- Vercel or equivalent production platform

---

# 3. What To Avoid

Avoid unnecessary libraries.

Do not install a package for a feature that can reasonably be implemented with existing project capabilities.

Avoid:

- Duplicate UI libraries
- Unmaintained packages
- Random GitHub snippets
- Copy-pasted authentication systems
- Unnecessary state-management libraries
- Premature microservices
- Over-engineering

---

# 4. TypeScript Rules

Use strict TypeScript.

Avoid:

```ts
any
```

unless there is a documented technical reason.

Prefer:

```ts
unknown
```

and proper type narrowing.

---

# 5. Component Rules

Components should have one clear responsibility.

Bad:

```text
MegaDashboard.tsx
```

containing:

- API calls
- business logic
- database logic
- forms
- tables
- modals
- calculations

Prefer modular components.

---

# 6. API Rules

Every API endpoint must:

1. Authenticate the request.
2. Authorize the user.
3. Validate input.
4. Execute business logic.
5. Return predictable response structure.
6. Handle errors safely.

Never trust frontend authorization.

---

# 7. Security Rules

Never:

- Store plaintext passwords.
- Commit secrets.
- Trust client-provided permissions.
- Trust client-provided invoice totals.
- Expose private customer information unnecessarily.
- Return stack traces in production.

Always enforce:

```text
Authentication
Authorization
Validation
Business ownership
```

---

# 8. Multi-Tenant Security

Every business-owned query must be scoped to:

```text
businessId
```

Never query:

```text
Job.findUnique({ id })
```

without verifying ownership where required.

Conceptually:

```text
Find job
AND
job.businessId === currentUser.businessId
```

---

# 9. Error Handling

Never silently fail.

Every error must be:

- Logged where appropriate
- Converted into a safe user-facing message
- Assigned an appropriate error type/status

Users should see:

> "Unable to update the job. Please try again."

Not:

> "PrismaClientKnownRequestError..."

---

# 10. Loading States

Every asynchronous interface should handle:

- Loading
- Success
- Empty
- Error

Never leave users staring at a blank screen.

---

# 11. Empty States

Every major list should have a useful empty state.

Example:

> No jobs scheduled for today.

And preferably provide an action:

> + Create Job

---

# 12. Form Rules

Forms must:

- Validate inputs
- Show clear errors
- Prevent accidental duplicate submission
- Preserve user input when possible
- Display success feedback
- Handle server errors

---

# 13. Delete Rules

Prefer archive/soft-delete for important business records.

Examples:

- Customers
- Jobs
- Invoices
- Payments

Financial records should generally not be physically deleted casually.

---

# 14. Status Rules

Statuses must be represented using predefined enums.

Do not use arbitrary strings throughout the codebase.

Example:

```text
JobStatus
```

instead of:

```text
"done"
"completed"
"finish"
"complete"
```

---

# 15. Database Rules

Use:

- Foreign keys
- Unique constraints
- Indexes where needed
- Transactions for multi-step critical operations

Never rely only on frontend validation.

---

# 16. Performance Rules

Use:

- Pagination
- Filtering
- Search
- Database indexes
- Optimized queries
- Lazy loading where useful

Do not load thousands of jobs/customers into the browser unnecessarily.

---

# 17. UI Rules

Every screen must be:

- Responsive
- Accessible
- Consistent
- Keyboard usable where appropriate
- Clear about actions

Avoid unnecessary animations.

---

# 18. Mobile Rules

Technician workflows must prioritize mobile usage.

Buttons should be easy to tap.

Important information should be visible without excessive scrolling.

---

# 19. Git Rules

Use meaningful commits.

Good:

```text
feat: add job assignment workflow
fix: prevent duplicate invoice submission
feat: add technician dashboard
refactor: simplify job service
```

Avoid:

```text
update
changes
final
final2
new
test
```

---

# 20. Branch Rules

Recommended:

```text
main
develop
feature/*
fix/*
```

Never experiment directly on production/main when unnecessary.

---

# 21. Testing Rules

Test critical workflows:

- Authentication
- Customer creation
- Job creation
- Technician assignment
- Job status transitions
- Invoice generation
- Payment recording
- Authorization

---

# 22. Production Rules

Before deployment:

- Remove debug logs
- Check environment variables
- Test production build
- Test authentication
- Test permissions
- Test responsive UI
- Check error states
- Check database migrations

---

# 23. What To Avoid in the Product

Do not add features merely because they look impressive.

Avoid MVP features such as:

- AI assistant
- GPS tracking
- Complex route optimization
- Microservices
- Cryptocurrency payments
- Excessive analytics
- Complex automation

unless the core workflow is already stable.

---

# 24. Golden Rule

**Working > Fancy**

**Secure > Fast to build**

**Simple > Over-engineered**

**Real business value > Feature count**

Every feature must have a clear reason to exist.