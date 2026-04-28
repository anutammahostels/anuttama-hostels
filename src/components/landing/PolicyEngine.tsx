import {
  Check,
  Smartphone,
  Clock,
  Users,
  DoorOpen,
  Utensils,
  CreditCard,
} from "lucide-react";
import { useState } from "react";

const policies = [
  { id: "mobile", icon: Smartphone, title: "Mobile devices", options: ["Not allowed", "Limited hours", "Allowed"] },
  { id: "outing", icon: DoorOpen, title: "Outing rules", options: ["Restricted", "With permission", "Weekends"] },
  { id: "curfew", icon: Clock, title: "Curfew time", options: ["9 PM", "10 PM", "11 PM"] },
  { id: "visitor", icon: Users, title: "Visitors", options: ["Not allowed", "Parents only", "Registered"] },
  { id: "mess", icon: Utensils, title: "Mess", options: ["Mandatory", "Optional", "External OK"] },
  { id: "payment", icon: CreditCard, title: "Payments", options: ["Cash", "UPI", "All modes"] },
];

const checks = [
  "Dynamic module activation based on policies",
  "Automated workflows that respect your rules",
  "Block-level access restrictions",
  "Custom fee structures per property",
  "Real-time rule enforcement",
];

export const PolicyEngine = () => {
  const [activeOptions, setActiveOptions] = useState<Record<string, number>>({
    mobile: 1,
    outing: 1,
    curfew: 0,
    visitor: 1,
    mess: 0,
    payment: 2,
  });

  return (
    <section className="py-20 lg:py-28 bg-brand-cream">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Content */}
          <div className="lg:pt-6">
            <span className="text-xs font-medium tracking-wider uppercase text-brand">
              Smart Policy Engine
            </span>
            <h2 className="mt-3 text-3xl lg:text-5xl font-semibold text-brand-ink tracking-[-0.02em] leading-tight">
              One platform. Configured for the way you actually run things.
            </h2>
            <p className="mt-5 text-base lg:text-lg text-brand-ink-muted leading-relaxed">
              From strict boarding schools to flexible co-living — every rule,
              every fee structure, every workflow tunes to your facility.
            </p>

            <ul className="mt-8 space-y-3">
              {checks.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10 text-brand flex-shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm lg:text-base text-brand-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Card */}
          <div className="rounded-2xl bg-white border border-brand-line p-5 lg:p-7 shadow-[0_24px_60px_-30px_hsl(28_45%_22%/0.2)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-brand-ink text-base">Policy Settings</h3>
                <p className="text-xs text-brand-ink-muted mt-0.5">Live preview</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-[11px] font-medium">
                Interactive
              </span>
            </div>

            <div className="space-y-2.5">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="p-3.5 rounded-xl border border-brand-line bg-brand-cream/50"
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white border border-brand-line text-brand">
                      <policy.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium text-brand-ink text-sm">{policy.title}</span>
                  </div>

                  <div className="flex gap-1.5">
                    {policy.options.map((option, i) => (
                      <button
                        key={option}
                        onClick={() =>
                          setActiveOptions((prev) => ({ ...prev, [policy.id]: i }))
                        }
                        className={`flex-1 text-[11px] px-2 py-1.5 rounded-md font-medium transition-all duration-150 ${
                          activeOptions[policy.id] === i
                            ? "bg-brand text-brand-foreground"
                            : "bg-white border border-brand-line text-brand-ink-muted hover:text-brand-ink hover:border-brand/40"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
