

## Student Exit with Refund Processing

### Current State
- **Refund mechanism** already exists in the Billing page — admins can process refunds against individual invoices with amount, reason, and method.
- **Student exit** is handled via "Vacate Room" (clears bed) and "Delete Student" (removes record) on the Students page, but there is **no exit workflow** that ties together: vacating bed + processing pending invoice refunds + marking student inactive.

### What to Build

Add an **"Exit Student"** workflow to the Students page that consolidates the exit procedure into a single guided dialog:

**1. "Exit Student" menu item** — Add to the student dropdown menu (visible only for active students with a bed assigned).

**2. Exit Dialog** — A multi-section dialog that shows:
- **Student summary**: Name, Roll No, Room, Admission Date
- **Outstanding invoices**: Fetches all invoices for the student, shows paid amounts eligible for pro-rata refund
- **Refund form per invoice**: For each paid/partial invoice, allow admin to enter refund amount (pre-filled with remaining days pro-rata or full paid amount), reason, and method
- **Confirmation**: Summary of actions — vacate bed, set status to "inactive", process refunds

**3. Exit procedure** (on confirm):
1. Process refunds for selected invoices (insert into `refunds` table, update invoice)
2. Vacate bed (`beds` update → student_id null, status vacant)
3. Update student status to `inactive`
4. Show success toast with summary

### Files to Edit

| File | Changes |
|------|---------|
| `src/pages/Students.tsx` | Add "Exit Student" dropdown item, exit dialog with invoice fetching, refund form, and multi-step exit handler |

### No DB Changes Required
The `refunds` table, `invoices` table, `beds` table, and `students.status` field all already exist with appropriate columns and RLS policies.

