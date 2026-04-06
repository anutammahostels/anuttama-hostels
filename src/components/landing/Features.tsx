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
  CheckCircle2,
  FileSpreadsheet,
  ClipboardList,
  CalendarCheck
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
    title: "Property & Room Management",
    description: "Full hierarchy: Property → Block → Floor → Room → Bed with visual layouts and real-time occupancy.",
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
    title: "Billing, Discounts & Refunds",
    description: "Automated invoicing with discount application, refund processing on student exit, and multi-mode payments.",
    gradient: "from-pink-500 to-rose-500",
    benefits: ["Invoice discounts", "Refund processing", "Payment tracking"],
  },
  {
    icon: Wrench,
    title: "Maintenance Tickets",
    description: "Photo-based reporting with auto-assignment, SLA tracking, escalation rules, and resolution tracking.",
    gradient: "from-cyan-500 to-teal-500",
    benefits: ["Photo uploads", "SLA monitoring", "Vendor management"],
  },
  {
    icon: Wallet,
    title: "Payroll & Payslips",
    description: "Full salary components — HRA, PF, ESI, TDS, incentives. Generate PDF payslips with one click.",
    gradient: "from-emerald-500 to-green-600",
    benefits: ["9+ earning components", "PDF payslips", "Auto-calculations"],
  },
  {
    icon: BarChart3,
    title: "Student Receivables Report",
    description: "Track gross fees, discounts applied, amounts received, and net outstanding per student in real time.",
    gradient: "from-indigo-500 to-blue-600",
    benefits: ["Gross/Net tracking", "Discount analysis", "Outstanding alerts"],
  },
  {
    icon: FileSpreadsheet,
    title: "Excel & PDF Exports",
    description: "Export any data — students, invoices, payroll, attendance — to Excel or PDF with one click.",
    gradient: "from-amber-500 to-orange-600",
    benefits: ["One-click export", "All data pages", "Formatted reports"],
  },
  {
    icon: CalendarCheck,
    title: "Attendance & Admissions",
    description: "Digital attendance with daily marking, LOP tracking, and streamlined admission workflows.",
    gradient: "from-rose-500 to-pink-600",
    benefits: ["Daily attendance", "Admission pipeline", "LOP tracking"],
  },
];

const roles = [
  { icon: Shield, label: "Super Admin", desc: "Platform control", color: "bg-violet-500" },
  { icon: Building2, label: "Hostel Admin", desc: "Property management", color: "bg-primary" },
  { icon: Users, label: "Student", desc: "Self-service", color: "bg-orange-500" },
];

export const Features = () => {
  return (
    <section id="features" className="py-16 lg:py-24 bg-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-secondary/10 text-secondary text-xs lg:text-sm font-medium mb-3 lg:mb-4">
            <Sparkles className="h-3 w-3 lg:h-4 lg:w-4" />
            Comprehensive Features
          </span>
          <h2 className="text-2xl lg:text-5xl font-bold text-foreground mb-3 lg:mb-4">
            Everything for
            <span className="text-gradient"> Modern Residential Management</span>
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg">
            A complete suite of tools — billing, payroll, exports, and more.
            <span className="font-medium text-foreground"> Save 20+ hours weekly </span> with intelligent automation.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-10 lg:mb-20">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl bg-card border border-border p-3 lg:p-5 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`inline-flex p-2 lg:p-2.5 rounded-lg bg-gradient-to-br ${feature.gradient} mb-2 lg:mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                <feature.icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xs lg:text-sm font-semibold text-foreground mb-1 lg:mb-1.5 group-hover:text-primary transition-colors leading-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-[10px] lg:text-xs leading-relaxed mb-2 lg:mb-3 line-clamp-2">
                {feature.description}
              </p>

              {/* Benefits list */}
              <div className="space-y-1">
                {feature.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs">
                    <CheckCircle2 className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-secondary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feature images showcase */}
        <div className="grid grid-cols-2 gap-3 lg:gap-8 mb-10 lg:mb-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl lg:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src={hostelRoomImage} 
              alt="Modern hostel room" 
              className="relative rounded-xl lg:rounded-3xl w-full h-36 lg:h-64 object-cover border border-border shadow-lg group-hover:shadow-2xl transition-all duration-500"
            />
            <div className="absolute bottom-2 left-2 right-2 lg:bottom-4 lg:left-4 lg:right-4 p-2 lg:p-4 rounded-lg lg:rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-border">
              <p className="font-semibold text-foreground text-xs lg:text-base">Smart Room Management</p>
              <p className="text-[10px] lg:text-sm text-muted-foreground line-clamp-1">Visual bed allocation and real-time occupancy</p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl lg:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src={messCafeteriaImage} 
              alt="Hostel mess cafeteria" 
              className="relative rounded-xl lg:rounded-3xl w-full h-36 lg:h-64 object-cover border border-border shadow-lg group-hover:shadow-2xl transition-all duration-500"
            />
            <div className="absolute bottom-2 left-2 right-2 lg:bottom-4 lg:left-4 lg:right-4 p-2 lg:p-4 rounded-lg lg:rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-border">
              <p className="font-semibold text-foreground text-xs lg:text-base">Integrated Mess System</p>
              <p className="text-[10px] lg:text-sm text-muted-foreground line-clamp-1">Menu planning, smart rebates, and nutrition</p>
            </div>
          </div>
        </div>

        {/* Roles section */}
        <div className="text-center mb-6 lg:mb-12">
          <span className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-primary/10 text-primary text-xs lg:text-sm font-medium mb-3 lg:mb-4">
            <Users className="h-3 w-3 lg:h-4 lg:w-4" />
            Role-Based Access
          </span>
          <h2 className="text-xl lg:text-3xl font-bold text-foreground mb-2 lg:mb-3">
            6 Tailored Dashboards
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-xs lg:text-base">
            Each role gets a dedicated interface.
            <span className="font-medium text-foreground"> Right access, right time.</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 lg:gap-3 mb-8 lg:mb-12">
          {roles.map((role, index) => (
            <div
              key={role.label}
              className="group flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl bg-card border border-border hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:border-transparent transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 lg:hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`p-1.5 lg:p-2 rounded-md lg:rounded-lg ${role.color}/20 group-hover:bg-white/20 transition-colors`}>
                <role.icon className="h-3 w-3 lg:h-4 lg:w-4 text-secondary group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground group-hover:text-white transition-colors text-xs lg:text-sm">
                  {role.label}
                </p>
                <p className="text-[10px] lg:text-xs text-muted-foreground group-hover:text-white/70 transition-colors hidden sm:block">
                  {role.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/features">
            <Button size="lg" variant="outline" className="gap-2 group text-sm lg:text-base">
              View All Features <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
