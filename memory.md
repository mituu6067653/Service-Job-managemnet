# ServiceFlow - Master Project Memory (`memory.md`)

## 1. Project Overview & Vision
- **Product Name:** ServiceFlow
- **Type:** Service Business Job Management Platform (SaaS)
- **Target Audience:** Service businesses (AC repair, Electricians, Plumbers, Appliance Repair, Home Maintenance, Field Services, etc.)
- **Core Value Proposition:** Replace fragmented workflows (WhatsApp, notebooks, manual follow-ups) with a unified operational platform tracking the entire job lifecycle.

---

## 2. Core Workflow
`Customer Request` ➔ `Service Request Created` ➔ `Job Created` ➔ `Technician Assigned` ➔ `Appointment Scheduled` ➔ `Technician Starts Job` ➔ `Work In Progress` ➔ `Job Completed` ➔ `Invoice Generated` ➔ `Payment Recorded` ➔ `Job Closed`

---

## 3. Technology Stack & Architecture
- **Framework:** Next.js (App Router, Server Actions / API Handlers) + React + TypeScript (Strict)
- **Styling:** Tailwind CSS + ServiceFlow Design System (Light-first professional SaaS theme)
- **Database & ORM:** PostgreSQL / SQLite + Prisma ORM
- **Validation:** Zod (Strict schema validation for API and Forms)
- **Architecture Pattern:** Multi-Tenant Modular Monolith (`businessId` scoped queries & strictly enforced server-side authorization)
- **User Roles:** `ADMIN`, `MANAGER`, `TECHNICIAN`

---

## 4. Key Rules & Standards (from `Rules.md`)
1. **Working > Fancy | Secure > Fast | Simple > Over-Engineered**.
2. **Multi-Tenant Security:** Every query must enforce `businessId` ownership server-side.
3. **Strict Validation & Typing:** Server-side Zod validation on every input. No `any` type usage in TS.
4. **Soft Deletion:** Business records (customers, jobs, invoices, payments) use soft delete/archive.
5. **Enums for Statuses:** Explicit predefined status enums (`JobStatus`, `InvoiceStatus`, `PaymentStatus`, etc.).
6. **Component Modularity:** Single-responsibility components; avoid monolithic files.

---

## 5. Development Roadmap (Phases)
- [x] **Phase 0:** Project Foundation (Next.js, TS, Tailwind, Prisma, Base UI tokens & components)
- [x] **Phase 1:** Authentication & Business Setup (Session auth, Roles: Admin/Manager/Tech, Business Profile)
- [x] **Phase 2:** Application Shell (Sidebar, Header, User Menu, Responsive Navigation, Layouts)
- [x] **Phase 3:** Dashboard (KPI Cards, Schedule, Workload, Revenue Overview)
- [x] **Phase 4:** Customer Management (CRUD, Search, Filter, History, Notes)
- [x] **Phase 5:** Service Requests (Creation, Status, Convert to Job)
- [x] **Phase 6:** Job Management (Core lifecycle engine, Assignment, Status machine, Timeline, Attachments)
- [x] **Phase 7:** Technician Management (Tech directory, Workload, Tech Dashboard)
- [x] **Phase 8:** Scheduling (Calendar view, Daily/Weekly schedule, Conflict detection)
- [x] **Phase 9:** Technician Workflow (Mobile-friendly field job updates)
- [x] **Phase 10:** Invoice System (PDF/Print generation, Itemized charges, Tax/Discount, Statuses)
- [x] **Phase 11:** Payment Management (Payment logging, Methods, Outstanding balances)
- [x] **Phase 12:** Reports & Analytics (Revenue, Job trends, Performance metrics)
- [x] **Phase 13:** Notifications (In-app alerts, Job assignment alerts, Status change triggers)
- [x] **Phase 14:** Security & Hardening (Audit logging, Authz verification, Rate limiting, Security headers)
- [x] **Phase 15:** Testing & QA (Health check API, End-to-End & Integration verification)
- [x] **Phase 16:** Production Deployment (Vercel config, `.env.example`, Production build verification)
- [x] **Phase 17:** Portfolio Preparation (Complete case study README.md, Architecture overview)
- [x] **Phase 18:** Future Expansion Architecture (AI summary hooks, WhatsApp automation placeholders)

---

## 6. Current Status & Next Steps
- **Status:** **ALL 18 PHASES ARE 100% COMPLETED AND VERIFIED!**
- **Production Build:** Verified with `npm run build` (Clean compilation, 0 lint or type errors).
