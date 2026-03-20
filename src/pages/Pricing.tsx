import { Button } from "@/components/ui/button";
import { 
  Check, ArrowRight, Sparkles, Shield, Zap, HeadphonesIcon, Clock, 
  Building2, Star, Award, Lock, IndianRupee, Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import campusImage from "@/assets/campus-aerial.jpg";

const growthFeatures = [
  "Unlimited Students",
  "Up to 5 Properties",
  "Property & Room Management",
  "Digital Gate Pass with QR",
  "Mess Management & Rebates",
  "Billing, Discounts & Refunds",
  "Maintenance Tickets",
  "Payroll & PDF Payslips",
  "Student Receivables Report",
  "Excel & PDF Exports",
  "Attendance & Admissions",
  "Student Self-Service Portal",
  "Parent Monitoring Portal",
  "Role-Based Access (6 roles)",
  "Email & Chat Support",
];

const enterpriseFeatures = [
  "Everything in Growth",
  "Unlimited Properties",
  "Custom Integrations",
  "Dedicated Account Manager",
  "SLA Guarantee (99.9%)",
  "On-Premise Deployment Option",
  "Priority 24/7 Support",
  "Training & Onboarding",
  "Custom Branding",
  "API Access",
];

const guarantees = [
  { icon: Shield, title: "Data Security", desc: "Bank-grade encryption for all data" },
  { icon: Lock, title: "99.9% Uptime", desc: "Reliable service you can count on" },
  { icon: HeadphonesIcon, title: "Dedicated Support", desc: "We're here whenever you need us" },
  { icon: Zap, title: "15 Min Setup", desc: "Get started in minutes, not days" },
];

const faqs = [
  { q: "How is billing calculated?", a: "You're charged ₹2 per active student per day. If you have 100 students, that's just ₹200/day or ~₹6,000/month." },
  { q: "Can I switch to Enterprise anytime?", a: "Yes! Contact our sales team and we'll migrate you seamlessly with zero downtime." },
  { q: "What payment methods do you accept?", a: "UPI, cards, net banking, and bank transfers for enterprise accounts." },
  { q: "Is there a minimum commitment?", a: "No long-term contracts. Pay monthly and cancel anytime." },
  { q: "Can I get a demo first?", a: "Absolutely! Book a free demo and we'll walk you through everything." },
  { q: "What's included in the Growth plan?", a: "Everything — payroll, billing, gate passes, mess, maintenance, exports, and all 6 role dashboards." },
];

const Pricing = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 lg:pt-32 pb-16 lg:pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
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
          <span className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-white/5 text-white/80 text-xs lg:text-sm font-medium mb-4 lg:mb-6">
            <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-secondary" />
            Simple, Transparent Pricing
          </span>
          <h1 className="text-3xl lg:text-6xl font-bold text-white mb-4 lg:mb-6">
            One Plan. <span className="text-gradient">All Features.</span>
          </h1>
          <p className="text-sm lg:text-lg text-white/60 max-w-xl mx-auto mb-6 lg:mb-8">
            No hidden fees, no feature gating. Get everything at ₹2/student/day.
          </p>
          
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-white/60">
              <IndianRupee className="h-4 w-4 lg:h-5 lg:w-5 text-secondary" />
              <span className="text-xs lg:text-sm">₹2/Student/Day</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-secondary" />
              <span className="text-xs lg:text-sm">No Long-Term Contracts</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Zap className="h-4 w-4 lg:h-5 lg:w-5 text-secondary" />
              <span className="text-xs lg:text-sm">Setup in 15 Minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 lg:py-20 -mt-8 lg:-mt-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4 lg:gap-8 max-w-5xl mx-auto">
            {/* Growth Plan */}
            <div className="relative rounded-2xl lg:rounded-3xl bg-card border-2 border-secondary/50 p-6 lg:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/10 hover:-translate-y-1">
              {/* Most Popular badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-secondary to-emerald-500 text-white text-xs lg:text-sm font-semibold shadow-lg flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-current" />
                Most Popular
              </div>

              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-secondary to-emerald-500">
                  <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground">Growth</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">For all institutions</p>
                </div>
              </div>

              <div className="mb-4 lg:mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-6xl font-bold text-foreground">₹2</span>
                  <span className="text-muted-foreground text-sm lg:text-base">/student/day</span>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                  ~₹60/student/month • Billed monthly
                </p>
              </div>

              <Link to="/onboarding">
                <Button 
                  className="w-full gap-2 bg-gradient-to-r from-secondary to-emerald-500 text-white hover:opacity-90 mb-6 lg:mb-8 py-5 lg:py-6 text-sm lg:text-base"
                  size="lg"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 lg:mb-4">Everything included:</p>
              <ul className="space-y-2 lg:space-y-3">
                {growthFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 lg:gap-3 text-xs lg:text-sm">
                    <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4 mt-0.5 flex-shrink-0 text-secondary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="relative rounded-2xl lg:rounded-3xl bg-gradient-to-b from-[hsl(222,47%,11%)] to-[hsl(222,47%,8%)] border border-white/10 p-6 lg:p-10 text-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Crown className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold">Enterprise</h3>
                  <p className="text-xs lg:text-sm text-white/60">For large organizations</p>
                </div>
              </div>

              <div className="mb-4 lg:mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-6xl font-bold">Custom</span>
                </div>
                <p className="text-xs lg:text-sm text-white/50 mt-1">
                  Tailored to your scale & requirements
                </p>
              </div>

              <Link to="/contact">
                <Button 
                  className="w-full gap-2 bg-white text-foreground hover:bg-white/90 mb-6 lg:mb-8 py-5 lg:py-6 text-sm lg:text-base"
                  size="lg"
                >
                  Contact Sales <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <p className="text-xs font-semibold uppercase tracking-wider mb-3 lg:mb-4 text-white/70">Everything in Growth, plus:</p>
              <ul className="space-y-2 lg:space-y-3">
                {enterpriseFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 lg:gap-3 text-xs lg:text-sm">
                    <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4 mt-0.5 flex-shrink-0 text-violet-400" />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {guarantees.map((item) => (
              <div key={item.title} className="text-center group">
                <div className="inline-flex p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-secondary/10 mb-3 lg:mb-4 group-hover:bg-secondary/20 transition-colors">
                  <item.icon className="h-5 w-5 lg:h-6 lg:w-6 text-secondary" />
                </div>
                <h4 className="font-semibold text-foreground text-xs lg:text-sm mb-1">{item.title}</h4>
                <p className="text-[10px] lg:text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3 lg:gap-6 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div 
                key={faq.q}
                className="p-4 lg:p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300"
              >
                <h4 className="font-semibold text-foreground mb-1.5 lg:mb-2 text-sm lg:text-base">{faq.q}</h4>
                <p className="text-muted-foreground text-xs lg:text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-2xl lg:rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 lg:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative z-10">
              <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3 lg:mb-4">
                Ready to Transform Your Hostel?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-6 lg:mb-8 text-sm lg:text-base">
                Join 500+ institutions already using Hostylia. Starting at just ₹2/student/day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
                <Link to="/onboarding">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 gap-2 text-sm lg:text-base">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-sm lg:text-base">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
