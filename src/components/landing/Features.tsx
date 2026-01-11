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
  UserCheck,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Settings2,
    title: "Smart Policy Engine",
    description: "Configure rules for curfews, devices, visitors, and more. One platform adapts to any facility.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Building2,
    title: "Property Management",
    description: "Full hierarchy management: Property → Block → Floor → Room → Bed with visual layouts.",
    gradient: "from-primary to-blue-500",
  },
  {
    icon: QrCode,
    title: "Digital Gate Pass",
    description: "QR-based approval workflows with real-time tracking and automated curfew alerts.",
    gradient: "from-secondary to-emerald-500",
  },
  {
    icon: UtensilsCrossed,
    title: "Mess Management",
    description: "Weekly menus, nutritional tracking, and smart rebate system for meal absences.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Receipt,
    title: "Billing & Invoicing",
    description: "Automated invoicing, sub-metering, late fee management, and payment tracking.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Wrench,
    title: "Maintenance Tickets",
    description: "Photo-based reporting with auto-assignment, SLA tracking, and escalation rules.",
    gradient: "from-cyan-500 to-teal-500",
  },
];

const roles = [
  { icon: Shield, label: "Super Admin", desc: "Platform control" },
  { icon: Building2, label: "Owner", desc: "Multi-property" },
  { icon: UserCheck, label: "Manager", desc: "Operations" },
  { icon: Users, label: "Warden", desc: "Block level" },
  { icon: Wallet, label: "Accountant", desc: "Finances" },
  { icon: Bell, label: "Student", desc: "Self-service" },
  { icon: BarChart3, label: "Parent", desc: "Monitoring" },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Settings2 className="h-4 w-4" />
            Comprehensive Features
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Everything for
            <span className="text-gradient"> Modern Residential Management</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete suite of tools designed specifically for hostels, boarding schools, and co-living spaces.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl lg:rounded-3xl bg-card border border-border p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 hover:border-primary/20 overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`inline-flex p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-br ${feature.gradient} mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Learn more link */}
              <div className="mt-4 flex items-center gap-2 text-primary font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Roles section */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Users className="h-4 w-4" />
            Role-Based Access
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            7 Tailored Dashboards
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Each role gets a dedicated interface optimized for their specific responsibilities.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-12">
          {roles.map((role) => (
            <div
              key={role.label}
              className="group flex items-center gap-3 px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-card border border-border hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:border-transparent transition-all duration-300 cursor-pointer hover:shadow-lg"
            >
              <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-white/20 transition-colors">
                <role.icon className="h-4 w-4 text-secondary group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground group-hover:text-white transition-colors text-sm">
                  {role.label}
                </p>
                <p className="text-xs text-muted-foreground group-hover:text-white/70 transition-colors">
                  {role.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/features">
            <Button size="lg" variant="outline" className="gap-2">
              View All Features <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};