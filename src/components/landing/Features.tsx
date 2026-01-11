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
  Settings2,
  Wallet,
  UserCheck
} from "lucide-react";

const features = [
  {
    icon: Settings2,
    title: "Policy Configuration Engine",
    description: "Customize rules for curfews, gadget policies, visitor restrictions, and more. One platform adapts to any facility type.",
    color: "from-secondary to-emerald-600",
  },
  {
    icon: Building2,
    title: "Property & Room Management",
    description: "Manage the full hierarchy: Property → Block → Floor → Room → Bed. Track assets and document conditions at check-in.",
    color: "from-primary to-hostylia-navy-light",
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
    color: "from-primary to-secondary",
  },
];

const roles = [
  { icon: Shield, label: "Super Admin", desc: "Platform Management" },
  { icon: Building2, label: "Owner", desc: "Multi-Property Control" },
  { icon: UserCheck, label: "Property Manager", desc: "Day-to-day Operations" },
  { icon: Users, label: "Warden", desc: "Block-level Supervision" },
  { icon: Wallet, label: "Accountant", desc: "Financial Management" },
  { icon: Bell, label: "Student", desc: "Self-service Portal" },
  { icon: BarChart3, label: "Parent", desc: "Monitoring & Approvals" },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4 animate-fade-in">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-slide-up">
            Everything You Need to
            <br />
            <span className="text-gradient">Manage Residential Facilities</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-slide-up stagger-1">
            A comprehensive suite of tools designed specifically for hostels, 
            boarding schools, colleges, and co-living spaces.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10 hover:-translate-y-2 hover:border-secondary/30 card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-secondary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Roles section */}
        <div className="relative">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Role-Based Access Control
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              7 Tailored Dashboards
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each role gets a dedicated interface optimized for their specific responsibilities and workflows.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {roles.map((role, index) => (
              <div
                key={role.label}
                className="group flex flex-col items-center p-6 rounded-2xl border border-border bg-card hover:bg-secondary hover:border-secondary transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-white/20 transition-colors mb-3">
                  <role.icon className="h-6 w-6 text-secondary group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-semibold text-card-foreground group-hover:text-white transition-colors text-center text-sm">
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