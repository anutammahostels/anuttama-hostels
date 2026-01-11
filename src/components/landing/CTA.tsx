import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Zap, Clock, Shield, Gift, Star } from "lucide-react";
import { Link } from "react-router-dom";
import campusImage from "@/assets/campus-aerial.jpg";

export const CTA = () => {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src={campusImage} 
          alt="Campus aerial view" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[hsl(222,47%,6%)]/90" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[250px] lg:w-[400px] h-[250px] lg:h-[400px] rounded-full bg-primary/20 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] rounded-full bg-secondary/15 blur-[100px]" style={{ animationDelay: '2s' }} />
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

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 lg:px-5 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6 lg:mb-8 animate-fade-in">
            <Gift className="h-3 w-3 lg:h-4 lg:w-4 text-secondary" />
            <span className="text-xs lg:text-sm font-medium text-white/80">
              Get 2 months free on annual plans
            </span>
            <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400" />
          </div>

          <h2 className="text-2xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight">
            Ready to Transform Your
            <br />
            <span className="text-gradient">Operations?</span>
          </h2>

          <p className="text-sm lg:text-xl text-white/60 mb-6 lg:mb-10 max-w-2xl mx-auto">
            Join <span className="text-white font-semibold">500+ properties</span> saving 
            <span className="text-secondary"> 20+ hours weekly</span>.
          </p>

          {/* Benefits grid */}
          <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-6 lg:mb-10">
            {[
              { icon: Clock, label: "7-Day Trial", desc: "Full access" },
              { icon: Shield, label: "No Card", desc: "Risk-free" },
              { icon: Zap, label: "15 min Setup", desc: "Start instantly" },
            ].map((benefit) => (
              <div key={benefit.label} className="p-2 lg:p-4 rounded-lg lg:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <benefit.icon className="h-4 w-4 lg:h-6 lg:w-6 text-secondary mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-white text-xs lg:text-base">{benefit.label}</p>
                <p className="text-[10px] lg:text-sm text-white/50 hidden sm:block">{benefit.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4 mb-6 lg:mb-8">
            <Link to="/onboarding">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white px-6 lg:px-10 py-5 lg:py-7 text-sm lg:text-lg shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-500 gap-2 rounded-xl group"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 lg:px-10 py-5 lg:py-7 text-sm lg:text-lg transition-all duration-300 rounded-xl"
              >
                Schedule Demo
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 lg:gap-4 pt-6 lg:pt-8 border-t border-white/10">
            <div className="flex -space-x-2 lg:-space-x-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-7 h-7 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-[hsl(222,47%,6%)] flex items-center justify-center text-white text-[8px] lg:text-xs font-bold"
                >
                  {['RS', 'PM', 'AK', 'SK', 'RJ'][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5 lg:gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs lg:text-sm text-white/60">
                <span className="text-white font-semibold">4.9/5</span> · 200+ reviews
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
