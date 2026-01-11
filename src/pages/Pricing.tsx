import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "₹15",
    period: "/student/month",
    description: "Perfect for small hostels and PGs",
    features: ["Up to 100 students", "1 Property", "Basic features", "Email support", "7-day trial"],
    popular: false,
  },
  {
    name: "Professional",
    price: "₹12",
    period: "/student/month",
    description: "For growing institutions",
    features: ["Up to 500 students", "5 Properties", "All features", "Priority support", "API access", "Custom branding"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: ["Unlimited students", "Unlimited properties", "All features", "Dedicated manager", "SLA guarantee", "On-premise option"],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/15 blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 text-secondary" />
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Plans for Every <span className="text-gradient">Institution</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl lg:rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular 
                    ? "bg-gradient-to-b from-primary to-secondary text-white shadow-2xl scale-105" 
                    : "bg-card border border-border hover:shadow-xl hover:border-primary/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-primary text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? "text-white/80" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? "text-white/80" : "text-muted-foreground"}>
                    {plan.period}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className={`h-4 w-4 ${plan.popular ? "text-white" : "text-secondary"}`} />
                      <span className={plan.popular ? "text-white/90" : "text-foreground"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/onboarding">
                  <Button 
                    className={`w-full gap-2 ${
                      plan.popular 
                        ? "bg-white text-primary hover:bg-white/90" 
                        : "bg-gradient-to-r from-primary to-secondary text-white"
                    }`}
                  >
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;