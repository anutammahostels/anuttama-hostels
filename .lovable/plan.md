

## Landing Page Overhaul + New Pricing Model

### What Changes

**1. Pricing — 2 Plans Only**
- **Plan 1: "Growth"** — ₹2/student/day with core features (Property Management, Room Allocation, Billing with Discounts & Refunds, Gate Pass, Mess, Maintenance, Attendance, Student Portal, Excel & PDF Exports, Payroll with Payslips, Receivables Report)
- **Plan 2: "Enterprise"** — Custom pricing with everything in Growth + Unlimited properties, Custom integrations, Dedicated account manager, SLA guarantee, On-premise option, Priority support, Training & onboarding
- Remove old 3-tier Starter/Professional/Enterprise plans

**2. Hero Section Update**
- Replace "7-Day Free Trial — No Credit Card" badge with "Starting at just ₹2/student/day"
- Change CTA from "Start Free Trial" to "Get Started" / "Contact Sales"
- Update trust indicators to reflect new features (Excel Reports, Payroll, Refunds)

**3. Features Section — Updated Feature List**
Reflect all newly built features:
- Smart Policy Engine (existing)
- Property & Room Management (existing)
- Digital Gate Pass (existing)
- Mess Management (existing)
- **Billing, Discounts & Refunds** (updated — highlight discount during invoice, refund on student exit)
- Maintenance Tickets (existing)
- **Payroll & Payslips** (new — full salary components, PDF payslips)
- **Student Receivables Report** (new — gross/discount/received/net)
- **Excel & PDF Exports** (new — all data pages)
- **Attendance & Admissions** (existing but highlight)

**4. Benefits Section**
- Keep structure, update copy to mention new capabilities (Excel exports, payroll automation, refund processing)

**5. Pricing Section (`src/pages/Pricing.tsx`)**
- Complete rewrite: 2 cards side by side
- Growth card: ₹2/student/day, full feature list
- Enterprise card: "Contact Sales", custom features
- Update FAQ to match new pricing model
- Remove old testimonials from pricing page (already on homepage)

**6. Navbar**
- Add "Pricing" link back to nav (currently missing from navLinks)

**7. Footer**
- Add Pricing link under Product
- Update year to 2026

**8. CTA Section**
- Replace "free trial" messaging with "Starting at ₹2/student/day"
- Update CTAs to "Get Started" and "Contact Sales"

**9. Mobile Responsiveness**
- Already largely responsive, but audit all new sections for compact mobile layout
- Ensure pricing cards stack vertically on mobile with proper spacing

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/landing/Hero.tsx` | Update badge, CTA text, trust indicators |
| `src/components/landing/Features.tsx` | Add Payroll, Receivables, Excel Export, update Billing feature |
| `src/components/landing/Benefits.tsx` | Update copy referencing new features, remove "free trial" CTA |
| `src/components/landing/CTA.tsx` | Replace trial messaging with pricing-focused CTA |
| `src/components/landing/Navbar.tsx` | Add Pricing to navLinks |
| `src/components/landing/Footer.tsx` | Add Pricing link, update year |
| `src/pages/Pricing.tsx` | Full rewrite — 2 plans (₹2/student/day + Enterprise) |
| `src/pages/Index.tsx` | No structural change (sections stay the same) |

### Pricing Card Design
- Growth plan: White card with green accent, prominent "₹2" price, "/student/day" suffix, full checklist of 15+ features
- Enterprise plan: Dark gradient card, "Custom" price, "Contact Sales" CTA, premium features list
- Growth card highlighted as "Most Popular"

