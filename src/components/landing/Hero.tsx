import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Users, Shield, TrendingUp, Clock, Zap, ClipboardList } from "lucide-react";
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
          alt="An Anuttama Hostels residence building"
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
          <div className="flex justify-center mb-4 animate-slide-down">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium">
              <ClipboardList className="h-3.5 w-3.5 text-secondary" />
              Internal Operations Platform · Anuttama Hostels
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 lg:mb-6 animate-slide-up leading-tight">
            Anuttama Hostels
            <br />
            <span className="text-gradient">Operations Workspace</span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-base lg:text-xl text-white/60 max-w-3xl mx-auto mb-6 lg:mb-8 animate-slide-up stagger-1 leading-relaxed px-2">
            Anuttama Hostels owns and operates its hostel. This is our dedicated internal workspace used by our staff to run
            <span className="text-white/80 font-medium"> resident records, fee collections, mess, gate passes and day-to-day operations.</span>
          </p>

          <p className="text-center text-xs lg:text-sm text-white/40 max-w-2xl mx-auto mb-6 lg:mb-8 animate-slide-up stagger-1 px-2">
            This platform is developed exclusively for Anuttama-owned hostel operations and is not offered as a public software service.
          </p>


          {/* Internal capability indicators */}
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mb-10 lg:mb-16 animate-slide-up stagger-3">
            {[
              { icon: Users, label: "Resident Records" },
              { icon: Shield, label: "Internal Use Only" },
              { icon: Zap, label: "Operational Reports" },
              { icon: ClipboardList, label: "Anuttama Owned & Operated" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 lg:gap-2 text-white/50 hover:text-white/80 transition-colors">
                <item.icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-secondary" />
                <span className="text-xs lg:text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Dashboard Preview with floating stats */}
          <div className="relative animate-scale-in stagger-4">
            <div className="absolute -top-6 lg:-top-8 left-0 lg:left-8 z-20 p-2 lg:p-4 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float hidden sm:block">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-secondary/20">
                  <TrendingUp className="h-3 w-3 lg:h-5 lg:w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-lg lg:text-2xl font-bold text-white">Live</p>
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
                  <p className="text-lg lg:text-2xl font-bold text-white">24/7</p>
                  <p className="text-[10px] lg:text-xs text-white/60">Operations</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 lg:bottom-8 -left-2 lg:left-4 z-20 p-2 lg:p-4 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/20">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Internal</p>
                  <p className="text-xs text-white/60">Workflow</p>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 via-primary/10 to-transparent rounded-3xl blur-3xl" />
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
