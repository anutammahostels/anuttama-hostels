import { useEffect, useState, useRef } from "react";
import { Building2, Users, Clock, Star, TrendingUp, Globe } from "lucide-react";

const stats = [
  { value: 500, suffix: "+", label: "Properties", description: "Managed across India", icon: Building2 },
  { value: 50, suffix: "K+", label: "Students", description: "Served monthly", icon: Users },
  { value: 99.9, suffix: "%", label: "Uptime", description: "SLA guaranteed", icon: Clock },
  { value: 4.9, suffix: "/5", label: "Rating", description: "Customer satisfaction", icon: Star },
];

const AnimatedCounter = ({ 
  value, 
  suffix, 
  duration = 2000 
}: { 
  value: number; 
  suffix: string; 
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(value * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, value, duration]);

  const displayValue = value >= 100 
    ? Math.floor(count).toLocaleString() 
    : count.toFixed(1);

  return (
    <div ref={ref} className="text-4xl lg:text-5xl font-bold text-gradient">
      {displayValue}{suffix}
    </div>
  );
};

export const Stats = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            Trusted Nationwide
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Numbers That Speak
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Powering residential management for leading institutions across India
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="group relative p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-card border border-border hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-5 w-5 text-secondary" />
              </div>
              
              {/* Counter */}
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              
              {/* Label */}
              <p className="text-foreground font-semibold mt-2">{stat.label}</p>
              <p className="text-muted-foreground text-sm">{stat.description}</p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};