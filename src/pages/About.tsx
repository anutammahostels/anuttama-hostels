import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Target, Eye, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            About <span className="text-gradient">Hostylia</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Empowering residential institutions with smart, technology-driven management solutions.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-500">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-blue-500 inline-flex mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To simplify residential management through intelligent automation, enabling institutions to focus on what matters most — their students.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-500">
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary to-emerald-500 inline-flex mb-6">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become India's leading residential operating system, powering every hostel, boarding school, and co-living space with cutting-edge technology.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { title: "Trust", desc: "Building reliable systems that institutions can depend on" },
                { title: "Innovation", desc: "Continuously improving with latest technology" },
                { title: "Simplicity", desc: "Making complex operations effortlessly simple" },
              ].map((value) => (
                <div key={value.title} className="p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <h4 className="text-xl font-semibold text-foreground mb-2">{value.title}</h4>
                  <p className="text-muted-foreground text-sm">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;