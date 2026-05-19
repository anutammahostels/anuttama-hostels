import { Check, Smartphone, Clock, Users, DoorOpen, Utensils, CreditCard, Sliders } from "lucide-react";
import { useState } from "react";

const policies = [
  { id: "mobile", icon: Smartphone, title: "Mobile Devices", options: ["Not Allowed", "Limited Hours", "Allowed"] },
  { id: "outing", icon: DoorOpen, title: "Outing Rules", options: ["Restricted", "With Permission", "Weekends Only"] },
  { id: "curfew", icon: Clock, title: "Curfew Time", options: ["9 PM", "10 PM", "11 PM"] },
  { id: "visitor", icon: Users, title: "Visitors", options: ["Not Allowed", "Parents Only", "Registered"] },
  { id: "mess", icon: Utensils, title: "Mess", options: ["Mandatory", "Optional", "External OK"] },
  { id: "payment", icon: CreditCard, title: "Payments", options: ["Cash", "UPI", "All Modes"] },
];

export const PolicyEngine = () => {
  const [activeOptions, setActiveOptions] = useState<Record<string, number>>({
    mobile: 1, outing: 1, curfew: 0, visitor: 1, mess: 0, payment: 2
  });

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
              <Sliders className="h-4 w-4" />
              Hostel Policy Configuration
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Internal house rules,
              <br />
              <span className="text-gradient">configured per hostel</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Each Anuttama-owned hostel can have its own curfew, visitor and mess rules. Our internal workspace lets the operations team configure house rules in one place.
            </p>

            <div className="space-y-4">
              {[
                "Per-hostel rule configuration",
                "Workflows that respect each location’s rules",
                "Block-level access restrictions",
                "Internal fee structures per hostel",
                "Audit log on every change",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 group">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary transition-colors">
                    <Check className="w-3 h-3 text-secondary group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />

            <div className="relative rounded-2xl lg:rounded-3xl bg-card border border-border p-6 lg:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Policy Settings</h3>
                  <p className="text-muted-foreground text-sm">Configure house rules per hostel</p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                  Live Preview
                </span>
              </div>

              <div className="space-y-3">
                {policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="p-4 rounded-xl bg-muted/50 border border-border hover:border-secondary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/10">
                          <policy.icon className="h-4 w-4 text-secondary" />
                        </div>
                        <span className="font-medium text-foreground text-sm">{policy.title}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {policy.options.map((option, i) => (
                        <button
                          key={option}
                          onClick={() => setActiveOptions(prev => ({ ...prev, [policy.id]: i }))}
                          className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                            activeOptions[policy.id] === i
                              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                              : "bg-background border border-border text-muted-foreground hover:border-secondary/50"
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
      </div>
    </section>
  );
};
