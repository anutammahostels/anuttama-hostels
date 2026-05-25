import { Button } from "@/components/ui/button";
import {
  Target, Eye, Heart, Lightbulb, Shield, Zap,
  Building2, ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import studentsImage from "@/assets/students-community.jpg";
import campusImage from "@/assets/campus-aerial.jpg";
import propertyManager from "@/assets/property-manager.jpg";

const values = [
  { icon: Heart, title: "Resident Care", desc: "Everything we build is for the wellbeing of Anuttama residents.", color: "from-red-500 to-pink-500" },
  { icon: Lightbulb, title: "Practical Tools", desc: "Built around how our operations team actually works.", color: "from-yellow-500 to-orange-500" },
  { icon: Shield, title: "Internal Security", desc: "Role-based access and audit logs across every action.", color: "from-primary to-blue-500" },
  { icon: Zap, title: "Operational Simplicity", desc: "Daily operations made effortless for our staff.", color: "from-secondary to-emerald-500" },
];

const About = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={campusImage} alt="Anuttama campus" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,47%,6%)]/90 to-[hsl(222,47%,6%)]" />
        </div>
        <div className="absolute top-20 left-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-primary/15 blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/80 text-xs md:text-sm font-medium mb-4 md:mb-6 animate-slide-down stagger-1">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-secondary" />
              About Anuttama Hostels
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 animate-slide-up stagger-2">
              We run our own <span className="text-gradient">hostel</span>
            </h1>
            <p className="text-sm md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto animate-slide-up stagger-3 px-4">
              Anuttama Hostels owns and operates its hostel.
              This platform is our internal operations workspace — not a software product offered to others.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative animate-slide-up order-2 lg:order-1">
              <div className="rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                <img src={propertyManager} alt="Anuttama operations team" className="w-full h-48 md:h-80 lg:h-[500px] object-cover" />
              </div>
            </div>

            <div className="space-y-4 md:space-y-8 animate-slide-up order-1 lg:order-2">
              <div className="p-4 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-500">
                <div className="p-3 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-blue-500 inline-flex mb-3 md:mb-6">
                  <Target className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-4">What we do</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Anuttama Hostels owns and operates its hostel. Our team handles resident admissions, room allocation,
                  fee collection, mess operations, gate passes, maintenance and day-to-day administration.
                </p>
              </div>

              <div className="p-4 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-500">
                <div className="p-3 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br from-secondary to-emerald-500 inline-flex mb-3 md:mb-6">
                  <Eye className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-4">Why this platform exists</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  We built this internal workspace to consolidate all hostel operations in one place. It is used exclusively by Anuttama staff and residents and is not offered as a public software service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs md:text-sm font-medium mb-3 md:mb-4">
              <Heart className="h-3 w-3 md:h-4 md:w-4" />
              What we care about
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Operating <span className="text-gradient">Principles</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="p-3 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-500 text-center animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={`inline-flex p-2 md:p-4 rounded-lg md:rounded-2xl bg-gradient-to-br ${value.color} mb-2 md:mb-4`}>
                  <value.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <h4 className="text-sm md:text-xl font-bold text-foreground mb-1 md:mb-2">{value.title}</h4>
                <p className="text-muted-foreground text-xs md:text-sm line-clamp-3">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal use notice */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
                A platform <span className="text-gradient">for Anuttama, by Anuttama</span>
              </h2>
              <div className="space-y-3 md:space-y-4">
                {[
                  "Used exclusively by Anuttama Hostels staff and residents",
                  "Not offered as a SaaS product or to any third-party hostel",
                  "Built to fit Anuttama’s own admission and fee processes",
                  "Maintained by our in-house team",
                  "All data belongs to Anuttama operations",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 md:gap-3">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 md:mt-8">
                <Link to="/contact">
                  <Button className="gap-2 bg-gradient-to-r from-primary to-secondary text-sm md:text-base">
                    Contact Anuttama <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
                <img src={studentsImage} alt="Anuttama residents" className="w-full h-48 md:h-80 object-cover" />
              </div>
              <div className="hidden md:block absolute -bottom-4 -left-4 bg-card p-3 md:p-4 rounded-lg md:rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-2 md:gap-3">
                  <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <div>
                    <p className="font-bold text-foreground text-sm md:text-base">Owned & Operated</p>
                    <p className="text-xs md:text-sm text-muted-foreground">By Anuttama Hostels</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
