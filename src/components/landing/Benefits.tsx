import {
  Clock,
  TrendingDown,
  Users,
  ShieldCheck,
  Smartphone,
  HeartHandshake,
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Save 20+ hours weekly",
    description:
      "Automate payroll, billing, attendance, gate passes, and exports.",
    stat: "20+",
    statLabel: "hours saved",
  },
  {
    icon: TrendingDown,
    title: "Reduce costs by 40%",
    description:
      "Digital workflows and automated payslips cut administrative overhead.",
    stat: "40%",
    statLabel: "cost reduction",
  },
  {
    icon: Users,
    title: "Full parent visibility",
    description:
      "Real-time updates on attendance, meals, and gate passes — trust by default.",
    stat: "100%",
    statLabel: "transparency",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise security",
    description:
      "Bank-grade encryption, role-based access, and complete audit trails.",
    stat: "99.9%",
    statLabel: "uptime SLA",
  },
  {
    icon: Smartphone,
    title: "Mobile-first design",
    description:
      "Full functionality on any device for students, parents, and staff.",
    stat: "24/7",
    statLabel: "access",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated support",
    description:
      "Onboarding, training, and priority response — we're with you throughout.",
    stat: "<2h",
    statLabel: "response time",
  },
];

export const Benefits = () => {
  return (
    <section className="py-20 lg:py-28 bg-white border-y border-brand-line">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="max-w-2xl mb-12 lg:mb-16">
          <span className="text-xs font-medium tracking-wider uppercase text-brand">
            Why teams switch
          </span>
          <h2 className="mt-3 text-3xl lg:text-5xl font-semibold text-brand-ink tracking-[-0.02em] leading-tight">
            Real outcomes. Measured in hours, rupees, and peace of mind.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-line rounded-2xl overflow-hidden border border-brand-line">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group bg-white p-6 lg:p-8 transition-colors hover:bg-brand-cream"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10 text-brand">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-brand-ink tracking-tight">
                    {benefit.stat}
                  </p>
                  <p className="text-[11px] text-brand-ink-muted uppercase tracking-wider">
                    {benefit.statLabel}
                  </p>
                </div>
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-brand-ink mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-brand-ink-muted leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
