import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { 
  Building2, QrCode, UtensilsCrossed, Receipt, Wrench, Shield, Settings2, 
  Users, Bell, BarChart3, Wallet, UserCheck, ArrowRight, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const allFeatures = [
  {
    category: "Property Management",
    icon: Building2,
    items: ["Multi-property support", "Block & floor hierarchy", "Room & bed management", "Visual occupancy grid", "Asset tracking", "Condition documentation"]
  },
  {
    category: "Gate Pass System",
    icon: QrCode,
    items: ["QR-based passes", "Approval workflows", "Real-time tracking", "Curfew alerts", "Parent notifications", "Security scanning"]
  },
  {
    category: "Mess Management",
    icon: UtensilsCrossed,
    items: ["Weekly menu planning", "Nutritional tracking", "Absence marking", "Smart rebate system", "Meal reports", "Vendor management"]
  },
  {
    category: "Billing & Finance",
    icon: Receipt,
    items: ["Automated invoicing", "Multiple payment modes", "Sub-metering", "Late fee management", "Receipt generation", "Financial reports"]
  },
  {
    category: "Maintenance",
    icon: Wrench,
    items: ["Photo-based tickets", "Auto-assignment", "SLA tracking", "Escalation rules", "Vendor coordination", "Resolution tracking"]
  },
  {
    category: "Policy Engine",
    icon: Settings2,
    items: ["Custom rule configuration", "Dynamic module activation", "Block-level settings", "Automated workflows", "Compliance tracking", "Audit trails"]
  },
];

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6">
            <Settings2 className="h-4 w-4" />
            Complete Feature Set
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Powerful <span className="text-gradient">Features</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to manage residential facilities efficiently and professionally.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFeatures.map((feature) => (
              <div
                key={feature.category}
                className="group p-8 rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-500"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary inline-flex mb-5">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{feature.category}</h3>
                <ul className="space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-secondary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="text-center mt-16">
            <Link to="/onboarding">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;