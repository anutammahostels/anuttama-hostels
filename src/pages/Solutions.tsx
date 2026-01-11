import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, GraduationCap, School, BookOpen, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const solutions = [
  {
    icon: Building2,
    title: "Independent Hostels",
    description: "Complete management for standalone hostels and PGs with room allocation, billing, and gate pass systems.",
    features: ["Room & Bed Management", "Automated Billing", "Gate Pass System", "Maintenance Tracking"],
    gradient: "from-primary to-blue-500",
  },
  {
    icon: GraduationCap,
    title: "Boarding Schools",
    description: "Strict policy enforcement for educational boarding facilities with parent communication and attendance tracking.",
    features: ["Policy Engine", "Parent Portal", "Attendance System", "Meal Management"],
    gradient: "from-secondary to-emerald-500",
  },
  {
    icon: School,
    title: "College Hostels",
    description: "Large-scale management for university hostels with multi-block support and comprehensive reporting.",
    features: ["Multi-Block Support", "Student Self-Service", "Fee Management", "Analytics Dashboard"],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: BookOpen,
    title: "Coaching Residential",
    description: "Focused environment management for competitive exam coaching centers with strict schedules.",
    features: ["Curfew Management", "Study Hour Tracking", "Visitor Control", "Performance Monitoring"],
    gradient: "from-orange-500 to-amber-500",
  },
];

const Solutions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6">
              Solutions for Every Property Type
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Built for <span className="text-gradient">Your Facility</span>
            </h1>
            <p className="text-lg text-white/60 mb-8">
              Whether you manage a small hostel or a large boarding school, Hostylia adapts to your unique requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {solutions.map((solution) => (
              <div
                key={solution.title}
                className="group relative rounded-2xl lg:rounded-3xl bg-card border border-border p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/20 overflow-hidden"
              >
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`} />
                
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${solution.gradient} mb-6`}>
                  <solution.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-3">{solution.title}</h3>
                <p className="text-muted-foreground mb-6">{solution.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {solution.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link to="/onboarding">
                  <Button className="w-full gap-2 bg-gradient-to-r from-primary to-secondary">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Solutions;