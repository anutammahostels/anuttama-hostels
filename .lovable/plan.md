

## Add Bulk Selection & Actions to Students Table

### What We're Building
A checkbox-based multi-select system on the Students page with a floating action bar for bulk operations: Delete, Mark Inactive, Mark Active, and Vacate Rooms.

### Implementation

**File: `src/pages/Students.tsx`**

1. **Add selection state**: `selectedStudents: Set<string>` to track selected student IDs, plus a `selectAll` toggle.

2. **Add Checkbox column** to both desktop table and mobile cards:
   - Desktop: Add a checkbox `TableHead` + `TableCell` as the first column. Header checkbox toggles select-all for currently filtered students.
   - Mobile: Add a checkbox to each card's left side.

3. **Add floating bulk action bar**: When `selectedStudents.size > 0`, render a sticky bar at the bottom (or top) showing:
   - Count: "X students selected"
   - Buttons: **Mark Inactive**, **Mark Active**, **Delete**, **Vacate Rooms**
   - **Clear Selection** button

4. **Bulk action handlers**:
   - `handleBulkMarkInactive`: Update `status = 'inactive'` for all selected student IDs via `supabase.from('students').update({ status: 'inactive' }).in('id', [...selectedStudents])`
   - `handleBulkMarkActive`: Same but `status = 'active'`
   - `handleBulkDelete`: Show confirmation AlertDialog, then call `deleteStudent` for each selected student
   - `handleBulkVacateRooms`: For selected students that have beds, update beds to vacant
   - All handlers invalidate queries and clear selection on success

5. **Import Checkbox** from `@/components/ui/checkbox`

### Technical Details
- Uses existing `deleteStudent` mutation from `useStudents` hook for individual deletes in a loop, or a direct `.in('id', ids)` delete for efficiency
- Bulk status update uses a single Supabase query with `.in()` filter
- Selection persists across filter changes but clears on successful bulk action
- Confirmation dialog required for destructive actions (delete)

### Files to Edit
| File | Change |
|------|--------|
| `src/pages/Students.tsx` | Add selection state, checkboxes, bulk action bar, and handlers |

