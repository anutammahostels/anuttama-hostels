import { 
  Building2, 
  QrCode, 
  UtensilsCrossed, 
  Receipt, 
  Wrench, 
  Shield,
  Users,
  Bell,
  BarChart3,
  Settings2
} from "lucide-react";

const features = [
  {
    icon: Settings2,
    title: "Policy Configuration Engine",
    description: "Customize rules for curfews, gadget policies, visitor restrictions, and more. One platform adapts to any facility type.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Building2,
    title: "Property & Inventory",
    description: "Manage the full hierarchy: Hostel → Block → Floor → Room → Bed. Track assets and document conditions at check-in.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: QrCode,
    title: "Digital Gate Pass",
    description: "Streamlined approval workflow with QR codes. Automated alerts for curfew violations and real-time tracking.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: UtensilsCrossed,
    title: "Mess Management",
    description: "Weekly menus with nutritional info. Smart rebate system when students mark absence 24 hours in advance.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Receipt,
    title: "Billing Engine",
    description: "Sub-metering for electricity, automated late fees, and comprehensive invoicing. Payment tracking made simple.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Wrench,
    title: "Maintenance & Ticketing",
    description: "Photo-based issue reporting with auto-assignment. Escalation rules ensure nothing falls through the cracks.",
    color: "from-indigo-500 to-blue-600",
  },
];

const roles = [
  { icon: Shield, label: "Super Admin", desc: "SaaS-level management" },
  { icon: Building2, label: "Tenant Admin", desc: "Full facility control" },
  { icon: Users, label: "Warden", desc: "Mobile-first operations" },
  { icon: Bell, label: "Student", desc: "Self-service portal" },
  { icon: BarChart3, label: "Parent", desc: "Read-only + approvals" },
  { icon: QrCode, label: "Security", desc: "Gate scanning" },
];

export const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to
            <br />
            <span className="text-gradient">Manage Student Housing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive suite of tools designed specifically for hostels, 
            boarding schools, and co-living spaces.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Roles section */}
        <div className="relative">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
              Role-Based Access
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tailored Dashboards for Every User
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Six distinct role-based interfaces, each optimized for their specific needs and responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {roles.map((role, index) => (
              <div
                key={role.label}
                className="group flex flex-col items-center p-6 rounded-2xl border border-border bg-card hover:bg-primary hover:border-primary transition-all duration-300 cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-white/20 transition-colors mb-3">
                  <role.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-semibold text-card-foreground group-hover:text-white transition-colors text-center">
                  {role.label}
                </h4>
                <p className="text-xs text-muted-foreground group-hover:text-white/70 transition-colors text-center mt-1">
                  {role.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
