## Goal

Replace the text-only "Anuttama" wordmark with the uploaded **Anuttama Enterprises LLP** crest logo across the landing site, auth/onboarding pages, browser favicon, and social share previews.

## Files to change

### 1. Add the logo asset
- Copy `user-uploads://image-13.png` → `src/assets/anuttama-logo.png` (used by React components, benefits from bundling/optimization).
- Copy `user-uploads://image-13.png` → `public/anuttama-logo.png` (used as favicon + OG image referenced from `index.html`).

### 2. Upgrade `src/components/brand/HostyliaLogo.tsx`
Make the component render the actual logo image alongside the "Anuttama" wordmark, while preserving the existing API (`size`, `variant`, `className`, `animated`, `showText`) so all 6 existing usages keep working without further edits.

- Import the logo from `@/assets/anuttama-logo.png`.
- Render an `<img>` (the crest) + the wordmark text in a flex row.
- Map `size` prop to both the image dimensions (sm: 28px, md: 36px, lg: 44px, xl: 56px) and existing text size.
- Respect `showText` (default true) so callers can hide text and show only the crest if needed.
- Keep `variant` controlling text color exactly as today.
- Add `alt="Anuttama Enterprises LLP"` for accessibility.
- Add a subtle white circular background ring behind the crest only when `variant="dark"` so the yellow/red logo stays legible on the dark navy navbar/footer.

This single change automatically updates:
- Landing Navbar (`Navbar.tsx`)
- Landing Footer (`Footer.tsx`)
- Auth page (`Auth.tsx`, both desktop side panel + mobile)
- Onboarding header (`Onboarding.tsx`)
- Welcome screen (`WelcomeScreen.tsx`)

### 3. Favicon + meta — `index.html`
- Replace `/hostylia-favicon.svg` references with `/anuttama-logo.png`:
  - `<link rel="icon" type="image/png" href="/anuttama-logo.png" />`
  - `<link rel="apple-touch-icon" href="/anuttama-logo.png" />`
- Add an Open Graph image: `<meta property="og:image" content="/anuttama-logo.png" />` and matching `twitter:image`.
- Leave the existing `hostylia-favicon.svg` file in place (no deletion needed; it just stops being referenced).

## Out of scope

- Dashboard sidebars (admin/student/super-admin) — those use icon/text headers, not the `HostyliaLogo` component. Happy to extend in a follow-up if you want the crest there too.
- Renaming the `HostyliaLogo` component (kept as-is to avoid touching 6 import sites).

## Result

Every place currently showing the "Anuttama" text mark will now show the **circular Anuttama Enterprises crest + wordmark**, and the browser tab + shared link previews will display the new logo.
