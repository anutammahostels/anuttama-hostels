## Goal

Remove the scroll-driven color/theme switching on the landing-page navbar (`src/components/landing/Navbar.tsx`) and lock it to a single, consistent appearance that stays the same whether the user is at the top of the page or scrolled down.

## Chosen Style

Use the "scrolled" treatment as the permanent style — it's the more readable, accessible variant and works on every page (Home, Solutions, Features, About, Contact):

- Background: white with blur (`bg-white/90 dark:bg-background/90 backdrop-blur-xl`)
- Border: subtle bottom border (`border-b border-border/50`)
- Soft shadow (`shadow-sm`)
- Logo: `light` variant (dark text on white)
- Nav links: muted-foreground → foreground on hover; active link uses `text-primary bg-primary/10`
- "Log in" button: default ghost styling (no white override)
- Mobile menu icon: dark (`text-foreground`)
- "Get Started" button: unchanged (gradient)

## Changes (single file)

**`src/components/landing/Navbar.tsx`**

1. Remove the `isScrolled` state, the `useEffect` scroll listener, and the `handleScroll` function.
2. Replace the conditional `<nav>` className with the constant scrolled style.
3. Replace `variant={isScrolled ? "light" : "dark"}` on `<HostyliaLogo>` with a fixed `variant="light"`.
4. Simplify each nav `<Link>` className to only the "scrolled" branch (active vs inactive, no white-on-transparent variant).
5. Simplify the "Log in" button — drop the `!isScrolled && "text-white..."` override.
6. Simplify the mobile menu button + icon — always use `hover:bg-muted` and `text-foreground`.

No other files are affected. Mobile menu panel and "Get Started" button already use fixed styles, so they need no change.

## Out of Scope

- Logo, favicon, and brand assets remain as-is.
- Dashboard / Student / Super Admin headers are untouched (they already have their own consistent styling).
