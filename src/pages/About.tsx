import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { 
  Target, Eye, Users, Award, Heart, Lightbulb, Shield, Zap,
  Building2, Star, ArrowRight, CheckCircle2, Sparkles, Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import studentsImage from "@/assets/students-community.jpg";
import campusImage from "@/assets/campus-aerial.jpg";
import propertyManager from "@/assets/property-manager.jpg";

const values = [
  { 
    icon: Heart, 
    title: "Trust First", 
    desc: "Building reliable systems that institutions can depend on.",
    color: "from-red-500 to-pink-500"
  },
  { 
    icon: Lightbulb, 
    title: "Innovation", 
    desc: "Continuously improving with AI and automation.",
    color: "from-yellow-500 to-orange-500"
  },
  { 
    icon: Shield, 
    title: "Security", 
    desc: "Bank-grade encryption for your data.",
    color: "from-primary to-blue-500"
  },
  { 
    icon: Zap, 
    title: "Simplicity", 
    desc: "Making complex operations effortlessly simple.",
    color: "from-secondary to-emerald-500"
  },
];

const stats = [
  { value: "3,000+", label: "Properties", icon: Building2 },
  { value: "1M+", label: "Students", icon: Users },
  { value: "99.9%", label: "Uptime", icon: Shield },
  { value: "4.9/5", label: "Rating", icon: Star },
];

const milestones = [
  { year: "2021", title: "Founded", desc: "Started with a vision to simplify hostel management" },
  { year: "2022", title: "100 Customers", desc: "Reached our first major milestone" },
  { year: "2023", title: "1M Students", desc: "Managing over a million students across India" },
  { year: "2024", title: "Series A", desc: "Raised funding to accelerate growth" },
];

const team = [
  { name: "Vikas Patel", role: "Founder & CEO", initial: "VP" },
  { name: "Lakshya Saxena", role: "CTO", initial: "LS" },
  { name: "Vitthal Gautam", role: "CPO", initial: "VG" },
  { name: "Zaid Khan", role: "COO", initial: "ZK" },
  { name: "Aayush Saxena", role: "Chief Marketing Head", initial: "AS" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={campusImage} 
            alt="Campus" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,47%,6%)]/90 to-[hsl(222,47%,6%)]" />
        </div>
        <div className="absolute top-20 left-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-primary/15 blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/80 text-xs md:text-sm font-medium mb-4 md:mb-6 animate-slide-down stagger-1">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-secondary" />
              Our Story
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 animate-slide-up stagger-2">
              About <span className="text-gradient">Hostylia</span>
            </h1>
            <p className="text-sm md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto animate-slide-up stagger-3 px-4">
              Empowering residential institutions with smart, technology-driven management solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 md:py-12 bg-gradient-to-r from-primary to-secondary relative -mt-6 md:-mt-10 rounded-t-2xl md:rounded-t-3xl z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-2 md:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <stat.icon className="h-4 w-4 md:h-6 md:w-6 text-white/80 mx-auto mb-1 md:mb-2" />
                <p className="text-lg md:text-3xl lg:text-4xl font-bold text-white mb-0.5 md:mb-1">{stat.value}</p>
                <p className="text-[10px] md:text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image */}
            <div className="relative animate-slide-up order-2 lg:order-1">
              <div className="rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={propertyManager} 
                  alt="Team at work"
                  className="w-full h-48 md:h-80 lg:h-[500px] object-cover"
                />
              </div>
              {/* Floating Card - Hidden on mobile */}
              <div className="hidden md:block absolute -bottom-6 -right-6 bg-card p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-border max-w-xs animate-float">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-secondary/10">
                    <Award className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm md:text-base">Award Winning</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Best PropTech 2024</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-4 md:space-y-8 animate-slide-up order-1 lg:order-2">
              <div className="p-4 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-500">
                <div className="p-3 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-blue-500 inline-flex mb-3 md:mb-6">
                  <Target className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-4">Our Mission</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  To simplify residential management through intelligent automation, enabling institutions to focus on nurturing and caring for their students.
                </p>
              </div>
              
              <div className="p-4 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-500">
                <div className="p-3 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br from-secondary to-emerald-500 inline-flex mb-3 md:mb-6">
                  <Eye className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-4">Our Vision</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  To become India's leading residential operating system, powering every hostel, boarding school, and co-living space with cutting-edge technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs md:text-sm font-medium mb-3 md:mb-4">
              <Heart className="h-3 w-3 md:h-4 md:w-4" />
              What We Stand For
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Our Core <span className="text-gradient">Values</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div 
                key={value.title} 
                className="p-3 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-500 text-center animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={`inline-flex p-2 md:p-4 rounded-lg md:rounded-2xl bg-gradient-to-br ${value.color} mb-2 md:mb-4`}>
                  <value.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <h4 className="text-sm md:text-xl font-bold text-foreground mb-1 md:mb-2">{value.title}</h4>
                <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Our <span className="text-gradient">Journey</span>
            </h2>
          </div>
          
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />
            
            {milestones.map((milestone, index) => (
              <div 
                key={milestone.year}
                className={`relative flex items-start md:items-center gap-4 md:gap-8 mb-6 md:mb-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } animate-slide-up pl-10 md:pl-0`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="p-3 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300">
                    <span className="text-secondary font-bold text-sm md:text-lg">{milestone.year}</span>
                    <h4 className="text-base md:text-xl font-bold text-foreground mb-1 md:mb-2">{milestone.title}</h4>
                    <p className="text-muted-foreground text-xs md:text-sm">{milestone.desc}</p>
                  </div>
                </div>
                <div className="absolute left-2 md:relative md:left-0 w-4 h-4 rounded-full bg-secondary border-4 border-background z-10" />
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-3 md:mb-4">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              Meet the People
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-4">
              Leadership <span className="text-gradient">Team</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              A passionate team dedicated to transforming hostel management
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div 
                key={member.name}
                className="text-center p-3 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-2 md:mb-4 flex items-center justify-center text-white text-sm md:text-lg lg:text-2xl font-bold">
                  {member.initial}
                </div>
                <h4 className="font-bold text-foreground text-xs md:text-sm lg:text-base">{member.name}</h4>
                <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>

          {/* Powered By Section */}
          <div className="mt-8 md:mt-12 text-center p-4 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border max-w-2xl mx-auto">
            <p className="text-xs md:text-sm text-muted-foreground mb-2">Powered by</p>
            <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2">
              Jeevijay Technologies Private Limited
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              A leading tech and marketing firm specializing in AI, Automations, and Digital Solutions
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
                Why Institutions <span className="text-gradient">Choose Us</span>
              </h2>
              <div className="space-y-3 md:space-y-4">
                {[
                  "Built specifically for Indian residential facilities",
                  "Designed with input from 100+ hostel managers",
                  "Continuous updates based on customer feedback",
                  "Local support team that understands your needs",
                  "Affordable pricing that grows with you",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 md:gap-3">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 md:mt-8">
                <Link to="/contact">
                  <Button className="gap-2 bg-gradient-to-r from-primary to-secondary text-sm md:text-base">
                    Get in Touch <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={studentsImage} 
                  alt="Happy students"
                  className="w-full h-48 md:h-80 object-cover"
                />
              </div>
              <div className="hidden md:block absolute -bottom-4 -left-4 bg-card p-3 md:p-4 rounded-lg md:rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-2 md:gap-3">
                  <Globe className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <div>
                    <p className="font-bold text-foreground text-sm md:text-base">Pan-India Presence</p>
                    <p className="text-xs md:text-sm text-muted-foreground">20+ States Covered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-r from-primary to-secondary p-6 md:p-12 lg:p-16 text-center overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
                Ready to Join the Hostylia Family?
              </h2>
              <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto mb-6 md:mb-8">
                Start your free trial today and see the difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link to="/onboarding">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 w-full sm:w-auto text-sm md:text-base">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto text-sm md:text-base">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;