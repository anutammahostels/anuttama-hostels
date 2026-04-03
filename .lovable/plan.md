

## Rebrand Landing Page to "Anuttama Hostels"

Replace all "Hostylia" branding on public-facing pages with "Anuttama Hostels" text branding. Dashboard and internal app remain unchanged.

### Changes

**1. Logo component — replace image logo with text**
- `src/components/brand/HostyliaLogo.tsx`: Replace the `<img>` tag with a styled text element reading **"Anuttama"** (or "Anuttama Hostels" for larger sizes). Keep the same size/variant props for navbar and footer compatibility. Use the existing brand font and gradient colors.

**2. Landing page components — replace all "Hostylia" text**
- `src/components/landing/Hero.tsx`: No direct brand name, but update meta context (subtitle text referencing the platform)
- `src/components/landing/Benefits.tsx` (line 81): "Why Choose Hostylia" → "Why Choose Anuttama"
- `src/components/landing/Testimonials.tsx` (lines 14, 26, 38, 100): All "Hostylia" mentions in quotes and headers → "Anuttama"
- `src/components/landing/Footer.tsx` (line 118): "© 2026 Hostylia" → "© 2026 Anuttama Hostels"
- `src/components/landing/CTA.tsx`: No direct brand name — no changes needed

**3. Other public pages**
- `src/pages/FeaturesPage.tsx` (lines 300, 308): "Hostylia" → "Anuttama"
- `src/pages/Pricing.tsx` (line 249): "Hostylia" → "Anuttama"
- `src/pages/Solutions.tsx` (line 21): "Hostels using Hostylia" → "Hostels using Anuttama"
- `src/pages/About.tsx`: Check for brand name mentions and update
- `src/pages/Contact.tsx` (line 16-17): Keep `contact@hostylia.com` email as-is per user request

**4. HTML and metadata**
- `index.html`: Update `<title>`, all `<meta>` tags from "Hostylia" → "Anuttama Hostels — Smart Residential Management"
- `public/hostylia-favicon.svg`: Update the "H" letter to "A" for Anuttama

**5. Files NOT changed**
- Dashboard components (`DashboardSidebar`, `DashboardHeader`, etc.)
- Auth pages, onboarding pages
- Edge functions (super admin email stays as-is)
- Footer contact info (email, phone, address remain the same per user request)

### Technical Notes
- The `HostyliaLogo` component is used in Navbar, Footer, and Onboarding. Since scope is landing-page-only, the Onboarding usage will also get the text treatment (it imports the same component), which is acceptable as it's a public-facing page.
- Total files to edit: ~10 files

