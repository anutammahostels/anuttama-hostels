## Add Center (Property) to Students + Filters on Students, Billing, Dashboard

Use existing Properties as "centers". Add `property_id` on `students`, backfill all to Sarjapur, expose the field in bulk upload and UI, and add center filters to Students, Billing, and Dashboard.

### 1. Database migration
- Rename `Main Property` → `Sarjapur`.
- Add column `students.property_id uuid` (nullable initially).
- Backfill: `UPDATE students SET property_id = '<sarjapur id>'`.
- Add FK `students.property_id → properties(id) ON DELETE SET NULL` and index `idx_students_property_id`.
- (Keep nullable so future students from new centers can be added without breaking historical rows.)

### 2. Edge function `create-student`
- Accept new `center` field (string property name) OR `property_id`.
- Resolve `center` name → `property_id` (case-insensitive match on `properties.name`). If unknown, return 400 `UNKNOWN_CENTER`.
- Default to Sarjapur's id when missing (configurable fallback) to keep existing uploads working.
- Persist `property_id` on insert.

### 3. Bulk upload (xlsx)
- Add `CENTER` column to the downloadable template (header + sample row "Sarjapur").
- `src/pages/Students.tsx → handleBulkUpload`: read `row.CENTER`, pass as `center` to the edge function.

### 4. Students page (`/dashboard/students`)
- Add Center column in desktop table and mobile card.
- Add a Center filter `<Select>` (All / Sarjapur / …list from `useProperties`) next to existing filters; filter the in-memory list by `property_id`.
- Include center in the Excel export.
- Manual "Add Student" dialog: add Center dropdown (required), defaulting to Sarjapur.

### 5. Billing page (`/dashboard/billing`)
- Join/lookup each invoice's student → property_id.
- Add Center filter `<Select>` at the top (All / per property).
- Show Center column in the invoices table (desktop) + card (mobile).
- Apply filter to summary stats shown on this page (totals, pending, paid) so they reflect the selected center.

### 6. Dashboard (`/dashboard`)
- Add a Center selector in the header (All / per property), stored in component state.
- Scope these stats to selected center: total students, occupancy, recent activity. Keep "All" as default.
- (No change to roles/notifications.)

### 7. Memory
- Update `mem://features/bulk-student-management` to document the new `CENTER` column.
- Add a short note to core memory: "Centers = Properties. Students carry `property_id`."

### Out of scope
- No changes to rooms/beds/blocks hierarchy.
- No multi-center scoping for Receivables/Accounting (you said skip).
- No new `centers` table.
- Adding the second center is done later from the Properties page (no code change needed).

### Verification
- Migration: `SELECT count(*) FROM students WHERE property_id IS NULL` → 0; Sarjapur shows 1025.
- Bulk re-upload with `CENTER=Sarjapur` succeeds; `CENTER=Unknown` returns clear 400.
- Students page filter narrows list correctly; export contains Center column.
- Billing page filter narrows invoices and updates totals.
- Dashboard counts change when switching center.
