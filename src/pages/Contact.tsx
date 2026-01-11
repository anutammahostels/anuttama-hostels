import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, Phone, MapPin, Send, Clock, MessageSquare, Headphones, 
  CheckCircle2, Star, Users, ArrowRight, Sparkles, Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import campusImage from "@/assets/campus-aerial.jpg";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    desc: "We'll respond within 24 hours",
    value: "contact@hostylia.com",
    href: "mailto:contact@hostylia.com",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Phone,
    title: "Call Us",
    desc: "Mon-Sat, 9am to 6pm IST",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    desc: "Available on the dashboard",
    value: "Start a conversation",
    href: "#",
    color: "bg-accent/10 text-accent",
  },
];

const offices = [
  {
    city: "Bangalore",
    address: "123 Tech Park, Koramangala, Bangalore 560034",
    type: "Headquarters",
  },
  {
    city: "Mumbai",
    address: "456 Business Hub, Andheri East, Mumbai 400069",
    type: "Sales Office",
  },
  {
    city: "Delhi",
    address: "789 Corporate Tower, Connaught Place, Delhi 110001",
    type: "Regional Office",
  },
];

const faqs = [
  { q: "How quickly can I get started?", a: "Most customers are up and running within 10 minutes. Our onboarding is designed to be quick and painless." },
  { q: "Do you offer on-site training?", a: "Yes! For Enterprise customers, we provide comprehensive on-site training for your staff." },
  { q: "Can I import my existing data?", a: "Absolutely. We support bulk import from Excel and can help migrate from other systems." },
  { q: "Is my data secure?", a: "100%. We use bank-grade encryption and are SOC 2 compliant. Your data never leaves India." },
];

const Contact = () => {
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
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6 animate-slide-down stagger-1">
              <Sparkles className="h-4 w-4 text-secondary" />
              We're Here to Help
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-slide-up stagger-2">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 animate-slide-up stagger-3">
              Have questions about Hostylia? Want to see a demo? Our team is ready to help you transform your hostel management.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 animate-slide-up stagger-4">
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="h-5 w-5 text-secondary" />
                <span className="text-sm">&lt; 24hr Response Time</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Headphones className="h-5 w-5 text-secondary" />
                <span className="text-sm">Dedicated Support</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Star className="h-5 w-5 text-secondary" />
                <span className="text-sm">4.9/5 Customer Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 -mt-10 relative z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <a
                key={method.title}
                href={method.href}
                className="group p-6 rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 text-center animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={`inline-flex p-4 rounded-2xl ${method.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <method.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{method.desc}</p>
                <p className="text-sm font-medium text-primary">{method.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <div className="p-8 lg:p-10 rounded-2xl lg:rounded-3xl bg-card border border-border shadow-lg animate-slide-up">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Send us a message</h2>
                <p className="text-muted-foreground">Fill out the form and we'll get back to you within 24 hours.</p>
              </div>
              
              <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Your Name *</label>
                    <Input placeholder="John Doe" className="h-12" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email Address *</label>
                    <Input placeholder="john@example.com" type="email" className="h-12" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Organization Name</label>
                  <Input placeholder="Your Hostel / Institution" className="h-12" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Phone Number</label>
                    <Input placeholder="+91 98765 43210" type="tel" className="h-12" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Number of Students</label>
                    <Input placeholder="e.g., 200" type="number" className="h-12" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">How can we help? *</label>
                  <Textarea placeholder="Tell us about your requirements..." className="min-h-[120px]" />
                </div>
                
                <Button className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-secondary text-lg">
                  Send Message <Send className="h-5 w-5" />
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to our Privacy Policy and Terms of Service.
                </p>
              </form>
            </div>

            {/* Side Content */}
            <div className="space-y-8 animate-slide-up">
              {/* Why Contact */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  Why Contact Us?
                </h3>
                <div className="space-y-3">
                  {[
                    "Get a personalized demo of Hostylia",
                    "Discuss your specific requirements",
                    "Get pricing for your institution size",
                    "Learn about enterprise features",
                    "Get help with migration from other systems",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offices */}
              <div>
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Our Offices
                </h3>
                <div className="space-y-4">
                  {offices.map((office) => (
                    <div 
                      key={office.city}
                      className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{office.city}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                              {office.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{office.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Proof */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    {["A", "B", "C", "D"].map((letter) => (
                      <div 
                        key={letter}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-card flex items-center justify-center text-white font-bold text-sm"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Join 3,000+ Institutions</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">4.9/5 rating</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "The Hostylia team was incredibly helpful during our onboarding. They answered all our questions and helped us migrate seamlessly."
                </p>
                <p className="text-sm font-medium text-foreground mt-2">— Priya S., Hostel Manager</p>
              </div>
            </div>
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
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Prefer to Explore on Your Own?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Start your free 7-day trial. No credit card required.
              </p>
              <Link to="/onboarding">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;