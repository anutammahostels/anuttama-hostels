## Goal

Use the newly uploaded **Anuttama Enterprises LLP** logo (yellow square version) everywhere the logo appears, and make it visually fit by clipping the square into a rounded shape so it sits cleanly inside its parent container.

## Changes

### 1. Replace the logo asset
- Copy `user-uploads://anuttama_logo.png` → `src/assets/anuttama-logo.png` (used by the React `HostyliaLogo` component).
- Copy `user-uploads://anuttama_logo.png` → `public/anuttama-logo.png` (used by favicon + OG meta in `index.html`).

This automatically refreshes the logo in: Navbar, Footer, Auth page, Onboarding header, Welcome screen, browser favicon, and social share previews.

### 2. Round the corners of the logo image — `src/components/brand/HostyliaLogo.tsx`
The image is a yellow square; to make it sit nicely inside the parent flex container, clip the `<img>` itself with rounded corners and a subtle border:

- Add `rounded-xl` (≈12 px radius — proportional rounded square, modern app-icon look) to the `<img>` so the yellow background becomes a rounded tile rather than a hard square.
- Add `overflow-hidden` and a thin neutral border (`ring-1 ring-black/5`) so it reads as a polished badge on both light (white nav, auth panel) and dark (footer, navy hero) surfaces.
- Keep `object-cover` so the artwork fills the rounded tile edge-to-edge with no transparent gaps.
- Keep all existing props (`size`, `variant`, `className`, `showText`, `animated`) and the size maps unchanged so every existing call site (Navbar, Footer, Auth, Onboarding, Welcome) updates automatically.

### 3. No other files need to change
`index.html` already references `/anuttama-logo.png` — overwriting the file is enough to refresh the favicon and OG image.

## Result

The yellow Anuttama Enterprises crest will appear with smooth rounded corners (like an app icon) next to the "Anuttama" wordmark in the navbar, footer, and auth/onboarding screens, fitting cleanly inside their parent containers without the harsh square edge.
