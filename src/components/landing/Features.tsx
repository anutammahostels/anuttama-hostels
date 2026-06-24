import {
  Building2,
  QrCode,
  UtensilsCrossed,
  Receipt,
  Wrench,
  Shield,
  Users,
  BarChart3,
  Settings2,
  Wallet,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  CalendarCheck,
} from "lucide-react";
import hostelRoomImage from "@/assets/hostel-room.jpg";
import messCafeteriaImage from "@/assets/mess-cafeteria.jpg";

const features = [
  {
    icon: Settings2,
    title: "Hostel Policy Configuration",
    description: "Internal configuration for curfews, devices, visitors, and house rules at each Anuttama-owned hostel.",
    gradient: "from-violet-500 to-purple-600",
    benefits: ["Per-hostel rules", "Auto-enforcement", "Audit trails"],
  },
  {
    icon: Building2,
    title: "Property & Room Records",
    description: "Hostel → Block → Floor → Room → Bed structure for every Anuttama location with live occupancy.",
    gradient: "from-primary to-blue-500",
    benefits: ["Visual bed grids", "Allocation tools", "Condition tracking"],
  },
  {
    icon: QrCode,
    title: "Gate Pass Management",
    description: "Internal gate pass workflow for residents — QR approvals, curfew alerts, and parent notifications.",
    gradient: "from-secondary to-emerald-500",
    benefits: ["QR scanning", "Approval flow", "Auto-alerts"],
  },
  {
    icon: UtensilsCrossed,
    title: "Mess Management",
    description: "Weekly menus, absence marking, and rebate calculation for in-house mess operations.",
    gradient: "from-orange-500 to-amber-500",
    benefits: ["Menu planning", "Rebate automation", "Attendance"],
  },
  {
    icon: Receipt,
    title: "Hostel Fee & Payment Tracking",
    description: "Internal invoicing, discount handling, refund processing on resident exit, and payment ledgers.",
    gradient: "from-pink-500 to-rose-500",
    benefits: ["Fee invoices", "Refund processing", "Payment tracking"],
  },
  {
    icon: Wrench,
    title: "Maintenance Workflow",
    description: "Photo-based maintenance reporting with assignment, SLA tracking and resolution logs.",
    gradient: "from-cyan-500 to-teal-500",
    benefits: ["Photo uploads", "SLA monitoring", "Vendor logs"],
  },
  {
    icon: Wallet,
    title: "Staff Payroll & Payslips",
    description: "Salary components for Anuttama staff — HRA, PF, ESI, TDS — with PDF payslip generation.",
    gradient: "from-emerald-500 to-green-600",
    benefits: ["Statutory components", "PDF payslips", "Auto-calculations"],
  },
  {
    icon: BarChart3,
    title: "Receivables Tracking",
    description: "Track gross fees, discounts, amounts received and net outstanding per resident in real time.",
    gradient: "from-indigo-500 to-blue-600",
    benefits: ["Gross/Net view", "Discount logs", "Outstanding alerts"],
  },
  {
    icon: FileSpreadsheet,
    title: "Excel & PDF Exports",
    description: "Export internal data — residents, invoices, payroll, attendance — to Excel or PDF for records.",
    gradient: "from-amber-500 to-orange-600",
    benefits: ["One-click export", "All operations data", "Formatted reports"],
  },
  {
    icon: CalendarCheck,
    title: "Attendance & Admissions",
    description: "Digital attendance with daily marking, LOP tracking, and Anuttama admission intake.",
    gradient: "from-rose-500 to-pink-600",
    benefits: ["Daily attendance", "Admission pipeline", "LOP tracking"],
  },
];

const roles = [
  { icon: Shield, label: "Super Admin", desc: "Anuttama HQ", color: "bg-violet-500" },
  { icon: Building2, label: "Hostel Admin", desc: "Per location", color: "bg-primary" },
  { icon: Users, label: "Resident", desc: "Self-service", color: "bg-orange-500" },
];

export const Features = () => {
  return (
    <section id="features" className="py-16 lg:py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-10 lg:mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-secondary/10 text-secondary text-xs lg:text-sm font-medium mb-3 lg:mb-4">
            <Sparkles className="h-3 w-3 lg:h-4 lg:w-4" />
            Internal Capabilities
          </span>
          <h2 className="text-2xl lg:text-5xl font-bold text-foreground mb-3 lg:mb-4">
            What our staff use to
            <span className="text-gradient"> run Anuttama Hostels</span>
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg">
            A consolidated workspace for Anuttama’s internal teams — operations and accounts —
            <span className="font-medium text-foreground"> built for our own hostel only.</span>
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-10 lg:mb-20">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl bg-card border border-border p-3 lg:p-5 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 overflow-hidden"
            >
              <div className={`absolute -top-16 -right-16 w-32 h-32 bg-[#29926A] ${feature.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
              <div className={`inline-flex p-2 lg:p-2.5 rounded-lg bg-[#29926A] ${feature.gradient} mb-2 lg:mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                <feature.icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-white" />
              </div>
              <h3 className="text-xs lg:text-sm font-semibold text-foreground mb-1 lg:mb-1.5 group-hover:text-primary transition-colors leading-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-[10px] lg:text-xs leading-relaxed mb-2 lg:mb-3 line-clamp-2">
                {feature.description}
              </p>
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

        <div className="grid grid-cols-2 gap-3 lg:gap-8 mb-10 lg:mb-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#29926A] rounded-xl lg:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={hostelRoomImage}
              alt="Anuttama hostel room"
              className="relative rounded-xl lg:rounded-3xl w-full h-36 lg:h-64 object-cover border border-border shadow-lg group-hover:shadow-2xl transition-all duration-500"
            />
            <div className="absolute bottom-2 left-2 right-2 lg:bottom-4 lg:left-4 lg:right-4 p-2 lg:p-4 rounded-lg lg:rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-border">
              <p className="font-semibold text-foreground text-xs lg:text-base">Room Records</p>
              <p className="text-[10px] lg:text-sm text-muted-foreground line-clamp-1">Visual bed allocation across Anuttama locations</p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-[#29926A] rounded-xl lg:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={messCafeteriaImage}
              alt="Anuttama hostel mess"
              className="relative rounded-xl lg:rounded-3xl w-full h-36 lg:h-64 object-cover border border-border shadow-lg group-hover:shadow-2xl transition-all duration-500"
            />
            <div className="absolute bottom-2 left-2 right-2 lg:bottom-4 lg:left-4 lg:right-4 p-2 lg:p-4 rounded-lg lg:rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-border">
              <p className="font-semibold text-foreground text-xs lg:text-base">In-house Mess Operations</p>
              <p className="text-[10px] lg:text-sm text-muted-foreground line-clamp-1">Menu planning and rebate calculation</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-6 lg:mb-12">
          <span className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-primary/10 text-primary text-xs lg:text-sm font-medium mb-3 lg:mb-4">
            <Users className="h-3 w-3 lg:h-4 lg:w-4" />
            Role-Based Access
          </span>
          <h2 className="text-xl lg:text-3xl font-bold text-foreground mb-2 lg:mb-3">
            3 Internal Workspaces
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-xs lg:text-base">
            Each internal role gets a dedicated workspace.
            <span className="font-medium text-foreground"> Right access, right people.</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 lg:gap-3 mb-8 lg:mb-12">
          {roles.map((role, index) => (
            <div
              key={role.label}
              className="group flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl bg-card border border-border hover:bg-[#29926A] hover:border-transparent transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 lg:hover:-translate-y-1"
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
      </div>
    </section>
  );
};
