import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-20 lg:py-28 bg-brand-cream">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
        <h2 className="text-3xl lg:text-5xl font-semibold text-brand-ink tracking-[-0.02em] leading-tight mb-5">
          Ready to run things the calm way?
        </h2>
        <p className="text-base lg:text-lg text-brand-ink-muted max-w-xl mx-auto mb-10">
          Join 500+ properties saving 20+ hours every week with automated
          billing, payroll, and reporting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/onboarding">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-brand text-brand-foreground hover:bg-brand/90 px-7 h-12 text-base font-medium gap-2 rounded-xl shadow-sm group"
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-brand-line bg-white text-brand-ink hover:bg-brand-cream-soft px-7 h-12 text-base font-medium rounded-xl"
            >
              Talk to Sales
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-xs text-brand-ink-muted">
          15-minute setup · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
};
