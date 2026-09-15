# Design.md

# ServiceFlow Design System

## 1. Design Direction

ServiceFlow should feel:

- Professional
- Modern
- Reliable
- Clean
- Operational
- Easy to understand

The design should communicate:

> "This is serious business software."

Avoid the appearance of a generic student dashboard.

---

# 2. Theme

Primary theme:

**Light-first professional SaaS**

Support dark mode later if required.

The MVP should prioritize the light theme.

---

# 3. Color System

Use a restrained color system.

### Primary

```text
#2563EB
```

Used for:

- Primary buttons
- Active navigation
- Links
- Important actions

### Primary Dark

```text
#1D4ED8
```

### Background

```text
#F8FAFC
```

### Surface

```text
#FFFFFF
```

### Primary Text

```text
#0F172A
```

### Secondary Text

```text
#64748B
```

### Border

```text
#E2E8F0
```

### Success

```text
#16A34A
```

### Warning

```text
#D97706
```

### Error

```text
#DC2626
```

### Info

```text
#0284C7
```

Colors should communicate meaning rather than decoration.

---

# 4. Typography

Recommended font:

**Inter**

Fallback:

```text
system-ui
sans-serif
```

Typography should be clean and highly readable.

---

# 5. Typography Scale

### Page Title

```text
32px
font-weight: 700
```

### Section Title

```text
24px
font-weight: 600
```

### Card Title

```text
16px
font-weight: 600
```

### Body

```text
14–16px
```

### Caption

```text
12–13px
```

Avoid excessive font sizes.

---

# 6. Layout

Desktop application:

```text
┌──────────────┬───────────────────────────────┐
│              │ Header                        │
│   Sidebar    ├───────────────────────────────┤
│              │                               │
│              │ Main Content                  │
│              │                               │
│              │                               │
└──────────────┴───────────────────────────────┘
```

Sidebar:

- Fixed on desktop
- Collapsible
- Responsive on mobile

---

# 7. Navigation

Main navigation:

```text
Dashboard

Operations
├── Service Requests
├── Jobs
├── Schedule
└── Technicians

Customers

Finance
├── Invoices
└── Payments

Reports

Settings
```

Keep navigation predictable.

---

# 8. Dashboard Design

Top:

```text
Good morning, Admin

[Date / Business]
```

Then KPI cards:

```text
Today's Jobs
Pending Jobs
Completed Jobs
Outstanding Payments
```

Then:

```text
Today's Schedule | Technician Workload
```

Then:

```text
Recent Jobs | Revenue Overview
```

Do not overload the dashboard with 15+ widgets.

---

# 9. Cards

Cards should use:

- White surface
- Subtle border
- Small radius
- Consistent padding
- Clear hierarchy

Avoid excessive shadows.

---

# 10. Buttons

Primary:

> Create Job

Secondary:

> Edit

Destructive:

> Delete / Cancel

Buttons should communicate action clearly.

Avoid:

> Click Here

---

# 11. Tables

Tables should support:

- Search
- Filtering
- Sorting
- Pagination
- Row actions

Example:

```text
Job ID | Customer | Technician | Date | Status | Amount | Action
```

On mobile, convert complex tables into cards or horizontally scroll where appropriate.

---

# 12. Status Badges

Use consistent status indicators.

Example:

```text
Scheduled
Assigned
In Progress
Completed
Cancelled
```

Status colors must remain consistent throughout the application.

---

# 13. Forms

Forms should use:

- Clear labels
- Helpful placeholders
- Inline validation
- Logical grouping
- Required-field indicators

Long forms should be divided into sections.

---

# 14. Modal Rules

Use modals for:

- Small confirmations
- Quick edits
- Simple creation flows

Use dedicated pages for complex forms.

Do not put a 20-field form inside a tiny modal.

---

# 15. Job Detail Page

Recommended structure:

```text
Job #JOB-1042

[Status]

Customer
Technician
Schedule

────────────────────────

Job Description

────────────────────────

Job Timeline

Created
Assigned
In Progress
Completed

────────────────────────

Service Details

────────────────────────

Attachments

────────────────────────

Invoice
Payment
```

---

# 16. Technician Mobile UI

Technician interface should prioritize:

```text
Today's Jobs
      ↓
Job Details
      ↓
Customer Location
      ↓
Start Job
      ↓
Update Work
      ↓
Complete Job
```

Large touch targets.

Minimal unnecessary navigation.

---

# 17. Notifications

Use:

- Toasts
- Inline alerts
- Notification center

Do not use notifications for every minor event.

---

# 18. Empty States

Example:

```text
No jobs scheduled

You don't have any jobs scheduled for today.

[Create Job]
```

Empty states should guide the user.

---

# 19. Responsive Breakpoints

Design for:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Do not design desktop first and simply shrink everything.

---

# 20. Accessibility

Minimum requirements:

- Good contrast
- Keyboard navigation
- Visible focus states
- Proper labels
- Semantic HTML
- Accessible buttons
- Meaningful error messages

Never rely only on color to communicate status.

---

# 21. Design Principle

The interface should feel:

**Simple enough for a small-business owner.**

but

**Powerful enough for daily operations.**

Every screen should prioritize the user's next action.