

# Super Admin Panel — Streamlined Features

## Current Problem
The super admin sidebar has too many items, many of which are just wrappers around the hostel admin pages. A super admin managing multiple hostels needs high-level oversight, not granular operational tools like individual mess management or room allocation.

## Proposed Feature Set

A super admin overseeing multiple hostels needs only these core capabilities:

```text
SUPER ADMIN SIDEBAR (Revised)
├── Overview
│   ├── Dashboard        — Global stats across all hostels
│   └── Organizations    — Manage tenant organizations
│
├── Hostel Management
│   ├── Properties       — View/add/edit/delete all properties
│   └── User Management  — Manage admins, wardens, staff roles
│
├── Monitoring
│   ├── Complaints       — View complaints across all hostels
│   ├── Notices          — Broadcast global notices
│   └── Reports          — Occupancy, revenue, attendance summaries
│
├── System
│   └── Settings         — Platform-wide configuration
```

**Removed** (these are hostel-admin-level concerns, not super admin):
- Rooms & Beds (managed by hostel admin per property)
- Students (managed by hostel admin)
- Gate Passes (managed by wardens/hostel admin)
- Mess Management (managed by hostel admin)
- Billing & Invoices (managed by hostel admin)
- Maintenance (managed by hostel admin)
- Attendance (managed by wardens)
- Policy Engine (managed per-property by hostel admin)

**Added**:
- Organizations page — to manage tenant organizations
- Reports page — high-level analytics across all hostels

## Technical Changes

### 1. Update `SuperAdminSidebar.tsx`
Reduce menu sections to: Overview (Dashboard, Organizations), Hostel Management (Properties, User Management), Monitoring (Complaints, Notices, Reports), System (Settings).

### 2. Create `src/pages/superadmin/SuperAdminOrganizations.tsx`
CRUD interface for organizations table — list all orgs, create new ones, edit, delete.

### 3. Create `src/pages/superadmin/SuperAdminReports.tsx`
Read-only analytics page showing:
- Total properties, rooms, students, occupancy rate
- Complaints by status breakdown
- Revenue summary from invoices

### 4. Update `src/App.tsx`
- Remove routes: `/superadmin/rooms`, `/superadmin/students`, `/superadmin/passes`, `/superadmin/mess`, `/superadmin/billing`, `/superadmin/maintenance`, `/superadmin/attendance`, `/superadmin/policies`
- Add routes: `/superadmin/organizations`, `/superadmin/reports`

### 5. Update `SuperAdminDashboard.tsx`
Refine to show only high-level KPIs relevant to multi-hostel oversight.

