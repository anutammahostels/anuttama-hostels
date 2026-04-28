import {
  Building2,
  QrCode,
  UtensilsCrossed,
  Receipt,
  Wrench,
  Wallet,
  BarChart3,
  Settings2,
  FileSpreadsheet,
  CalendarCheck,
  Shield,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Settings2,
    title: "Smart Policy Engine",
    description:
      "Configure rules for curfews, devices, visitors, and more — one platform adapts to any facility.",
  },
  {
    icon: Building2,
    title: "Property & Room Management",
    description:
      "Property → Block → Floor → Room → Bed hierarchy with visual layouts and live occupancy.",
  },
  {
    icon: QrCode,
    title: "Digital Gate Pass",
    description:
      "QR-based approvals with real-time tracking, curfew alerts, and parent notifications.",
  },
  {
    icon: Receipt,
    title: "Billing, Discounts & Refunds",
    description:
      "Automated invoicing with discount logic, exit refunds, and multi-mode payments.",
  },
  {
    icon: Wallet,
    title: "Payroll & Payslips",
    description:
      "HRA, PF, ESI, TDS, incentives — generate compliant PDF payslips in one click.",
  },
  {
    icon: BarChart3,
    title: "Receivables Reporting",
    description:
      "Track gross fees, discounts, payments, and net outstanding per student in real time.",
  },
];

const supporting = [
  { icon: UtensilsCrossed, label: "Mess Management" },
  { icon: Wrench, label: "Maintenance Tickets" },
  { icon: FileSpreadsheet, label: "Excel & PDF Exports" },
  { icon: CalendarCheck, label: "Attendance & Admissions" },
];

const roles = [
  { icon: Shield, label: "Super Admin", desc: "Multi-property oversight" },
  { icon: Building2, label: "Hostel Admin", desc: "Day-to-day operations" },
  { icon: Users, label: "Student", desc: "Self-service portal" },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-brand-cream">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="max-w-2xl mb-12 lg:mb-16">
          <span className="text-xs font-medium tracking-wider uppercase text-brand">
            What's inside
          </span>
          <h2 className="mt-3 text-3xl lg:text-5xl font-semibold text-brand-ink tracking-[-0.02em] leading-tight">
            Everything you need to run residential facilities — and nothing you don't.
          </h2>
          <p className="mt-4 text-base lg:text-lg text-brand-ink-muted leading-relaxed">
            A focused suite of tools that replaces spreadsheets, WhatsApp groups,
            and standalone billing apps with one quiet system.
          </p>
        </div>

        {/* Primary feature grid — uniform, neutral, no rainbow gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-16 lg:mb-20">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-white border border-brand-line p-6 lg:p-7 transition-all duration-300 hover:border-brand/40 hover:shadow-[0_8px_24px_-12px_hsl(28_45%_22%/0.18)]"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10 text-brand mb-5 transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-brand-ink mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-brand-ink-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Supporting modules row */}
        <div className="rounded-2xl border border-brand-line bg-white p-6 lg:p-8 mb-16 lg:mb-20">
          <p className="text-xs font-medium tracking-wider uppercase text-brand-ink-muted mb-5">
            Plus everything else
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {supporting.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 text-sm text-brand-ink"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-brand-cream-soft text-brand">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roles */}
        <div className="mb-10 lg:mb-12">
          <span className="text-xs font-medium tracking-wider uppercase text-brand">
            Built for every role
          </span>
          <h3 className="mt-3 text-2xl lg:text-3xl font-semibold text-brand-ink tracking-[-0.02em]">
            Three tailored dashboards.
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 lg:mb-16">
          {roles.map((role) => (
            <div
              key={role.label}
              className="rounded-xl border border-brand-line bg-white p-5 hover:border-brand/40 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand/10 text-brand mb-4">
                <role.icon className="h-4.5 w-4.5" />
              </div>
              <p className="font-semibold text-brand-ink text-sm">{role.label}</p>
              <p className="text-xs text-brand-ink-muted mt-1">{role.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <Link to="/features">
            <Button
              variant="outline"
              className="border-brand-line bg-white text-brand-ink hover:bg-brand-cream-soft gap-2 group"
            >
              View all features
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
