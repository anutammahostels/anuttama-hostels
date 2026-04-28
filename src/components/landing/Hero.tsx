import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Star, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardMockup } from "./DashboardMockup";

const trustItems = [
  { icon: IndianRupee, label: "₹2 / student / day" },
  { icon: Shield, label: "Enterprise secure" },
  { icon: Zap, label: "Excel & PDF exports" },
  { icon: Star, label: "4.9 rating" },
];

export const Hero = () => {
  return (
    <section className="relative bg-brand-cream pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden">
      {/* Single, very subtle warm wash — replaces orbs/grid/floats */}
      <div
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(var(--brand) / 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Eyebrow pill */}
        <div className="flex justify-center mb-6 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-line bg-white text-xs font-medium text-brand-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            Smart Residential Management
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-semibold text-brand-ink leading-[1.05] tracking-[-0.03em] mb-5 lg:mb-6 max-w-4xl mx-auto animate-slide-up">
          Run your hostel like a{" "}
          <span className="relative inline-block">
            <span className="relative z-10">modern</span>
            <span className="absolute left-0 right-0 bottom-1 h-[0.35em] bg-brand/25 -z-0 rounded-sm" />
          </span>{" "}
          operation.
        </h1>

        {/* Subtitle */}
        <p className="text-center text-base lg:text-lg text-brand-ink-muted max-w-2xl mx-auto mb-8 lg:mb-10 leading-relaxed animate-slide-up stagger-1">
          One quiet, dependable platform for billing, payroll, gate passes,
          attendance, and reports — built for hostels, boarding schools, and
          co-living spaces.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 lg:mb-14 animate-slide-up stagger-2">
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
              Contact Sales
            </Button>
          </Link>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-12 lg:mb-16 animate-fade-in stagger-3">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm text-brand-ink-muted"
            >
              <item.icon className="h-4 w-4 text-brand" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Dashboard preview — quiet frame, no floating chips */}
        <div className="relative animate-scale-in stagger-4">
          <div className="rounded-2xl border border-brand-line bg-white p-2 shadow-[0_24px_60px_-30px_hsl(28_45%_22%/0.25)]">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
