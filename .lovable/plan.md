

## Make All Dashboards and Sections Fully Responsive

### Problem
When zooming the browser, content overflows or doesn't resize properly. Many pages use HTML tables that scroll horizontally on small screens instead of adapting layout. Only the Students page has a mobile card view — all other data pages (Billing, Gate Passes, Receivables, Payroll, Mess, Complaints, Maintenance, Room Allocation, Accounting, Admissions) show raw tables that are unusable on mobile/tablet.

### Changes

This is a large scope change touching ~15 files. The approach is:

#### 1. Global CSS — prevent zoom-caused overflow
**`src/index.css`** — Add `overflow-x: hidden` on the root `html` and `body` to prevent horizontal scroll when zooming.

#### 2. Pages needing mobile card views (currently table-only)
For each page below, add a **mobile card layout** (visible on `sm:hidden`) alongside the existing table (shown on `hidden sm:block`), following the same pattern as `Students.tsx`:

- **`src/pages/GatePasses.tsx`** — Card with pass ID, student name, type, status badge, duration, and action buttons
- **`src/pages/Billing.tsx`** — Cards for each invoice tab (All Invoices, Payments, Journal Entries, Refunds) showing amount, student, status, date
- **`src/pages/Receivables.tsx`** — Card per student with amount due, paid, balance
- **`src/pages/Payroll.tsx`** — Cards for staff/salary tabs showing name, role, salary, status
- **`src/pages/MessManagement.tsx`** — Cards for menu items and meal plans
- **`src/pages/Accounting.tsx`** — Cards for journal entries
- **`src/pages/Admissions.tsx`** — Cards for admission records

#### 3. Pages needing responsive grid/layout fixes
- **`src/pages/Complaints.tsx`** — Ensure complaint cards stack properly on mobile with `grid-cols-1 sm:grid-cols-2`
- **`src/pages/Maintenance.tsx`** — Same grid fix for maintenance tickets
- **`src/pages/RoomAllocation.tsx`** — Bed grid should use `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` instead of fixed columns
- **`src/pages/Properties.tsx`** — Property cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

#### 4. Dashboard stat cards zoom fix
**`src/components/dashboard/DashboardStats.tsx`** — Change grid from `grid-cols-2 lg:grid-cols-5` to `grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5` so cards stack at very small widths (zoomed in).

#### 5. Header and sidebar zoom resilience
- **`src/components/dashboard/DashboardHeader.tsx`** — Already responsive, just ensure all `gap` and `padding` use responsive variants
- **`src/components/dashboard/DashboardLayout.tsx`**, **`src/components/student/StudentLayout.tsx`**, **`src/components/superadmin/SuperAdminLayout.tsx`** — Already using `lg:ml-52`/`lg:ml-56`, no changes needed

#### 6. Student pages (student portal)
- **`src/pages/student/StudentInvoices.tsx`**, **`src/pages/student/StudentGatePasses.tsx`**, **`src/pages/student/StudentComplaints.tsx`**, **`src/pages/student/StudentMaintenance.tsx`** — Review and add mobile card views where tables are used

#### 7. Tabs overflow fix
Several pages use `TabsList` with many tabs that overflow on mobile. Wrap them in `overflow-x-auto` with `flex-wrap` or horizontal scroll on small screens.

### Technical Details
- All mobile cards follow the Students.tsx pattern: `sm:hidden` for cards, `hidden sm:block` for tables
- No backend or database changes
- Uses existing Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- Estimated ~15 files modified

