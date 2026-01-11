import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Building2, Users, Shield, Zap, Star, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import heroBuilding from "@/assets/hero-building.jpg";
import dashboardIllustration from "@/assets/dashboard-illustration.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[hsl(222,47%,6%)]">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBuilding} 
          alt="Modern hostel building" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,47%,6%)]/80 to-[hsl(222,47%,6%)]" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[100px]" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[80px]" />
      </div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating elements */}
      <div className="absolute top-32 left-10 hidden lg:block animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Building2 className="h-8 w-8 text-secondary" />
        </div>
      </div>
      <div className="absolute top-48 right-16 hidden lg:block animate-float" style={{ animationDelay: '1s' }}>
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="absolute bottom-48 left-20 hidden lg:block animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Shield className="h-8 w-8 text-accent" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-32 lg:pt-40 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors cursor-default group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-sm font-medium text-white/80">
                🎉 7-Day Free Trial — No Credit Card Required
              </span>
              <ArrowRight className="h-4 w-4 text-white/50 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up leading-tight">
            Smart Residential
            <br />
            <span className="text-gradient">Management Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-8 animate-slide-up stagger-1 leading-relaxed">
            The all-in-one SaaS platform for hostels, boarding schools, and co-living spaces. 
            <span className="text-white/80 font-medium"> Automate operations, ensure compliance, and delight all stakeholders </span>
            — from students to parents to management.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up stagger-2">
            <Link to="/onboarding">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 text-lg shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-500 gap-2 rounded-xl group"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg transition-all duration-300 gap-2 rounded-xl backdrop-blur-sm group"
            >
              <Play className="h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
              Watch Demo (2 min)
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 mb-16 animate-slide-up stagger-3">
            {[
              { icon: CheckCircle2, label: "7-Day Free Trial" },
              { icon: Shield, label: "Enterprise Security" },
              { icon: Users, label: "500+ Properties" },
              { icon: Star, label: "4.9/5 Rating" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors">
                <item.icon className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Dashboard Preview with floating stats */}
          <div className="relative animate-scale-in stagger-4">
            {/* Floating stat cards */}
            <div className="absolute -top-8 -left-4 lg:left-8 z-20 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float hidden md:block">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/20">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">94%</p>
                  <p className="text-xs text-white/60">Occupancy Rate</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 lg:right-8 z-20 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float hidden md:block" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">20+ hrs</p>
                  <p className="text-xs text-white/60">Saved Weekly</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 -left-4 lg:left-4 z-20 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/20">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">99.9%</p>
                  <p className="text-xs text-white/60">Uptime SLA</p>
                </div>
              </div>
            </div>

            {/* Glow behind dashboard */}
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 via-primary/10 to-transparent rounded-3xl blur-3xl" />
            
            {/* Dashboard mockup */}
            <div className="relative rounded-2xl lg:rounded-3xl border border-white/10 bg-[hsl(222,47%,8%)] p-1.5 lg:p-2 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-t-xl lg:rounded-t-2xl border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                  <div className="w-3 h-3 rounded-full bg-green-400/50" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-7 bg-white/5 rounded-lg max-w-sm mx-auto flex items-center justify-center gap-2 px-4">
                    <div className="w-3 h-3 rounded-full bg-secondary/50" />
                    <span className="text-xs text-white/30">app.hostylia.com/dashboard</span>
                  </div>
                </div>
              </div>
              
              {/* Dashboard illustration */}
              <div className="relative">
                <img 
                  src={dashboardIllustration} 
                  alt="Hostylia Dashboard Interface" 
                  className="w-full h-auto rounded-b-xl lg:rounded-b-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,47%,8%)] via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
