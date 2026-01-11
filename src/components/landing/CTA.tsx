import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary/30 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-white/90">
              Start your free 7-day trial today
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Residential Operations?
            </span>
          </h2>

          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto animate-slide-up stagger-1">
            Join 500+ properties already using Hostylia to streamline their 
            operations, improve compliance, and delight stakeholders.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-slide-up stagger-2">
            {[
              "7-Day Free Trial",
              "No Credit Card Required",
              "Cancel Anytime",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-white/80">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
            <Link to="/onboarding">
              <Button 
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-pulse-glow"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
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