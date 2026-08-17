# Annutamma Hostel

Project Title: Next-Gen SaaS Hostel Management System (HMS) with Dynamic Policy Engine

Role: Act as a Senior Full-Stack Architect and Product Manager. Goal: Build a multi-tenant SaaS application for managing student housing. The system must support diverse facility types (from strict boarding schools to liberal co-living spaces) via a central "Policy Configuration Engine."

Tech Stack:

Frontend: React (Vite), TypeScript, Tailwind CSS, Shadcn UI (for components).

Backend/Database: Supabase (PostgreSQL, Auth, Realtime).

State Management: TanStack Query.

1. Core Architecture: The Policy Engine
Do not build hard-coded rules. Instead, build a settings table for each tenant that controls UI and logic. The application must read these flags on initialization:

policy_mobile_allowed (Boolean): If FALSE, enable "Gadget Surrender Log" module; if TRUE, enable "Wi-Fi MAC Registration" module.

policy_curfew_mode (Enum: 'Strict', 'Grace', 'Open'): Determines if late entry triggers an automated SMS to parents or just a log entry.

policy_visitor_gender_restricted (Boolean): If TRUE, prevents booking male visitors into female blocks.

2. User Roles & Authentication (RBAC)
Implement Role-Based Access Control with the following distinct dashboards :

Super Admin: SaaS provider view (manage tenants, subscriptions).

Tenant Admin (Owner): Full access to financial reports, staff management, and the Policy Engine.

Warden: Mobile-first view for attendance, room inspections, and granting leave.

Student: Self-service portal for payments, complaints, and mess menu.

Parent: Read-only view for attendance/grades, plus action buttons for "Approve Gate Pass" and "Pay Fees".

Security Guard: Minimalist interface. Only features: Scan QR Code (Gate Pass) and Log Visitor.

3. Key Functional Modules (Must-Have)
A. Property & Inventory Management

Structure: Create a hierarchy of Hostel -> Block -> Floor -> Room -> Bed.

Unit of Inventory: The "Bed" is the sellable unit, not the room. Allow users to book specific beds (e.g., "Bed A (Window side) in Room 101").

Asset Mapping: Each room must have an inventory list (e.g., 2 Chairs, 1 Fan). Include a feature for students to upload photos of damage at check-in to prevent disputes.

B. The "Digital Gate Pass" System

Workflow: Student requests pass -> Warden Approves -> (Optional: Parent Approves via OTP based on policy) -> QR Code generated.

Security Action: Guard scans QR code at the gate. System logs "Time Out" and "Time In".

Alert: Trigger an automated alert if a student has not scanned "Time In" by the configured curfew time.

C. Mess (Dining) Management

Menu: Display weekly menu with nutritional info.

Rebate Logic: Allow students to mark themselves "Absent" for meals. If marked absent 24 hours in advance, automatically calculate a daily rebate on their next month's bill.

D. Financial & Billing Engine

Sub-metering: Allow manual or API entry of electricity meter readings per room. Formula: (Current - Previous Reading) * Unit Rate. Add this to the monthly rent invoice.

Late Fees: Implement a rule engine: If invoice_status is 'Unpaid' > 5 days past due_date, apply a daily penalty fee of $X.

E. Maintenance & Ticketing

Students upload photos of issues (e.g., broken tap).

Auto-assign to staff based on category (Plumbing tickets -> Plumber).

Escalate to Warden if not closed in 48 hours.

4. UI/UX Requirements
Mobile Responsiveness: The Warden and Security dashboards must be fully optimized for mobile usage (large buttons, minimal typing).

Data Visualization: Admin dashboard should show "Occupancy Rates," "Pending Dues," and "Open Complaints" in real-time charts.

Theme: Clean, professional, using a blue/slate color palette.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hostylia.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/43447d81-cefd-4f73-a479-52ab24d2f9c2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
