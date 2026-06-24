## Goals
1. Replace every gradient in the app with the solid brand green `#29926A` — except the Parent (student) Portal which keeps its blue identity.
2. Rename "Student Portal" → "Parent's Portal" (text only).
3. Audit the Parent Portal so every page is mobile‑first responsive with no horizontal overflow.

---

## 1. Solid green replacement (`#29926A`)

**Design tokens — `src/index.css`**
- `--primary` / `--ring` / `--sidebar-primary` → `152 55% 36%` (HSL of #29926A) in both `:root` and `.dark`.
- Collapse gradient tokens to solid color:
  - `--gradient-primary: hsl(152 55% 36%);`
  - `--gradient-hero`, `--gradient-card`, `--gradient-glass` → solid `#29926A` / surface equivalents.
  - `--shadow-glow: 0 0 60px -15px hsl(152 55% 36% / 0.35);`

**Tailwind utility sweep**
Run a scripted replace across `src/` (excluding `src/components/student/**` and `src/pages/student/**` to preserve the blue Parent Portal theme):
- `bg-gradient-to-[a-z]+\s+from-[^\s"']+(\s+via-[^\s"']+)?\s+to-[^\s"']+` → `bg-[#29926A]`
- Standalone `bg-gradient-to-*` (no from/to) → `bg-[#29926A]`
- Text gradients (`bg-clip-text text-transparent bg-gradient-to-*`) → `text-[#29926A]`

Each touched file is re‑opened and visually sanity‑checked (sidebars, buttons, cards, hero, badges) so foreground contrast stays correct (white text on green stays white).

**Files in scope** (40 files identified via `rg`): landing pages, dashboard, super‑admin, onboarding, auth, payments, etc.

---

## 2. "Student Portal" → "Parent's Portal"

Pure text changes:
- `src/pages/Auth.tsx` line 131 — header label.
- `src/components/student/StudentSidebar.tsx` line 59 — sidebar subtitle.
- Any other user‑visible "student portal" strings discovered with a final `rg -i` pass (route paths, component names, table fields, code identifiers are **not** changed).

---

## 3. Parent Portal — mobile‑first responsiveness

Pages to audit: `StudentDashboard`, `StudentInvoices`, `StudentGatePasses`, `StudentComplaints`, `StudentMaintenance`, `StudentMess`, `StudentNotices`, `StudentProfile`, plus `StudentLayout` + `StudentSidebar`.

Standard fixes applied where missing:
- Page container: `p-3 sm:p-6 space-y-4` and `max-w-full overflow-x-hidden`.
- Headings: `text-xl sm:text-2xl lg:text-3xl`, body `text-sm sm:text-base`, truncate long names.
- Tabs (shadcn `TabsList`): wrap in `overflow-x-auto` with `flex w-max` so tabs scroll horizontally on small screens instead of clipping.
- Tables: enforce the project's dual‑view rule — `hidden sm:block` desktop table + `sm:hidden` mobile card list (already a Core memory). Add the mobile card view where a page only ships a table today.
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (no fixed multi‑column on mobile).
- Buttons & form rows: full‑width on mobile (`w-full sm:w-auto`), stack with `flex-col sm:flex-row gap-2`.
- Sidebar: confirm mobile drawer (`sm:hidden` trigger, slide‑in `w-64`) closes on route change; desktop stays `lg:ml-52`.
- Modals/Dialogs: `max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto`.

Verification: Playwright at viewport 390×844 — load each Parent Portal route, screenshot, confirm no horizontal scrollbar on `<body>` and every tab/column is reachable.

---

## Out of scope
- No business‑logic, routing, or DB changes.
- The Parent Portal keeps its blue accent (`from-blue-500 to-blue-600`) per your choice.
- Login mechanics unchanged — only the label says "Parent's Portal".