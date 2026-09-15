# ServiceFlow - Service Business Job Management Platform

> Centralized SaaS Platform for Field Service Businesses (AC Repair, Electricians, Plumbers, Appliance Maintenance) to manage the entire service workflow from request to job completion, invoicing, and payment tracking.

---

## 🚀 Key Features

- **Multi-Tenant Workspace Architecture:** Strict data isolation per business (`businessId` scoped queries).
- **Role-Based Access Control (RBAC):** Dedicated permissions for `ADMIN`, `MANAGER`, and `TECHNICIAN`.
- **Operational Control Dashboard:** Real-time KPIs for active dispatches, pending receivables, and technician workloads.
- **Customer Directory:** Live search, address management, and complete service/invoice history.
- **Job Control Engine & State Machine:** Enforced state transitions (`SCHEDULED` ➔ `ASSIGNED` ➔ `EN_ROUTE` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
- **Itemized Invoice & Receivable System:** Automated GST tax calculations, discounts, PDF/printable views, and UPI payment logging.
- **Technician Force Management:** Skill tagging and active job load balancing.
- **In-App Notification Center:** Real-time updates on assignments, status changes, and payment collections.
- **Security & Audit Logs:** Transactional action tracking and security headers.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Design System:** ServiceFlow Light SaaS Theme (Inter font, `#2563EB` primary)
- **Backend:** Next.js API Routes & Server Actions
- **Database & ORM:** PostgreSQL / SQLite, Prisma ORM
- **Validation & Auth:** Zod schema validation, JWT Sessions (`jose`), Password hashing (`bcryptjs`)

---

## 🗝️ Demo Credentials (Local Seeded Database)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@apexhvac.com` | `admin123` |
| **Technician** | `vikram@apexhvac.com` | `tech123` |

---

## 📦 Getting Started Locally

```bash
# 1. Clone repo & install dependencies
npm install

# 2. Setup Database schema
npx prisma db push

# 3. Seed Demo Business & Jobs
node prisma/seed.js

# 4. Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📐 Portfolio Case Study Summary

- **Problem:** Small and medium service businesses lose revenue and customer trust due to scattered WhatsApp messages, unorganized phone calls, and manual invoice tracking.
- **Solution:** ServiceFlow unifies the end-to-end operational pipeline into a single, predictable web interface.
- **Result:** 100% visibility over job lifecycles, reduced double-booking, and faster receivables collection.

