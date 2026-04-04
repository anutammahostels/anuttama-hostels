

## Align Student Data with Anuttama Hostel Payment Format

The uploaded Excel file uses these key columns: `S.NO`, `FORM NO`, `STUDENT NAME`, `FATHER NAME`, `Gender`, `CONTACT NO1`, `CONTACT NO 2`, `GRADE`, `STREAM`, and payment-related fields.

### Current Issues
- Template and parser don't match the actual file format (different column names)
- `FORM NO` = enrollment number (login ID), `STUDENT NAME` = student name — only these two are mandatory
- Missing `father_name` and `gender` columns in the `students` table
- Bulk upload field mapping doesn't recognize `FORM NO`, `STUDENT NAME`, `FATHER NAME`, `CONTACT NO1`, `GRADE`, etc.

### Changes

**1. Database Migration — Add `father_name` and `gender` to `students` table**
- `ALTER TABLE students ADD COLUMN father_name text;`
- `ALTER TABLE students ADD COLUMN gender text;`

**2. Update Edge Function `create-student/index.ts`**
- Accept `father_name` and `gender` in the request body
- Store them in the `students` table on creation

**3. Update `downloadTemplate()` in `Students.tsx`**
- Match exact column names from the uploaded file: `S.NO`, `FORM NO`, `STUDENT NAME`, `FATHER NAME`, `Gender`, `CONTACT NO1`, `CONTACT NO 2`, `GRADE`, `STREAM`
- Remove payment-related columns (not relevant for student creation)
- Add a sample row matching the format

**4. Update `parseExcel()` header detection in `Students.tsx`**
- Add `"form no"`, `"student name"`, `"father name"`, `"contact no1"` to the known headers list for auto-detection

**5. Update `handleBulkUpload()` field mapping in `Students.tsx`**
- Map `form_no` / `form no` → `roll_number` (enrollment number / login ID)
- Map `student_name` / `student name` → `full_name`
- Map `father_name` / `father name` → `father_name`
- Map `gender` → `gender`
- Map `contact_no1` / `contact no1` → `phone`
- Map `contact_no_2` / `contact no 2` → `emergency_contact`
- Map `grade` → `course`
- Map `stream` → `department`
- Only `full_name` and `roll_number` remain mandatory

**6. Update Add Student form in `Students.tsx`**
- Add `father_name` and `gender` fields to both the form state and the dialog
- Pass them to the `create-student` edge function

**7. Update student table display**
- Show father name in student details where relevant

### Result
- Uploading the exact file `HOSTEL_PAYMENT_SESSION_2026-2027.xlsx` will work directly
- Template download will match the same format
- Students created via `FORM NO` can log in using that number
- Only `FORM NO` and `STUDENT NAME` are required; everything else is optional

