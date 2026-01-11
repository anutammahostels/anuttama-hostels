import { Building2, GraduationCap, School, Landmark, Award, Shield } from "lucide-react";

const brands = [
  { name: "Sunrise Schools", icon: GraduationCap },
  { name: "Phoenix Living", icon: Building2 },
  { name: "National Universities", icon: School },
  { name: "Premier Hostels", icon: Landmark },
  { name: "Elite Residences", icon: Award },
  { name: "SafeStay Network", icon: Shield },
];

export const TrustedBy = () => {
  return (
    <section className="py-16 bg-muted/30 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-center text-muted-foreground text-sm font-medium mb-8 uppercase tracking-wider">
          Trusted by Leading Institutions Across India
        </p>
        
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-muted/30 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-muted/30 to-transparent z-10" />
          
          {/* Scrolling logos */}
          <div className="flex gap-12 animate-scroll">
            {[...brands, ...brands].map((brand, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-background border border-border/50 whitespace-nowrap hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <brand.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
