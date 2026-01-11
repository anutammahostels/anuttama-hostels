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
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import hostelRoomImage from "@/assets/hostel-room.jpg";
import messCafeteriaImage from "@/assets/mess-cafeteria.jpg";

const features = [
  {
    icon: Settings2,
    title: "Smart Policy Engine",
    description: "Configure rules for curfews, devices, visitors, and more. One platform adapts to any facility type.",
    gradient: "from-violet-500 to-purple-600",
    benefits: ["Custom rule configuration", "Auto-enforcement", "Audit trails"],
  },
  {
    icon: Building2,
    title: "Property Management",
    description: "Full hierarchy management: Property → Block → Floor → Room → Bed with visual layouts and real-time status.",
    gradient: "from-primary to-blue-500",
    benefits: ["Visual bed grids", "Drag-drop allocation", "Condition tracking"],
  },
  {
    icon: QrCode,
    title: "Digital Gate Pass",
    description: "QR-based approval workflows with real-time tracking, automated curfew alerts, and parent notifications.",
    gradient: "from-secondary to-emerald-500",
    benefits: ["QR scanning", "Multi-level approval", "Auto-alerts"],
  },
  {
    icon: UtensilsCrossed,
    title: "Mess Management",
    description: "Weekly menus, nutritional tracking, absence marking, and smart rebate system for meal management.",
    gradient: "from-orange-500 to-amber-500",
    benefits: ["Menu planning", "Rebate automation", "Attendance tracking"],
  },
  {
    icon: Receipt,
    title: "Billing & Invoicing",
    description: "Automated invoicing, sub-metering integration, late fee management, and multi-mode payments.",
    gradient: "from-pink-500 to-rose-500",
    benefits: ["Auto-invoicing", "Payment tracking", "Receipt generation"],
  },
  {
    icon: Wrench,
    title: "Maintenance Tickets",
    description: "Photo-based reporting with auto-assignment, SLA tracking, escalation rules, and resolution tracking.",
    gradient: "from-cyan-500 to-teal-500",
    benefits: ["Photo uploads", "SLA monitoring", "Vendor management"],
  },
];

const roles = [
  { icon: Shield, label: "Super Admin", desc: "Platform control", color: "bg-violet-500" },
  { icon: Building2, label: "Owner", desc: "Multi-property", color: "bg-primary" },
  { icon: UserCheck, label: "Manager", desc: "Operations", color: "bg-secondary" },
  { icon: Users, label: "Warden", desc: "Block level", color: "bg-orange-500" },
  { icon: Wallet, label: "Accountant", desc: "Finances", color: "bg-pink-500" },
  { icon: Bell, label: "Student", desc: "Self-service", color: "bg-cyan-500" },
  { icon: BarChart3, label: "Parent", desc: "Monitoring", color: "bg-amber-500" },
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
            <Sparkles className="h-4 w-4" />
            Comprehensive Features
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Everything for
            <span className="text-gradient"> Modern Residential Management</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete suite of tools designed specifically for hostels, boarding schools, and co-living spaces.
            <span className="font-medium text-foreground"> Save 20+ hours weekly </span> with intelligent automation.
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
              <p className="text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Benefits list */}
              <div className="space-y-2">
                {feature.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Learn more link */}
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-primary font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Feature images showcase */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src={hostelRoomImage} 
              alt="Modern hostel room" 
              className="relative rounded-3xl w-full h-64 object-cover border border-border shadow-lg group-hover:shadow-2xl transition-all duration-500"
            />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-border">
              <p className="font-semibold text-foreground">Smart Room Management</p>
              <p className="text-sm text-muted-foreground">Visual bed allocation, condition tracking, and real-time occupancy updates</p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src={messCafeteriaImage} 
              alt="Hostel mess cafeteria" 
              className="relative rounded-3xl w-full h-64 object-cover border border-border shadow-lg group-hover:shadow-2xl transition-all duration-500"
            />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-border">
              <p className="font-semibold text-foreground">Integrated Mess System</p>
              <p className="text-sm text-muted-foreground">Menu planning, meal tracking, smart rebates, and nutritional management</p>
            </div>
          </div>
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
            <span className="font-medium text-foreground"> Right access, right tools, right time.</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-12">
          {roles.map((role, index) => (
            <div
              key={role.label}
              className="group flex items-center gap-3 px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-card border border-border hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:border-transparent transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`p-2 rounded-lg ${role.color}/20 group-hover:bg-white/20 transition-colors`}>
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
            <Button size="lg" variant="outline" className="gap-2 group">
              View All Features <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
