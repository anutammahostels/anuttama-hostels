import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Shield, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary-foreground/90">
              Next-Generation Hostel Management
            </span>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-slide-up">
          Streamline Your
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Student Housing
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          className="text-center text-lg md:text-xl text-primary-foreground/70 max-w-3xl mx-auto mb-12 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          A powerful, policy-driven SaaS platform for managing hostels, boarding schools, 
          and co-living spaces. Automate operations, ensure compliance, and delight stakeholders.
        </p>

        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Button variant="hero" size="xl">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="hero-outline" size="xl">
            Watch Demo
          </Button>
        </div>

        {/* Feature pills */}
        <div 
          className="flex flex-wrap justify-center gap-4 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          {[
            { icon: Building2, label: "Multi-Property" },
            { icon: Shield, label: "Policy Engine" },
            { icon: Zap, label: "Real-time Updates" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <item.icon className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-primary-foreground/80">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Dashboard preview */}
        <div 
          className="mt-20 animate-scale-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl blur-2xl" />
            
            {/* Dashboard mockup */}
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-2 shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-white/5 rounded-md max-w-md mx-auto" />
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Occupancy", value: "94%", color: "bg-blue-500" },
                    { label: "Active Students", value: "1,247", color: "bg-emerald-500" },
                    { label: "Pending Passes", value: "12", color: "bg-amber-500" },
                    { label: "Open Tickets", value: "8", color: "bg-rose-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-white/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                        <span className="text-xs text-white/60">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
                
                {/* Chart placeholder */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 rounded-lg bg-white/5 p-4 h-48">
                    <div className="flex items-end justify-between h-full gap-2 pt-8">
                      {[65, 40, 75, 50, 85, 60, 90, 55, 80, 70, 95, 65].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-blue-400"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-4 h-48">
                    <div className="h-full flex items-center justify-center">
                      <div className="relative w-28 h-28">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="94, 100"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">94%</span>
                        </div>
                      </div>
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
