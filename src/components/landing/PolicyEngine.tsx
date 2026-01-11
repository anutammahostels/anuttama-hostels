import { Check, Smartphone, Wifi, Clock, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const policies = [
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile Device Policy",
    description: "Choose between gadget surrender logs or WiFi MAC registration",
    options: ["Gadget Surrender Log", "WiFi MAC Registration"],
    enabled: true,
  },
  {
    id: "curfew",
    icon: Clock,
    title: "Curfew Enforcement",
    description: "Configure late entry handling based on your facility type",
    options: ["Strict (SMS Alert)", "Grace Period", "Open"],
    enabled: true,
  },
  {
    id: "visitor",
    icon: Users,
    title: "Visitor Restrictions",
    description: "Gender-based access control for different blocks",
    options: ["Gender Restricted", "Open Visitation"],
    enabled: false,
  },
];

export const PolicyEngine = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Policy Engine
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              One Platform,
              <br />
              <span className="text-gradient">Infinite Configurations</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              From strict boarding schools to liberal co-living spaces, the Policy 
              Configuration Engine adapts to your facility's unique requirements. 
              No hard-coded rules — just flexible settings that control UI and logic.
            </p>

            <div className="space-y-4">
              {[
                "Dynamic module activation based on policies",
                "Automated workflows that respect your rules",
                "Parent notification controls",
                "Block-level access restrictions",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive demo */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl blur-3xl" />
            
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-card-foreground">Policy Settings</h3>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  Live Preview
                </span>
              </div>

              <div className="space-y-6">
                {policies.map((policy) => (
                  <div 
                    key={policy.id}
                    className="p-4 rounded-xl bg-secondary/50 border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <policy.icon className="h-4 w-4 text-primary" />
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
                      <Switch checked={policy.enabled} />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {policy.options.map((option, i) => (
                        <span
                          key={option}
                          className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                            i === 0 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection lines decoration */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                    <div className="w-2 h-2 rounded-full bg-primary/50" />
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
