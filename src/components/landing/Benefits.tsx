import { 
  Clock, 
  TrendingDown, 
  Users, 
  ShieldCheck, 
  Smartphone, 
  HeartHandshake,
} from "lucide-react";
import studentsImage from "@/assets/students-community.jpg";
import propertyManagerImage from "@/assets/property-manager.jpg";
import propertyManagerImage from "@/assets/property-manager.jpg";

const benefits = [
  {
    icon: Clock,
    title: "Save 20+ Hours Weekly",
    description: "Automate payroll, billing, attendance, gate passes, and Excel exports.",
    stat: "20+",
    statLabel: "Hours Saved",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingDown,
    title: "Reduce Costs by 40%",
    description: "Digital workflows, automated payslips, and refund processing cut overhead.",
    stat: "40%",
    statLabel: "Cost Reduction",
    gradient: "from-secondary to-emerald-500",
  },
  {
    icon: Users,
    title: "100% Parent Visibility",
    description: "Real-time updates on attendance, meals, and gate passes. Build trust with transparency.",
    stat: "100%",
    statLabel: "Transparency",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description: "Bank-grade encryption, role-based access, and complete audit trails.",
    stat: "99.9%",
    statLabel: "Uptime SLA",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Full functionality on any device. Students, parents, and staff can access from anywhere.",
    stat: "24/7",
    statLabel: "Access",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Support",
    description: "Onboarding assistance, training, and priority support. We're with you every step.",
    stat: "<2hr",
    statLabel: "Response Time",
    gradient: "from-primary to-blue-500",
  },
];

export const Benefits = () => {
  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-64 lg:w-96 h-64 lg:h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 lg:w-64 h-48 lg:h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-secondary/10 text-secondary text-xs lg:text-sm font-medium mb-3 lg:mb-4">
            <Sparkles className="h-3 w-3 lg:h-4 lg:w-4" />
            Why Choose Anuttama
          </span>
          <h2 className="text-2xl lg:text-5xl font-bold text-foreground mb-3 lg:mb-4">
            Real Results for
            <span className="text-gradient"> Real Institutions</span>
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-xl mx-auto">
            Join 500+ properties that have transformed their operations
          </p>
        </div>

        {/* Benefits grid with images */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center mb-10 lg:mb-16">
          {/* Left - Image */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl lg:rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img 
              src={studentsImage} 
              alt="Happy students in hostel common room" 
              className="relative rounded-xl lg:rounded-3xl shadow-2xl w-full h-56 lg:h-[400px] object-cover border border-border/50 group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute -bottom-4 -right-2 lg:-bottom-6 lg:-right-6 p-3 lg:p-6 rounded-xl lg:rounded-2xl bg-card border border-border shadow-xl animate-float">
              <p className="text-2xl lg:text-4xl font-bold text-gradient">94%</p>
              <p className="text-xs lg:text-sm text-muted-foreground">Satisfaction</p>
            </div>
          </div>

          {/* Right - Benefits cards */}
          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            {benefits.slice(0, 4).map((benefit) => (
              <div 
                key={benefit.title}
                className="group p-3 lg:p-6 rounded-lg lg:rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 lg:hover:-translate-y-1"
              >
                <div className={`inline-flex p-2 lg:p-3 rounded-lg lg:rounded-xl bg-gradient-to-br ${benefit.gradient} mb-2 lg:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-3 w-3 lg:h-5 lg:w-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-xs lg:text-base mb-1 lg:mb-2 line-clamp-1">{benefit.title}</h3>
                <p className="text-[10px] lg:text-sm text-muted-foreground mb-2 lg:mb-3 line-clamp-2">{benefit.description}</p>
                <div className="pt-2 lg:pt-3 border-t border-border">
                  <span className="text-lg lg:text-2xl font-bold text-gradient">{benefit.stat}</span>
                  <span className="text-[9px] lg:text-xs text-muted-foreground ml-1 lg:ml-2">{benefit.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second row - reversed */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left - Benefits cards */}
          <div className="grid grid-cols-2 gap-2 lg:gap-4 order-2 lg:order-1">
            {benefits.slice(4, 6).map((benefit) => (
              <div 
                key={benefit.title}
                className="group p-3 lg:p-6 rounded-lg lg:rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 lg:hover:-translate-y-1"
              >
                <div className={`inline-flex p-2 lg:p-3 rounded-lg lg:rounded-xl bg-gradient-to-br ${benefit.gradient} mb-2 lg:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-3 w-3 lg:h-5 lg:w-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-xs lg:text-base mb-1 lg:mb-2 line-clamp-1">{benefit.title}</h3>
                <p className="text-[10px] lg:text-sm text-muted-foreground mb-2 lg:mb-3 line-clamp-2">{benefit.description}</p>
                <div className="pt-2 lg:pt-3 border-t border-border">
                  <span className="text-lg lg:text-2xl font-bold text-gradient">{benefit.stat}</span>
                  <span className="text-[9px] lg:text-xs text-muted-foreground ml-1 lg:ml-2">{benefit.statLabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right - Image */}
          <div className="relative group order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl lg:rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img 
              src={propertyManagerImage} 
              alt="Property manager using Hostylia" 
              className="relative rounded-xl lg:rounded-3xl shadow-2xl w-full h-48 lg:h-[300px] object-cover border border-border/50 group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute -bottom-4 -left-2 lg:-bottom-6 lg:-left-6 p-3 lg:p-6 rounded-xl lg:rounded-2xl bg-card border border-border shadow-xl animate-float" style={{ animationDelay: '1s' }}>
              <p className="text-2xl lg:text-4xl font-bold text-gradient">4.9/5</p>
              <p className="text-xs lg:text-sm text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
