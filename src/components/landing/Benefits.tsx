import { 
  Clock, 
  TrendingDown, 
  Users, 
  ShieldCheck, 
  Smartphone, 
  HeartHandshake,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import studentsImage from "@/assets/students-community.jpg";
import propertyManagerImage from "@/assets/property-manager.jpg";

const benefits = [
  {
    icon: Clock,
    title: "Save 20+ Hours Weekly",
    description: "Automate billing, attendance, and gate passes. Free your staff for what matters.",
    stat: "20+",
    statLabel: "Hours Saved",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingDown,
    title: "Reduce Costs by 40%",
    description: "Digital workflows eliminate paper, reduce errors, and cut administrative overhead.",
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
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Why Choose Hostylia
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Real Results for
            <span className="text-gradient"> Real Institutions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join 500+ properties that have transformed their operations with measurable outcomes
          </p>
        </div>

        {/* Benefits grid with images */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
          {/* Left - Image */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img 
              src={studentsImage} 
              alt="Happy students in hostel common room" 
              className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover border border-border/50 group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute -bottom-6 -right-6 p-6 rounded-2xl bg-card border border-border shadow-xl animate-float">
              <p className="text-4xl font-bold text-gradient">94%</p>
              <p className="text-sm text-muted-foreground">Student Satisfaction</p>
            </div>
          </div>

          {/* Right - Benefits cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.slice(0, 4).map((benefit, index) => (
              <div 
                key={benefit.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${benefit.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                <div className="pt-3 border-t border-border">
                  <span className="text-2xl font-bold text-gradient">{benefit.stat}</span>
                  <span className="text-xs text-muted-foreground ml-2">{benefit.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second row - reversed */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Benefits cards */}
          <div className="grid sm:grid-cols-2 gap-4 order-2 lg:order-1">
            {benefits.slice(4, 6).map((benefit) => (
              <div 
                key={benefit.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${benefit.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                <div className="pt-3 border-t border-border">
                  <span className="text-2xl font-bold text-gradient">{benefit.stat}</span>
                  <span className="text-xs text-muted-foreground ml-2">{benefit.statLabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right - Image */}
          <div className="relative group order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img 
              src={propertyManagerImage} 
              alt="Property manager using Hostylia" 
              className="relative rounded-3xl shadow-2xl w-full h-[300px] object-cover border border-border/50 group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl bg-card border border-border shadow-xl animate-float" style={{ animationDelay: '1s' }}>
              <p className="text-4xl font-bold text-gradient">4.9/5</p>
              <p className="text-sm text-muted-foreground">Manager Rating</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to="/onboarding">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Start Your Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};
