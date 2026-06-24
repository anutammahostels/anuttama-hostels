import {
  Clock,
  TrendingDown,
  Users,
  ShieldCheck,
  Smartphone,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import studentsImage from "@/assets/students-community.jpg";
import propertyManagerImage from "@/assets/property-manager.jpg";

const benefits = [
  {
    icon: Clock,
    title: "Faster Operations",
    description: "Automated fee runs, payroll, attendance, gate passes and Excel exports reduce manual hostel admin time.",
    stat: "Daily",
    statLabel: "Automation",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingDown,
    title: "Lower Operational Overhead",
    description: "Digital workflows, automated payslips and refund handling cut paperwork at our hostel.",
    stat: "Less",
    statLabel: "Paperwork",
    gradient: "from-secondary to-emerald-500",
  },
  {
    icon: Users,
    title: "Parent Visibility",
    description: "Parents of Anuttama residents stay informed about attendance, meals and gate passes.",
    stat: "Live",
    statLabel: "Updates",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: ShieldCheck,
    title: "Internal Security",
    description: "Role-based access for Anuttama staff and complete audit trails on every action.",
    stat: "RBAC",
    statLabel: "Controlled",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Admins, accountants and residents can access their workspace from any device.",
    stat: "24/7",
    statLabel: "Access",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: HeartHandshake,
    title: "Built In-House",
    description: "Maintained by the Anuttama team to fit our own processes — no external software vendor lock-in.",
    stat: "Internal",
    statLabel: "Maintained",
    gradient: "from-primary to-blue-500",
  },
];

export const Benefits = () => {
  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-64 lg:w-96 h-64 lg:h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 lg:w-64 h-48 lg:h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-10 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-secondary/10 text-secondary text-xs lg:text-sm font-medium mb-3 lg:mb-4">
            <Sparkles className="h-3 w-3 lg:h-4 lg:w-4" />
            Why we built this in-house
          </span>
          <h2 className="text-2xl lg:text-5xl font-bold text-foreground mb-3 lg:mb-4">
            Designed around
            <span className="text-gradient"> Anuttama’s hostel operations</span>
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-xl mx-auto">
            A single workspace shared by every Anuttama-owned hostel.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center mb-10 lg:mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl lg:rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img
              src={studentsImage}
              alt="Anuttama residents in a common room"
              className="relative rounded-xl lg:rounded-3xl shadow-2xl w-full h-56 lg:h-[400px] object-cover border border-border/50 group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

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

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
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

          <div className="relative group order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl lg:rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img
              src={propertyManagerImage}
              alt="Anuttama operations team at work"
              className="relative rounded-xl lg:rounded-3xl shadow-2xl w-full h-48 lg:h-[300px] object-cover border border-border/50 group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
