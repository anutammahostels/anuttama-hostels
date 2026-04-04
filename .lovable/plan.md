

## Plan: Show Additional Student Fields in Student List

### What's Happening
The fields FATHER NAME, Gender, CONTACT NO1, CONTACT NO 2, STREAM, and REMARKS are already correctly extracted during bulk upload and stored in the database. They're just not displayed in the students table.

### Changes Required

**Single file: `src/pages/Students.tsx`**

1. **Desktop table (lines ~955-960)**: Add new `<TableHead>` columns for Father Name, Gender, Phone, Contact 2, Stream, and Remarks after the existing columns.

2. **Desktop table body (lines ~972-1001)**: Add corresponding `<TableCell>` entries:
   - Father Name → `student.father_name`
   - Gender → `student.gender`
   - Phone (Contact 1) → `student.profile?.phone`
   - Contact 2 → `student.emergency_contact`
   - Stream → `student.department`
   - Remarks → `student.remarks`

3. **Mobile cards (lines ~893-938)**: Add a small details section showing these fields below the existing info.

4. **Edit dialog**: The edit form (lines ~391-398) currently doesn't populate `father_name`, `gender`, or `remarks` when editing — add those to the `editForm` state initialization so edits preserve these fields.

### Technical Notes
- No database or edge function changes needed — all data is already stored
- The `Student` type from Supabase types already includes `father_name`, `gender`, `emergency_contact`, `department`, and `remarks`
- `phone` comes from the `profile` relation, `emergency_contact` maps to Contact No 2

