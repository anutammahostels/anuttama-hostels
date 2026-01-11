import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Building2, Users, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { HostyliaLogo } from "@/components/brand/HostyliaLogo";

export const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[hsl(222,47%,6%)]">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[100px]" />
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

      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-32 lg:pt-40 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-sm font-medium text-white/80">
                🎉 7-Day Free Trial — No Credit Card Required
              </span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up leading-tight">
            Smart Residential
            <br />
            <span className="text-gradient">Management Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 animate-slide-up stagger-1 leading-relaxed">
            Enterprise-grade SaaS for hostels, boarding schools, and co-living spaces. 
            Automate operations, ensure compliance, and delight all stakeholders.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up stagger-2">
            <Link to="/onboarding">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 text-lg shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-500 gap-2 rounded-xl"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg transition-all duration-300 gap-2 rounded-xl backdrop-blur-sm"
            >
              <Play className="h-5 w-5 fill-current" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 mb-20 animate-slide-up stagger-3">
            {[
              { icon: CheckCircle2, label: "7-Day Free Trial" },
              { icon: Shield, label: "Enterprise Security" },
              { icon: Users, label: "500+ Properties" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-white/50">
                <item.icon className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="relative animate-scale-in stagger-4">
            {/* Glow behind dashboard */}
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 via-primary/10 to-transparent rounded-3xl blur-3xl" />
            
            {/* Dashboard mockup */}
            <div className="relative rounded-2xl lg:rounded-3xl border border-white/10 bg-[hsl(222,47%,8%)] p-1.5 lg:p-2 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-t-xl lg:rounded-t-2xl border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-7 bg-white/5 rounded-lg max-w-sm mx-auto flex items-center justify-center gap-2 px-4">
                    <div className="w-3 h-3 rounded-full bg-secondary/50" />
                    <span className="text-xs text-white/30">app.hostylia.com/dashboard</span>
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {[
                    { label: "Total Properties", value: "12", trend: "+2 this month", color: "from-primary to-blue-400" },
                    { label: "Occupancy Rate", value: "94%", trend: "↑ 3% from last month", color: "from-secondary to-emerald-400" },
                    { label: "Active Students", value: "1,247", trend: "48 new this week", color: "from-cyan-500 to-teal-400" },
                    { label: "Revenue (MTD)", value: "₹12.4L", trend: "↑ 12% growth", color: "from-orange-500 to-amber-400" },
                  ].map((stat) => (
                    <div 
                      key={stat.label} 
                      className="relative rounded-xl lg:rounded-2xl bg-white/5 p-4 lg:p-5 border border-white/5 hover:border-white/10 transition-colors group overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl`} />
                      <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-xs text-secondary">{stat.trend}</p>
                    </div>
                  ))}
                </div>
                
                {/* Charts area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main chart */}
                  <div className="lg:col-span-2 rounded-xl lg:rounded-2xl bg-white/5 p-4 lg:p-5 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-white/70">Occupancy Trends</p>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">Weekly</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between h-32 lg:h-40 gap-1 lg:gap-2">
                      {[65, 78, 82, 75, 88, 92, 85, 90, 95, 88, 92, 94].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-primary to-secondary transition-all duration-500 hover:opacity-80"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Side widget */}
                  <div className="rounded-xl lg:rounded-2xl bg-white/5 p-4 lg:p-5 border border-white/5">
                    <p className="text-sm font-medium text-white/70 mb-4">Quick Actions</p>
                    <div className="space-y-2">
                      {['Add New Student', 'Generate Invoice', 'View Reports', 'Manage Rooms'].map((action, i) => (
                        <div 
                          key={action}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                          </div>
                          <span className="text-sm text-white/60 group-hover:text-white transition-colors">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};