

## Fix: Wire Notification Creation Across All Actions

### Problem
The notification **reading/display** infrastructure is fully functional — all 3 dashboards (Admin, Student, Super Admin) share `DashboardHeader` → `NotificationsDropdown` → `useNotifications` with realtime subscriptions. However, **no code anywhere actually inserts notifications into the `notifications` table**. The system can display and listen for notifications, but nothing generates them.

### Solution
Create a reusable `createNotification` helper and wire it into all key action points across the app.

---

### 1. Create notification helper utility

**New file: `src/lib/notifications.ts`**
- Export `createNotification(userId, title, message, type, link?)` function that inserts into the `notifications` table
- Export `createBulkNotifications(notifications[])` for multi-user notifications
- Types: `gate_pass`, `complaint`, `maintenance`, `billing`, `admission`, `general`

### 2. Wire notifications into Gate Pass actions

**File: `src/hooks/useGatePasses.ts`**
- On gate pass **approval/rejection**: notify the student (`student.user_id`) with status update
- On gate pass **creation** (by student): notify admin/tenant_admin users with new request alert

### 3. Wire notifications into Complaints

**File: `src/pages/Complaints.tsx`** (or complaints hook)
- On complaint **status change**: notify the student who filed it
- On new complaint **creation**: notify admin users

### 4. Wire notifications into Maintenance

**File: `src/pages/Maintenance.tsx`** (or maintenance hook)
- On maintenance request **status update**: notify the requesting student
- On new request: notify admin users

### 5. Wire notifications into Billing/Invoices

**File: `src/pages/Billing.tsx`** and `src/hooks/useInvoices.ts`
- On invoice **creation**: notify the student
- On **payment recorded**: notify the student
- On **refund processed**: notify the student

### 6. Wire notifications into Admissions

**File: `src/pages/Admissions.tsx`**
- On admission **approved/rejected**: notify applicant (if they have a user_id)
- On **enrollment**: notify the newly created student

### 7. Wire notifications into Student actions

**File: `src/pages/Students.tsx`**
- On **room assignment**: notify the student
- On **student exit**: notify the student

### 8. Admin-facing notifications from student actions

For student-initiated actions (gate pass requests, complaints, maintenance), the helper needs to query admin user IDs for the relevant property to send them notifications. Add a small helper that fetches admin `user_id`s by property.

---

### RLS Note
The current INSERT policy only allows `super_admin` and `tenant_admin` roles to insert notifications. This means **student-initiated notifications** (e.g., "New gate pass request") won't work from the client side for students. 

**Fix needed**: Either:
- (A) Add a database function `create_notification()` with `SECURITY DEFINER` that any authenticated user can call, or
- (B) Update the RLS INSERT policy to also allow authenticated users to insert notifications for admin users

Option (A) is more secure — prevents students from inserting arbitrary notifications.

### DB Migration
- Create `SECURITY DEFINER` function `create_notification(target_user_id, title, message, type, link)` that validates the caller is authenticated and inserts the notification

### Files to Create/Edit

| File | Changes |
|------|---------|
| `src/lib/notifications.ts` | New — helper functions for creating notifications |
| `src/hooks/useGatePasses.ts` | Add notification calls on approve/reject/create |
| `src/pages/Complaints.tsx` | Add notification on status change and creation |
| `src/pages/Maintenance.tsx` | Add notification on status change and creation |
| `src/pages/Billing.tsx` | Add notification on invoice/payment/refund |
| `src/pages/Admissions.tsx` | Add notification on approval/enrollment |
| `src/pages/Students.tsx` | Add notification on room assign/exit |
| DB migration | Create `create_notification` security definer function + update INSERT policy |

