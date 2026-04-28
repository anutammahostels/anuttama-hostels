import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Building2, GraduationCap, School } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Dr. Raghav Sharma",
    role: "Director",
    organization: "Sunrise Boarding School",
    location: "Jaipur, Rajasthan",
    rating: 5,
    quote:
      "Anuttama transformed how we manage our 800-student facility. Parent satisfaction increased by 40% within three months. The gate pass system alone saved us 15 hours per week in manual paperwork.",
    icon: GraduationCap,
  },
  {
    id: 2,
    name: "Priya Menon",
    role: "Operations Head",
    organization: "Phoenix Co-Living",
    location: "Bangalore, Karnataka",
    rating: 5,
    quote:
      "We manage 12 properties with over 2,000 beds. Before Anuttama we needed eight staff for billing alone — now two people handle everything with the automated invoicing system.",
    icon: Building2,
  },
  {
    id: 3,
    name: "Prof. Anand Kumar",
    role: "Hostel Warden",
    organization: "National Engineering College",
    location: "Chennai, Tamil Nadu",
    rating: 5,
    quote:
      "Real-time attendance and curfew tracking gives me complete peace of mind. Parents love the instant notifications. We've achieved 99.8% compliance with hostel rules since switching.",
    icon: School,
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () =>
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const handleNext = () =>
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    const interval = setInterval(handleNext, 7000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[activeIndex];

  return (
    <section className="py-20 lg:py-28 bg-white border-y border-brand-line">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="mb-10">
          <span className="text-xs font-medium tracking-wider uppercase text-brand">
            Trusted by 500+ properties
          </span>
          <h2 className="mt-3 text-3xl lg:text-5xl font-semibold text-brand-ink tracking-[-0.02em] leading-tight">
            What operators say.
          </h2>
        </div>

        <div className="rounded-2xl border border-brand-line bg-brand-cream/40 p-6 lg:p-10">
          <div className="flex gap-1 mb-5">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-brand fill-brand" />
            ))}
          </div>

          <blockquote className="text-lg lg:text-2xl text-brand-ink leading-relaxed font-medium tracking-[-0.01em] mb-8">
            "{current.quote}"
          </blockquote>

          <div className="flex items-center justify-between gap-4 pt-6 border-t border-brand-line">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                <current.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-brand-ink text-sm truncate">
                  {current.name}
                </p>
                <p className="text-xs text-brand-ink-muted truncate">
                  {current.role}, {current.organization}
                </p>
                <p className="text-xs text-brand mt-0.5 truncate">{current.location}</p>
              </div>
            </div>

            <div className="flex gap-1.5 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                className="rounded-full border-brand-line bg-white text-brand-ink hover:bg-brand-cream-soft h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="rounded-full border-brand-line bg-white text-brand-ink hover:bg-brand-cream-soft h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-brand" : "w-1.5 bg-brand-line hover:bg-brand/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
