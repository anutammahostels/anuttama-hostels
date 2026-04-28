# Landing Page Refresh — Professional & Minimal

## Why redo it (honest assessment)

The current landing page is **visually busy** and **off-brand**:

- Hero uses a near-black navy (`hsl(222,47%,6%)`) plus a blue→cyan→green text gradient. The Anuttama logo is warm/earthy (orange-saffron + cream), so the page and logo currently look like they belong to two different products.
- Heavy effects: 3 big blur orbs, floating icon chips, 3 floating stat cards, grid overlay, gradient buttons, gradient text, gradient feature tiles in 10 different colors. This reads "template-y," not "professional SaaS."
- 10 feature cards each with a unique vibrant gradient (violet, pink, cyan, amber, rose…) fragment the brand.

A minimal, logo-aligned redesign **will work better** than the current UI for a B2B residential-management product. Buyers (hostel admins, school operators) trust calm, structured interfaces.

Only landing-page surfaces change. Dashboards, student portal, super-admin panel, and auth flows stay exactly as they are.

---

## New visual direction

**Palette (anchored to logo)**
- Background: warm off-white `#FAF7F2` (cream, matches logo backdrop)
- Surface: pure white with `1px` neutral border `#ECE7DE`
- Ink (text): near-black `#0F1419`
- Muted text: `#5C6470`
- **Brand primary: saffron/terracotta** `hsl(22 88% 52%)` — pulled from the logo's dominant orange. Used sparingly (CTAs, single accent line, key numbers).
- Brand deep: `hsl(28 45% 22%)` (logo's dark brown) — for hover/pressed states and the footer.
- No multi-color gradients. One single brand-tint gradient reserved for the primary CTA only.

**Typography**
- Keep Plus Jakarta Sans, but tighten: hero h1 drops from `7xl` to `5xl/6xl`, weight `600` not `700`, tracking `-0.03em`. Body stays Inter at `text-base` with `text-muted-foreground`.
- Remove the rainbow `.text-gradient` from headings. Replace with plain ink color and a single saffron underline-accent on the key word.

**Layout principles**
- Generous whitespace, max content width `1200px`.
- Sections separated by space, not by colored backgrounds. Every section sits on the cream background.
- One visual element per section — no stacked floating chips + orbs + grid + glow simultaneously.
- Subtle motion only: fade-up on scroll, no float/bounce/pulse.

---

## Section-by-section changes

### 1. Navbar (`Navbar.tsx`)
- Light cream background with `backdrop-blur` + `1px` bottom border (instead of dark navy).
- Logo at `size="md"`, `variant="light"`, `rounded="full"` — sits naturally on cream.
- Nav links: muted ink, hover = saffron underline (no pill backgrounds).
- "Get Started" button: solid saffron, no gradient. "Log in" stays ghost.

### 2. Hero (`Hero.tsx`) — biggest cleanup
- Remove: hero building image, all 3 blur orbs, grid pattern, 3 floating icon chips, 3 floating stat cards, glow behind dashboard.
- Keep: heading, subtitle, 2 CTAs, dashboard mockup, trust indicators.
- New structure:
  - Small pill above heading: "Smart Residential Management" in saffron-tinted chip.
  - Heading: `"Run your hostel like a modern operation."` — black ink, one saffron-underlined word ("modern").
  - Subtitle: shorter, single sentence, muted.
  - Two buttons: primary saffron solid, secondary ghost with thin border.
  - Trust row: 4 simple `icon + label` items in muted ink, no hover color shift.
  - Dashboard mockup centered in a soft `1px` bordered frame with a faint shadow — no floating cards around it.

### 3. Features (`Features.tsx`)
- Drop the 10 different per-card gradients. All cards use the same neutral surface; icon sits in a small saffron-tinted square (`bg-primary/8`, `text-primary`).
- Grid: `grid-cols-2 lg:grid-cols-3` (instead of 5) so each card breathes — show top 6 features here with a "View all 25+" link.
- Remove the two large room/mess images block (decorative, not informative). Keep them only on the dedicated `/features` page.
- Roles section: 3 simple bordered cards in a row, no hover gradient swap.

### 4. Benefits, PolicyEngine, Testimonials, CTA
- Same desaturation pass: replace gradient backgrounds with cream/white, replace multi-color icons with single saffron accents, simplify cards to `1px` border + tiny shadow.
- CTA section: one centered block, saffron primary button, no background gradient — just a thin top divider.

### 5. Footer
- Switch background to logo's deep brown `hsl(28 45% 22%)` with cream text. This is the only dark surface on the page and acts as a natural "ground."

### 6. Tokens (`src/index.css`)
- Update `--primary` to saffron `22 88% 52%` (light theme only — dashboards rely on this token but the saffron still reads as a confident brand color in admin UI; existing blue/green semantic statuses stay untouched via `--info`, `--success`).
- Add `--brand-cream: 36 38% 96%` and `--brand-deep: 28 45% 22%`.
- Tone down `.text-gradient` to a single saffron→deep-brown gradient (used rarely, not in the new hero).
- Remove unused `glow`, `glow-primary`, `animate-glow-pulse`, `animate-float` references from landing components (keep utilities defined for other pages).

> ⚠️ Trade-off to confirm: changing `--primary` recolors primary buttons across the **admin dashboard** too (currently navy blue). If you want dashboards to stay blue and only the landing page to be saffron, I'll instead introduce a **landing-only** `--brand` token and leave `--primary` alone. Default in this plan = single saffron primary everywhere; tell me if you'd rather scope it.

---

## Files I'll edit

- `src/index.css` — palette tokens, simplify gradient utility
- `src/components/landing/Navbar.tsx` — light theme
- `src/components/landing/Hero.tsx` — strip effects, restructure
- `src/components/landing/Features.tsx` — unify cards, drop image block
- `src/components/landing/Benefits.tsx` — desaturate
- `src/components/landing/PolicyEngine.tsx` — desaturate
- `src/components/landing/Testimonials.tsx` — neutral cards
- `src/components/landing/CTA.tsx` — minimal block
- `src/components/landing/Footer.tsx` — deep brown surface
- `src/components/brand/HostyliaLogo.tsx` — no change needed; already supports `variant="light"`

No DB, no edge functions, no auth changes.

---

## What you'll get

A landing page that looks like it was built for **Anuttama Hostels** specifically: warm, calm, confident; logo and page share the same visual language; CTAs pop because the rest of the page is quiet. Roughly 40% less DOM and animation on the hero alone, so it'll also feel snappier.

Approve and I'll implement, then you can review in the preview.