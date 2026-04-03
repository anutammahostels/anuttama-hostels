import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Building2, GraduationCap, School, BookOpen, CheckCircle2,
  Users, Shield, Clock, Star, TrendingUp, Award, Sparkles, Play
} from "lucide-react";
import { Link } from "react-router-dom";
import hostelRoom from "@/assets/hostel-room.jpg";
import studentsImage from "@/assets/students-community.jpg";
import campusImage from "@/assets/campus-aerial.jpg";
import messCafeteria from "@/assets/mess-cafeteria.jpg";

const solutions = [
  {
    icon: Building2,
    title: "Independent Hostels & PGs",
    description: "Complete management for standalone hostels and paying guest accommodations. Streamline room allocation, automate billing, and manage gate passes with ease.",
    features: ["Room & Bed Management", "Automated Billing & Invoicing", "QR-Based Gate Pass System", "Maintenance Ticket Tracking", "Visitor Management", "Parent Communication"],
    benefits: ["Reduce admin work by 70%", "Zero billing errors", "Complete transparency"],
    gradient: "from-primary to-blue-500",
    image: hostelRoom,
    stats: { value: "2,500+", label: "Hostels using Anuttama" },
  },
  {
    icon: GraduationCap,
    title: "Boarding Schools",
    description: "Strict policy enforcement for educational boarding facilities. Keep parents informed, track attendance, and ensure student safety with our comprehensive system.",
    features: ["Custom Policy Engine", "Real-time Parent Portal", "Biometric Attendance", "Meal Plan Management", "Leave & Outing Approvals", "Academic Integration"],
    benefits: ["Parents stay connected", "100% policy compliance", "Student safety assured"],
    gradient: "from-secondary to-emerald-500",
    image: studentsImage,
    stats: { value: "500+", label: "Schools trust us" },
  },
  {
    icon: School,
    title: "College & University Hostels",
    description: "Large-scale management for university hostels with multi-block support, student self-service portals, and comprehensive analytics for administration.",
    features: ["Multi-Block Architecture", "Student Self-Service App", "Fee Management & Receipts", "Advanced Analytics", "Warden Dashboard", "Alumni Integration"],
    benefits: ["Handle 10,000+ students", "Self-service reduces queries", "Data-driven decisions"],
    gradient: "from-violet-500 to-purple-600",
    image: campusImage,
    stats: { value: "1M+", label: "Students managed" },
  },
  {
    icon: BookOpen,
    title: "Coaching Residential Facilities",
    description: "Focused environment management for competitive exam coaching centers. Maintain strict schedules, control distractions, and monitor student progress.",
    features: ["Study Hour Tracking", "Strict Curfew Management", "Visitor Time Limits", "Performance Dashboard", "Focus Mode Alerts", "Parent Reports"],
    benefits: ["Boost focus & results", "Eliminate distractions", "Track improvement"],
    gradient: "from-orange-500 to-amber-500",
    image: messCafeteria,
    stats: { value: "98%", label: "Recommend us" },
  },
];

const caseStudies = [
  {
    title: "Sunrise Hostel reduced admin time by 80%",
    description: "With 200+ students, manual management was overwhelming. Hostylia automated their entire workflow.",
    metrics: ["80% less paperwork", "₹2L saved annually", "Zero billing disputes"],
  },
  {
    title: "Elite Boarding School improved parent satisfaction",
    description: "Parents were always anxious about their children. Real-time updates changed everything.",
    metrics: ["99% parent satisfaction", "50% fewer phone calls", "Instant leave approvals"],
  },
];

const Solutions = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={studentsImage} 
            alt="Students" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,47%,6%)]/90 to-[hsl(222,47%,6%)]" />
        </div>
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[80px]" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6 animate-slide-down stagger-1">
              <Sparkles className="h-4 w-4 text-secondary" />
              Solutions for Every Property Type
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-slide-up stagger-2">
              Built for <span className="text-gradient">Your Facility</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 animate-slide-up stagger-3">
              Whether you manage a small hostel or a large boarding school, Hostylia adapts to your unique requirements with industry-specific features.
            </p>
            
            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 lg:gap-16 animate-slide-up stagger-4">
              {[
                { icon: Building2, value: "3,000+", label: "Properties" },
                { icon: Users, value: "1M+", label: "Students" },
                { icon: Star, value: "4.9/5", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="h-5 w-5 text-secondary" />
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-sm text-white/50">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-20">
            {solutions.map((solution, index) => (
              <div
                key={solution.title}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""} animate-slide-up`}>
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${solution.gradient} mb-6`}>
                    <solution.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{solution.title}</h2>
                  <p className="text-muted-foreground text-lg mb-6">{solution.description}</p>
                  
                  {/* Benefits */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {solution.benefits.map((benefit) => (
                      <span 
                        key={benefit}
                        className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {solution.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link to="/onboarding">
                      <Button className="gap-2 bg-gradient-to-r from-primary to-secondary">
                        Get Started <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/features">
                      <Button variant="outline" className="gap-2">
                        <Play className="h-4 w-4" /> Watch Demo
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Image Card */}
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""} animate-slide-up`}>
                  <div className="relative group">
                    <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                      <img 
                        src={solution.image} 
                        alt={solution.title}
                        className="w-full h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Stat Badge */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-3xl font-bold text-foreground">{solution.stats.value}</p>
                              <p className="text-sm text-muted-foreground">{solution.stats.label}</p>
                            </div>
                            <div className="flex -space-x-2">
                              {[1,2,3,4].map((i) => (
                                <div 
                                  key={i}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                                >
                                  {String.fromCharCode(64 + i)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 bg-secondary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-float">
                      <TrendingUp className="h-4 w-4 inline mr-1" /> Popular Choice
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Award className="h-4 w-4" />
              Success Stories
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Real Results from <span className="text-gradient">Real Institutions</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {caseStudies.map((study, index) => (
              <div 
                key={study.title}
                className="p-8 rounded-2xl bg-card border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <h3 className="text-xl font-bold text-foreground mb-3">{study.title}</h3>
                <p className="text-muted-foreground mb-6">{study.description}</p>
                <div className="flex flex-wrap gap-2">
                  {study.metrics.map((metric) => (
                    <span 
                      key={metric}
                      className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 lg:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <img src={campusImage} alt="" className="w-full h-full object-cover" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Not Sure Which Solution Fits?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Book a free consultation with our team. We'll help you find the perfect setup for your facility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                    Book Free Consultation <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Solutions;