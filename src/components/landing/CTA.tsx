import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Zap, Clock, Shield, Gift, Star } from "lucide-react";
import { Link } from "react-router-dom";
import campusImage from "@/assets/campus-aerial.jpg";

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
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
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/20 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[100px]" style={{ animationDelay: '2s' }} />
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
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8 animate-fade-in">
            <Gift className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-white/80">
              Limited Time: Get 2 months free on annual plans
            </span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your
            <br />
            <span className="text-gradient">Residential Operations?</span>
          </h2>

          <p className="text-lg lg:text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Join <span className="text-white font-semibold">500+ properties</span> already using Hostylia to 
            <span className="text-secondary"> save 20+ hours weekly</span>, reduce costs by 40%, and delight stakeholders.
          </p>

          {/* Benefits grid */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Clock, label: "7-Day Free Trial", desc: "Full access, no limits" },
              { icon: Shield, label: "No Credit Card", desc: "Start risk-free today" },
              { icon: Zap, label: "Setup in 15 min", desc: "Get started instantly" },
            ].map((benefit) => (
              <div key={benefit.label} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <benefit.icon className="h-6 w-6 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-white">{benefit.label}</p>
                <p className="text-sm text-white/50">{benefit.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/onboarding">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white px-10 py-7 text-lg shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-500 gap-2 rounded-xl group"
              >
                Start Free Trial Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-10 py-7 text-lg transition-all duration-300 gap-2 rounded-xl"
              >
                Schedule a Demo
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-4 pt-8 border-t border-white/10">
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-[hsl(222,47%,6%)] flex items-center justify-center text-white text-xs font-bold"
                >
                  {['RS', 'PM', 'AK', 'SK', 'RJ'][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-white/60">
                <span className="text-white font-semibold">4.9/5</span> from 200+ reviews
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
