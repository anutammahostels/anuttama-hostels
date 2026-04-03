import { 
  Building2, QrCode, UtensilsCrossed, Receipt, Wrench, Settings2, 
  Users, Bell, BarChart3, Wallet, UserCheck, ArrowRight, Check,
  Sparkles, Shield, Zap, Clock, Star, TrendingUp, Award, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import dashboardImage from "@/assets/dashboard-illustration.png";
import hostelRoom from "@/assets/hostel-room.jpg";
import messCafeteria from "@/assets/mess-cafeteria.jpg";
import studentsImage from "@/assets/students-community.jpg";

const heroFeatures = [
  { icon: Zap, text: "Setup in 10 minutes" },
  { icon: Shield, text: "Bank-grade security" },
  { icon: Clock, text: "24/7 reliability" },
];

const mainFeatures = [
  {
    category: "Property Management",
    icon: Building2,
    tagline: "Complete control over your entire property",
    description: "Manage rooms, beds, blocks, and floors with an intuitive visual interface. Track occupancy in real-time and optimize allocation.",
    items: ["Multi-property support", "Block & floor hierarchy", "Room & bed management", "Visual occupancy grid", "Asset tracking", "Condition documentation"],
    image: hostelRoom,
    stats: { value: "70%", label: "Less admin time" },
    gradient: "from-primary to-blue-500",
  },
  {
    category: "Gate Pass System",
    icon: QrCode,
    tagline: "Smart entry/exit with QR codes",
    description: "Digitize your gate pass process with QR codes, approval workflows, and real-time tracking. Parents get instant notifications.",
    items: ["QR-based passes", "Approval workflows", "Real-time tracking", "Curfew alerts", "Parent notifications", "Security scanning"],
    image: studentsImage,
    stats: { value: "100%", label: "Digital records" },
    gradient: "from-secondary to-emerald-500",
  },
  {
    category: "Mess Management",
    icon: UtensilsCrossed,
    tagline: "Streamline your mess operations",
    description: "Plan menus, track nutrition, handle absences, and automate rebates. Give students visibility into daily meals.",
    items: ["Weekly menu planning", "Nutritional tracking", "Absence marking", "Smart rebate system", "Meal reports", "Vendor management"],
    image: messCafeteria,
    stats: { value: "₹50K", label: "Saved monthly" },
    gradient: "from-orange-500 to-amber-500",
  },
  {
    category: "Billing & Finance",
    icon: Receipt,
    tagline: "Automated invoicing & collections",
    description: "Generate invoices automatically, send reminders, accept multiple payment modes, and track every transaction.",
    items: ["Automated invoicing", "Multiple payment modes", "Sub-metering", "Late fee management", "Receipt generation", "Financial reports"],
    image: dashboardImage,
    stats: { value: "0", label: "Billing errors" },
    gradient: "from-violet-500 to-purple-600",
  },
];

const additionalFeatures = [
  {
    icon: Wrench,
    title: "Maintenance Tracking",
    desc: "Photo-based tickets, auto-assignment, SLA tracking, and vendor coordination",
  },
  {
    icon: Settings2,
    title: "Policy Engine",
    desc: "Custom rules, dynamic module activation, block-level settings, and compliance tracking",
  },
  {
    icon: Users,
    title: "Parent Portal",
    desc: "Real-time updates, leave approvals, fee payments, and communication",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "SMS, email, WhatsApp, and in-app alerts for all stakeholders",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Occupancy trends, fee collection, attendance patterns, and custom reports",
  },
  {
    icon: UserCheck,
    title: "Attendance System",
    desc: "Biometric integration, manual marking, reports, and absence alerts",
  },
];

const testimonials = [
  {
    quote: "The gate pass system alone saved us 5 hours every day. Security loves the QR scanning.",
    author: "Rakesh Verma",
    role: "Security Head",
    company: "DPS Boarding School",
    rating: 5,
  },
  {
    quote: "Finally, a billing system that actually works. No more Excel nightmares!",
    author: "Anita Patel",
    role: "Accounts Manager",
    company: "City PG for Women",
    rating: 5,
  },
];

const FeaturesPage = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={dashboardImage} 
            alt="Dashboard" 
            className="w-full h-full object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,47%,6%)]/90 to-[hsl(222,47%,6%)]" />
        </div>
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[80px]" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6 animate-slide-down stagger-1">
            <Settings2 className="h-4 w-4 text-secondary" />
            Complete Feature Set
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-slide-up stagger-2">
            Powerful <span className="text-gradient">Features</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8 animate-slide-up stagger-3">
            Everything you need to manage residential facilities efficiently and professionally. Built by hostel managers, for hostel managers.
          </p>
          
          {/* Hero Features */}
          <div className="flex flex-wrap justify-center gap-6 animate-slide-up stagger-4">
            {heroFeatures.map((feature) => (
              <div key={feature.text} className="flex items-center gap-2 text-white/70">
                <feature.icon className="h-5 w-5 text-secondary" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features - Alternating Layout */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-32">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.category}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                  index % 2 === 1 ? "" : ""
                }`}
              >
                {/* Content */}
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""} animate-slide-up`}>
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <span className="text-secondary font-medium text-sm mb-2 block">{feature.tagline}</span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{feature.category}</h2>
                  <p className="text-muted-foreground text-lg mb-6">{feature.description}</p>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {feature.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link to="/onboarding">
                      <Button className="gap-2 bg-gradient-to-r from-primary to-secondary">
                        Try This Feature <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="gap-2">
                      <Play className="h-4 w-4" /> Watch Demo
                    </Button>
                  </div>
                </div>
                
                {/* Image Card */}
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""} animate-slide-up`}>
                  <div className="relative group">
                    <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                      <img 
                        src={feature.image} 
                        alt={feature.category}
                        className="w-full h-80 lg:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Stat Badge */}
                      <div className="absolute bottom-6 left-6">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg">
                          <p className="text-3xl font-bold text-foreground">{feature.stats.value}</p>
                          <p className="text-sm text-muted-foreground">{feature.stats.label}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Badge */}
                    <div className={`absolute -top-4 -right-4 bg-gradient-to-r ${feature.gradient} text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg`}>
                      <Sparkles className="h-4 w-4 inline mr-1" /> Popular
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Award className="h-4 w-4" />
              And Much More
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Additional <span className="text-gradient">Capabilities</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary inline-flex mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              What Our Users <span className="text-gradient">Say</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.author}
                className="p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-500 animate-slide-up"
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

      {/* Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient">Anuttama</span>?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Manual/Excel", items: ["Hours of data entry", "Prone to errors", "No real-time updates", "Lost paperwork"], bad: true },
              { title: "Generic Software", items: ["Not built for hostels", "Complex setup", "Limited customization", "Poor support"], bad: true },
              { title: "Hostylia", items: ["10-minute setup", "Zero errors", "Real-time everything", "24/7 support"], bad: false },
            ].map((col, index) => (
              <div 
                key={col.title}
                className={`p-6 rounded-2xl border ${
                  col.bad 
                    ? "bg-card border-border" 
                    : "bg-gradient-to-b from-primary to-secondary text-white border-transparent"
                } animate-slide-up`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <h4 className={`font-bold text-lg mb-4 ${col.bad ? "text-foreground" : "text-white"}`}>
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      {col.bad ? (
                        <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-xs">✕</span>
                      ) : (
                        <Check className="h-4 w-4 text-white" />
                      )}
                      <span className={col.bad ? "text-muted-foreground" : "text-white/90"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 lg:p-16 text-center overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Experience These Features?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Start your free 7-day trial. No credit card required. Full access to all features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/onboarding">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
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

export default FeaturesPage;