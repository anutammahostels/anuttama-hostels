import { Check, Smartphone, Wifi, Clock, Users, DoorOpen, Utensils, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const policies = [
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile Device Policy",
    description: "Control phone usage rules",
    options: ["No Phones", "Limited Hours", "Always Allowed"],
    defaultOption: 1,
  },
  {
    id: "outing",
    icon: DoorOpen,
    title: "Outing Policy",
    description: "Configure student outing rules",
    options: ["No Outing", "Permission Required", "Weekends Only"],
    defaultOption: 1,
  },
  {
    id: "curfew",
    icon: Clock,
    title: "Curfew Enforcement",
    description: "Set entry timing rules",
    options: ["Strict (10 PM)", "Standard (11 PM)", "Flexible"],
    defaultOption: 0,
  },
  {
    id: "visitor",
    icon: Users,
    title: "Visitor Policy",
    description: "Manage visitor access",
    options: ["No Visitors", "Parents Only", "Registered Guests"],
    defaultOption: 1,
  },
  {
    id: "mess",
    icon: Utensils,
    title: "Mess Configuration",
    description: "Food service settings",
    options: ["Mandatory", "Optional", "External Allowed"],
    defaultOption: 0,
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Payment Modes",
    description: "Accepted payment methods",
    options: ["Cash", "UPI", "Bank Transfer"],
    defaultOption: 1,
  },
];

export const PolicyEngine = () => {
  const [enabledPolicies, setEnabledPolicies] = useState<Record<string, boolean>>({
    mobile: true,
    outing: true,
    curfew: true,
    visitor: false,
    mess: true,
    payment: true,
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>(() =>
    policies.reduce((acc, p) => ({ ...acc, [p.id]: p.defaultOption }), {})
  );

  const togglePolicy = (id: string) => {
    setEnabledPolicies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectOption = (policyId: string, optionIndex: number) => {
    setSelectedOptions(prev => ({ ...prev, [policyId]: optionIndex }));
  };

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4 animate-fade-in">
              Smart Policy Engine
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-slide-up">
              One Platform,
              <br />
              <span className="text-gradient">Infinite Configurations</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed animate-slide-up stagger-1">
              From strict boarding schools to flexible co-living spaces, the Smart Policy 
              Engine adapts to your facility's unique requirements. 
              No hard-coded rules — just flexible settings that control UI and logic.
            </p>

            <div className="space-y-4 animate-slide-up stagger-2">
              {[
                "Dynamic module activation based on policies",
                "Automated workflows that respect your rules",
                "Parent notification controls",
                "Block-level access restrictions",
                "Custom fee structures per property",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                    <Check className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-foreground group-hover:text-secondary transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive demo */}
          <div className="relative animate-scale-in stagger-3">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/10 rounded-3xl blur-3xl" />
            
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-card-foreground">Policy Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure your property rules</p>
                </div>
                <span className="text-xs text-secondary bg-secondary/10 px-3 py-1.5 rounded-full font-medium animate-pulse">
                  Live Preview
                </span>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {policies.map((policy, index) => (
                  <div 
                    key={policy.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      enabledPolicies[policy.id] 
                        ? "bg-secondary/5 border-secondary/20" 
                        : "bg-muted/50 border-border"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          enabledPolicies[policy.id] ? "bg-secondary/20" : "bg-muted"
                        }`}>
                          <policy.icon className={`h-4 w-4 transition-colors ${
                            enabledPolicies[policy.id] ? "text-secondary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground text-sm">
                            {policy.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {policy.description}
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={enabledPolicies[policy.id]} 
                        onCheckedChange={() => togglePolicy(policy.id)}
                      />
                    </div>
                    
                    {enabledPolicies[policy.id] && (
                      <div className="flex flex-wrap gap-2 animate-fade-in">
                        {policy.options.map((option, i) => (
                          <button
                            key={option}
                            onClick={() => selectOption(policy.id, i)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                              selectedOptions[policy.id] === i 
                                ? "bg-secondary text-white shadow-md" 
                                : "bg-muted text-muted-foreground hover:bg-secondary/20"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Connection lines decoration */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 hidden lg:flex">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-px bg-gradient-to-r from-secondary/50 to-transparent" />
                    <div className="w-2 h-2 rounded-full bg-secondary/50 animate-pulse" />
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