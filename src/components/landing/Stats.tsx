import { useEffect, useState, useRef } from "react";
import { Building2, Users, Clock, Star } from "lucide-react";

const stats = [
  { value: 500, suffix: "+", label: "Properties Managed", icon: Building2 },
  { value: 50, suffix: "K+", label: "Students Served", icon: Users },
  { value: 99.9, suffix: "%", label: "Uptime SLA", icon: Clock },
  { value: 4.9, suffix: "/5", label: "Customer Rating", icon: Star },
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
      
      // Easing function for smooth animation
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
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-gradient">
      {displayValue}{suffix}
    </div>
  );
};

export const Stats = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4 animate-fade-in">
            Trusted by Institutions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground animate-slide-up">
            Numbers That Speak
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="relative group text-center p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="inline-flex p-3 rounded-xl bg-secondary/10 mb-4 group-hover:bg-secondary/20 transition-colors">
                <stat.icon className="h-6 w-6 text-secondary" />
              </div>
              
              {/* Counter */}
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              
              {/* Label */}
              <div className="text-muted-foreground text-sm md:text-base mt-2">
                {stat.label}
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};