import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Building2, GraduationCap, School } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Dr. Raghav Sharma",
    role: "Director",
    organization: "Sunrise Boarding School",
    location: "Jaipur, Rajasthan",
    image: null,
    rating: 5,
    quote: "Hostylia transformed how we manage our 800-student facility. Parent satisfaction increased by 40% within 3 months. The gate pass system alone saved us 15 hours per week in manual paperwork.",
    stats: { students: 800, savings: "15 hrs/week", satisfaction: "+40%" },
    icon: GraduationCap,
  },
  {
    id: 2,
    name: "Priya Menon",
    role: "Operations Head",
    organization: "Phoenix Co-Living",
    location: "Bangalore, Karnataka",
    image: null,
    rating: 5,
    quote: "We manage 12 properties with over 2000 beds. Before Hostylia, we needed 8 staff members for billing alone. Now 2 people handle everything with the automated invoicing system.",
    stats: { properties: 12, beds: 2000, staffReduction: "75%" },
    icon: Building2,
  },
  {
    id: 3,
    name: "Prof. Anand Kumar",
    role: "Hostel Warden",
    organization: "National Engineering College",
    location: "Chennai, Tamil Nadu",
    image: null,
    rating: 5,
    quote: "The real-time attendance and curfew tracking gives me complete peace of mind. Parents love the instant notifications. We've achieved 99.8% compliance with hostel rules since implementing Hostylia.",
    stats: { compliance: "99.8%", response: "< 2 min", parentRating: "4.9/5" },
    icon: School,
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[activeIndex];

  return (
    <section className="py-24 bg-[hsl(222,47%,6%)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[100px]" />
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
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-4 animate-fade-in">
            <Star className="h-4 w-4 text-secondary fill-secondary" />
            Trusted by 500+ Properties
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 animate-slide-up">
            Success Stories from
            <br />
            <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto animate-slide-up stagger-1">
            See how institutions across India are transforming their operations with Hostylia
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div 
            className={`relative rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 lg:p-12 transition-all duration-500 ${
              isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* Quote icon */}
            <div className="absolute -top-6 left-8 p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg animate-scale-in">
              <Quote className="h-6 w-6 text-white" />
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl lg:text-2xl text-white leading-relaxed mb-8 font-light">
              "{current.quote}"
            </blockquote>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-xl bg-white/5">
              {Object.entries(current.stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-bold text-gradient">{value}</p>
                  <p className="text-xs text-white/50 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <current.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{current.name}</p>
                  <p className="text-sm text-white/60">{current.role}, {current.organization}</p>
                  <p className="text-xs text-secondary">{current.location}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAnimating(true);
                  setActiveIndex(i);
                  setTimeout(() => setIsAnimating(false), 500);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex 
                    ? 'w-8 bg-gradient-to-r from-primary to-secondary' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
