## Goal
Restructure Parent's Portal navigation on mobile to a bottom tab bar (with My Invoices highlighted in the middle), move Profile access to the header avatar, add a Notices icon next to the bell, and remove the Mess tab from both mobile and desktop.

## Changes

### 1. `src/components/student/StudentSidebar.tsx` (desktop sidebar)
- Remove the "Mess" item from `menuItems` so it disappears from the desktop sidebar.
- Leave the mobile drawer code in place but it will no longer be opened from the header on mobile (see step 3). Desktop sidebar behavior is otherwise unchanged.

### 2. New file `src/components/student/StudentBottomNav.tsx` (mobile only)
- Fixed bottom bar visible only on mobile (`lg:hidden`), `fixed bottom-0 inset-x-0 z-40`.
- Layout: 5 slots in a row.
  - Left group: Dashboard (`/student`), Gate Passes (`/student/passes`)
  - Center (highlighted): My Invoices (`/student/invoices`) — larger circular button, elevated (`-mt-6`), solid blue accent, shadow, white icon
  - Right group: Maintenance (`/student/maintenance`), Complaints (`/student/complaints`)
- Active state uses blue accent text; inactive uses muted.
- Uses `NavLink` from react-router-dom with safe-area padding (`pb-[env(safe-area-inset-bottom)]`).

### 3. `src/components/dashboard/DashboardHeader.tsx`
- On mobile only, replace the hamburger menu button with two icon buttons (shown only when inside the parent/student layout):
  - Notices icon (`FileText` / `Megaphone`) linking to `/student/notices`, placed immediately before the existing `NotificationsDropdown` bell.
  - Profile avatar becomes a `Link` to `/student/profile` (replacing the current non-functional button).
- To keep the header generic, add an optional prop `variant?: "admin" | "student"` (default `"admin"`). When `variant === "student"`:
  - Hide the hamburger (`onMenuClick`) on mobile (no drawer needed since bottom nav exists).
  - Render the Notices link before the bell.
  - Wrap the avatar in `<Link to="/student/profile">`.
- Desktop layout is unchanged for both variants.

### 4. `src/components/student/StudentLayout.tsx`
- Pass `variant="student"` to `DashboardHeader`.
- Render `<StudentBottomNav />` at the bottom.
- Add bottom padding on the `<main>` for mobile (`pb-24 lg:pb-6`) so content isn't covered by the bottom bar.
- Remove the `sidebarOpen` state usage for mobile triggering (drawer no longer used on mobile); keep desktop sidebar mounted as before.

### 5. Routing
- Keep the `/student/mess` route registered (in case of deep links) but remove all navigation entry points. No router file changes required if the route just stops being linked. (Will verify in `src/App.tsx` and only remove the route if the user wants the page fully gone — not in scope per the request, which says "remove the tabs".)

## Out of scope
- No changes to desktop layout other than removing the Mess sidebar item.
- No color/theme changes beyond using the existing blue accent for the highlighted center button.
- No changes to admin portal header behavior.

## Technical notes
- Mobile bottom nav heights: ~64px bar + safe-area; center button overflows upward via `-mt-6` with a white ring to visually pop.
- `NavLink`'s `isActive` drives both the icon color and the center button's filled state.
- Icons: `LayoutDashboard`, `QrCode`, `Receipt` (center), `Wrench`, `MessageSquare` for bottom nav; `Megaphone` for the header Notices shortcut.
