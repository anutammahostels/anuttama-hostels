import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Building2, Users, Shield, Star, TrendingUp, Clock, Zap, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import heroBuilding from "@/assets/hero-building.jpg";
import { DashboardMockup } from "./DashboardMockup";

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
        <div className="absolute top-20 left-1/4 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] rounded-full bg-primary/20 blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-1/4 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] rounded-full bg-secondary/15 blur-[100px]" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] lg:w-[800px] h-[500px] lg:h-[800px] rounded-full bg-primary/5 blur-[80px]" />
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

      {/* Floating elements - hidden on mobile */}
      <div className="absolute top-32 left-10 hidden xl:block animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Building2 className="h-6 w-6 text-secondary" />
        </div>
      </div>
      <div className="absolute top-48 right-16 hidden xl:block animate-float" style={{ animationDelay: '1s' }}>
        <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="absolute bottom-48 left-20 hidden xl:block animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Shield className="h-6 w-6 text-accent" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-24 lg:pt-32 pb-12 lg:pb-20">
        <div className="max-w-6xl mx-auto">

          {/* Main heading */}
          <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 lg:mb-6 animate-slide-up leading-tight">
            Smart Residential
            <br />
            <span className="text-gradient">Management Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-base lg:text-xl text-white/60 max-w-3xl mx-auto mb-6 lg:mb-8 animate-slide-up stagger-1 leading-relaxed px-2">
            The all-in-one SaaS platform for hostels, boarding schools, and co-living spaces. 
            <span className="text-white/80 font-medium"> Payroll, billing, gate passes, Excel reports — all automated.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4 mb-8 lg:mb-12 animate-slide-up stagger-2">
            <Link to="/onboarding">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white px-6 lg:px-8 py-5 lg:py-6 text-base lg:text-lg shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-500 gap-2 rounded-xl group"
              >
                Get Started
                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 lg:px-8 py-5 lg:py-6 text-base lg:text-lg transition-all duration-300 gap-2 rounded-xl backdrop-blur-sm group"
              >
                Contact Sales
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mb-10 lg:mb-16 animate-slide-up stagger-3">
            {[
              { icon: IndianRupee, label: "₹2/Student/Day" },
              { icon: Shield, label: "Enterprise Secure" },
              { icon: Zap, label: "Excel & PDF Exports" },
              { icon: Star, label: "4.9 Rating" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 lg:gap-2 text-white/50 hover:text-white/80 transition-colors">
                <item.icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-secondary" />
                <span className="text-xs lg:text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Dashboard Preview with floating stats */}
          <div className="relative animate-scale-in stagger-4">
            {/* Floating stat cards */}
            <div className="absolute -top-6 lg:-top-8 left-0 lg:left-8 z-20 p-2 lg:p-4 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float hidden sm:block">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-secondary/20">
                  <TrendingUp className="h-3 w-3 lg:h-5 lg:w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-lg lg:text-2xl font-bold text-white">94%</p>
                  <p className="text-[10px] lg:text-xs text-white/60">Occupancy</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 lg:-top-4 right-0 lg:right-8 z-20 p-2 lg:p-4 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-primary/20">
                  <Clock className="h-3 w-3 lg:h-5 lg:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg lg:text-2xl font-bold text-white">20+ hrs</p>
                  <p className="text-[10px] lg:text-xs text-white/60">Saved/Week</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 lg:bottom-8 -left-2 lg:left-4 z-20 p-2 lg:p-4 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
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
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
