

## Add Delete Room, Delete Student, and Student Filters

### Changes

#### 1. Add `deleteRoom` mutation to `useRooms.ts`
- Add a mutation that deletes all beds for a room first, then deletes the room itself
- Invalidates rooms query on success

#### 2. Add Delete Room button to `src/pages/RoomAllocation.tsx`
- Add a `Trash2` icon button in each room card header (next to the block/floor badge)
- Show a confirmation AlertDialog before deleting
- Only allow deletion if all beds in the room are vacant (no students assigned)

#### 3. Add `deleteStudent` mutation to `useStudents.ts`
- Mutation that vacates the student's bed (if any), then deletes the student record
- Note: This deletes the student record only, not the auth user (would need an edge function for full cleanup)

#### 4. Add Delete Student option to `src/pages/Students.tsx`
- Add "Delete Student" dropdown item (red/destructive) in both mobile and desktop dropdown menus
- Show confirmation AlertDialog before deleting
- Vacate bed if assigned before deletion

#### 5. Implement working Filters in `src/pages/Students.tsx`
- Replace the non-functional "Filters" button with a Popover containing filter controls:
  - **Status**: Select (All / Active / On Leave / Inactive)
  - **Course**: Select populated from unique courses in data
  - **Year**: Select (All / 1 / 2 / 3 / 4)
  - **Room Status**: Select (All / Allocated / Not Allocated)
- Update `filteredStudents` logic to apply all active filters alongside search
- Show active filter count badge on the Filters button

### Files to Edit
1. `src/hooks/useRooms.ts` — Add `deleteRoom` mutation
2. `src/hooks/useStudents.ts` — Add `deleteStudent` mutation
3. `src/pages/RoomAllocation.tsx` — Add delete button + confirmation dialog per room card
4. `src/pages/Students.tsx` — Add delete option in dropdown, replace Filter button with working Popover filters

