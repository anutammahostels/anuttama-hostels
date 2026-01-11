import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[hsl(222,47%,6%)]">
      {/* Gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[100px]" />
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
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-white/80">
              Start your free 7-day trial today
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your
            <br />
            <span className="text-gradient">Residential Operations?</span>
          </h2>

          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
            Join 500+ properties already using Hostylia to streamline operations and delight stakeholders.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {["7-Day Free Trial", "No Credit Card", "Cancel Anytime"].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/onboarding">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 text-lg shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-500 gap-2 rounded-xl"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg transition-all duration-300 gap-2 rounded-xl"
              >
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};