# Architecture.md

# 1. Architecture Overview

ServiceFlow will use a modern full-stack web architecture.

Recommended stack:

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API / Route Handlers OR dedicated Node.js API
- TypeScript

### Database

- PostgreSQL

### ORM

- Prisma

### Authentication

- Secure session-based authentication or a proven authentication solution.

### Deployment

- Frontend/API: Vercel or equivalent
- Database: Managed PostgreSQL provider
- File storage: Object storage provider

---

# 2. High-Level Architecture

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Next.js App    │
                    │   React + UI      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ API / Server     │
                    │ Business Logic   │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
      ┌────────────┐  ┌────────────┐  ┌──────────────┐
      │ PostgreSQL │  │ File Store │  │ Notifications│
      └────────────┘  └────────────┘  └──────────────┘
```

---

# 3. Application Layers

## Presentation Layer

Responsible for:

- UI
- Forms
- Tables
- Dashboards
- Modals
- Navigation
- Client-side interactions

Should not contain complex business rules.

---

## Application Layer

Responsible for:

- Use cases
- Business workflows
- Authorization
- Validation orchestration
- Service logic

Examples:

```text
createCustomer()
createServiceRequest()
assignJob()
scheduleJob()
completeJob()
generateInvoice()
recordPayment()
```

---

## Data Layer

Responsible for:

- Database queries
- ORM operations
- Repository functions
- Transactions

UI components should not directly access the database.

---

# 4. Suggested Project Structure

```text
src/
│
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── customers/
│   ├── requests/
│   ├── jobs/
│   ├── technicians/
│   ├── schedule/
│   ├── invoices/
│   ├── payments/
│   ├── reports/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── customers/
│   ├── jobs/
│   ├── invoices/
│   └── shared/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validation/
│   ├── permissions/
│   └── utils/
│
├── services/
│   ├── customer.service.ts
│   ├── request.service.ts
│   ├── job.service.ts
│   ├── technician.service.ts
│   ├── invoice.service.ts
│   └── payment.service.ts
│
├── repositories/
│   ├── customer.repository.ts
│   ├── job.repository.ts
│   └── invoice.repository.ts
│
├── types/
│
└── config/
```

---

# 5. Core Data Model

Main entities:

```text
User
Business
Customer
ServiceRequest
Job
Technician
Service
Invoice
InvoiceItem
Payment
Notification
Attachment
AuditLog
```

Relationships:

```text
Business
  ├── Users
  ├── Customers
  ├── Technicians
  ├── Services
  ├── Jobs
  ├── Invoices
  └── Payments

Customer
  ├── ServiceRequests
  ├── Jobs
  └── Invoices

Job
  ├── Customer
  ├── Technician
  ├── Service
  ├── Attachments
  └── Invoice

Invoice
  ├── InvoiceItems
  └── Payments
```

---

# 6. Multi-Tenant Architecture

The application should be designed so that multiple businesses can eventually use the platform.

Every business-owned record should contain:

```text
businessId
```

Example:

```text
Customer
- id
- businessId
- name
- phone
- email
```

All server-side queries must enforce business ownership.

A user from Business A must never access Business B's data.

---

# 7. Authentication & Authorization

Authentication verifies:

> Who is the user?

Authorization verifies:

> What is the user allowed to do?

Roles:

```text
ADMIN
MANAGER
TECHNICIAN
```

Example:

```text
ADMIN
→ Full access

MANAGER
→ Customers
→ Jobs
→ Scheduling
→ Technicians
→ Invoices
→ Reports

TECHNICIAN
→ Assigned jobs
→ Job updates
→ Customer information required for assigned jobs
```

Authorization must be enforced server-side.

---

# 8. Job State Machine

Job statuses should follow controlled transitions.

```text
SCHEDULED
    ↓
ASSIGNED
    ↓
EN_ROUTE
    ↓
IN_PROGRESS
    ↓
COMPLETED
```

Alternative states:

```text
ON_HOLD
CANCELLED
```

Invalid transitions should be rejected.

Example:

```text
COMPLETED → IN_PROGRESS
```

should not happen casually without an explicit business action.

---

# 9. Invoice Architecture

Invoice totals should be calculated server-side.

Example:

```text
Subtotal
- Discount
+ Tax
= Grand Total
```

Client-provided total values must never be blindly trusted.

Invoice numbers should be unique per business.

---

# 10. API Design

Example endpoints:

```text
POST   /api/customers
GET    /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id

POST   /api/service-requests
GET    /api/service-requests

POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:id
PATCH  /api/jobs/:id

POST   /api/jobs/:id/assign
POST   /api/jobs/:id/status

POST   /api/invoices
GET    /api/invoices
GET    /api/invoices/:id

POST   /api/payments
GET    /api/payments
```

API design should remain predictable and consistent.

---

# 11. Validation

Use schema-based validation.

Recommended:

- Zod

Validate:

- Request body
- Query parameters
- IDs
- Dates
- Numbers
- Enum values
- File metadata

Validation must happen server-side even if frontend validation exists.

---

# 12. Error Architecture

Use structured errors.

Example:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

Client should receive safe error messages.

Internal stack traces must not be exposed in production.

---

# 13. Logging & Audit

Important actions should be auditable:

- Login
- User creation
- Job assignment
- Job status changes
- Invoice creation
- Payment creation
- Record deletion/archive

Audit log:

```text
userId
businessId
action
entity
entityId
timestamp
metadata
```

---

# 14. File Uploads

Job images/documents should not be stored directly in the database.

Use object storage.

Database stores:

```text
fileId
jobId
url/key
fileType
fileSize
uploadedBy
createdAt
```

Validate:

- File type
- File size
- Access permissions

---

# 15. Deployment Architecture

```text
GitHub
   ↓
CI/CD
   ↓
Vercel
   ↓
Production Application
   ↓
Managed PostgreSQL
   ↓
Object Storage
```

Use environment variables for:

- Database URL
- Authentication secrets
- Storage credentials
- External API keys

Never commit secrets to GitHub.

---

# 16. Scalability Principles

MVP should remain simple.

Avoid premature microservices.

Start as:

> **Modular Monolith**

This gives:

- Faster development
- Easier debugging
- Lower infrastructure complexity
- Easier deployment

If scale requires it later, individual services can be extracted.

---

# 17. Architecture Principle

The architecture should prioritize:

**Security → Maintainability → Simplicity → Performance → Scalability**

Do not optimize for hypothetical millions of users before the product has real users.