import { Button } from "@/components/ui/button";
import { 
  Check, ArrowRight, Sparkles, Shield, Zap, HeadphonesIcon, Clock, 
  Building2, Users, Star, Award, TrendingUp, Lock, Gift
} from "lucide-react";
import { Link } from "react-router-dom";
import campusImage from "@/assets/campus-aerial.jpg";

const plans = [
  {
    name: "Starter",
    price: "₹15",
    period: "/student/month",
    description: "Perfect for small hostels and PGs up to 100 students",
    features: [
      "Up to 100 students",
      "1 Property",
      "Room & Bed Management",
      "Basic Gate Pass System",
      "Email support",
      "7-day free trial",
    ],
    popular: false,
    icon: Building2,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Professional",
    price: "₹12",
    period: "/student/month",
    description: "For growing institutions that need more power",
    features: [
      "Up to 500 students",
      "5 Properties",
      "All Starter features",
      "Mess Management",
      "Billing & Invoicing",
      "Priority support",
      "API access",
      "Custom branding",
    ],
    popular: true,
    icon: TrendingUp,
    gradient: "from-primary to-secondary",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with complex requirements",
    features: [
      "Unlimited students",
      "Unlimited properties",
      "All Professional features",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise option",
      "Custom integrations",
      "Training & onboarding",
    ],
    popular: false,
    icon: Award,
    gradient: "from-violet-500 to-purple-600",
  },
];

const guarantees = [
  { icon: Shield, title: "Money-Back Guarantee", desc: "30-day no questions asked refund" },
  { icon: Lock, title: "Data Security", desc: "Bank-grade encryption for all data" },
  { icon: Clock, title: "99.9% Uptime", desc: "Reliable service you can count on" },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "We're here whenever you need us" },
];

const faqs = [
  { q: "Can I switch plans anytime?", a: "Yes! Upgrade or downgrade anytime. Changes reflect immediately." },
  { q: "Is there a setup fee?", a: "No setup fees, ever. Pay only for what you use." },
  { q: "What payment methods do you accept?", a: "UPI, cards, net banking, and bank transfers for enterprises." },
  { q: "Can I get a demo first?", a: "Absolutely! Book a free demo and we'll walk you through everything." },
];

const testimonials = [
  {
    quote: "Switching to the Professional plan saved us 15 hours per week on admin tasks.",
    author: "Priya Sharma",
    role: "Hostel Manager",
    company: "Sunrise PG",
    rating: 5,
  },
  {
    quote: "The pricing is transparent and the value we get is incredible.",
    author: "Rajesh Kumar",
    role: "Director",
    company: "Elite Boarding School",
    rating: 5,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={campusImage} 
            alt="Campus" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,47%,6%)]/90 to-[hsl(222,47%,6%)]" />
        </div>
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px]" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6 animate-slide-down stagger-1">
            <Sparkles className="h-4 w-4 text-secondary" />
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-slide-up stagger-2">
            Plans for Every <span className="text-gradient">Institution</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-8 animate-slide-up stagger-3">
            Start free, scale as you grow. No hidden fees, no surprises. Cancel anytime.
          </p>
          
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 animate-slide-up stagger-4">
            <div className="flex items-center gap-2 text-white/60">
              <Gift className="h-5 w-5 text-secondary" />
              <span className="text-sm">7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Shield className="h-5 w-5 text-secondary" />
              <span className="text-sm">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Zap className="h-5 w-5 text-secondary" />
              <span className="text-sm">Setup in 10 Minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`group relative rounded-2xl lg:rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 animate-slide-up ${
                  plan.popular 
                    ? "bg-gradient-to-b from-primary to-secondary text-white shadow-2xl md:scale-105 z-10" 
                    : "bg-card border border-border hover:shadow-xl hover:border-primary/20"
                }`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-primary text-sm font-semibold shadow-lg flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </div>
                )}
                
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} mb-4`}>
                  <plan.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? "text-white/80" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? "text-white/80" : "text-muted-foreground"}>
                    {plan.period}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-white" : "text-secondary"}`} />
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
                    size="lg"
                  >
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {guarantees.map((item, index) => (
              <div 
                key={item.title} 
                className="text-center group animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="inline-flex p-3 rounded-2xl bg-secondary/10 mb-4 group-hover:bg-secondary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Trusted by <span className="text-gradient">500+</span> Institutions
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join hundreds of hostels and boarding schools who trust Hostylia
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.author}
                className="p-8 rounded-2xl bg-card border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={faq.q}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 lg:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Hostel?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Join 500+ institutions already using Hostylia. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/onboarding">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;