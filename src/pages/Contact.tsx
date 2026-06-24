import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail, Phone, MapPin, Send, MessageSquare, Headphones, Sparkles, Building2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import campusImage from "@/assets/campus-aerial.jpg";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    desc: "We respond within working hours",
    value: "contact@anuttamahostels.com",
    href: "mailto:contact@anuttamahostels.com",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Phone,
    title: "Call Us",
    desc: "Mon–Sat, 9am to 6pm IST",
    value: "+91 8619483010",
    href: "tel:+918619483010",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: MessageSquare,
    title: "Resident Help",
    desc: "Available inside the resident workspace",
    value: "Sign in to raise a complaint",
    href: "/auth",
    color: "bg-accent/10 text-accent",
  },
];

const faqs = [
  { q: "Is this a SaaS product I can buy?", a: "No. This platform is built and used exclusively by Anuttama Hostels for our own hostel operations. It is not offered as software to other hostels, schools or institutions." },
  { q: "Who can sign in?", a: "Sign-in is restricted to Anuttama staff (administrators, accountants) and Anuttama residents." },
  { q: "I’m a parent — how do I check my child’s details?", a: "Parents receive updates from the hostel directly. For specific queries please contact us using the details above." },
  { q: "How is my data handled?", a: "All data is internal to Anuttama Hostels and is used only for our hostel operations. Access is role-based and audited." },
];

const Contact = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={campusImage} alt="Anuttama campus" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,47%,6%)]/90 to-[hsl(222,47%,6%)]" />
        </div>
        <div className="absolute top-20 right-1/4 w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-full bg-secondary/15 blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/80 text-xs md:text-sm font-medium mb-4 md:mb-6 animate-slide-down stagger-1">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-secondary" />
              Anuttama Hostels
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 animate-slide-up stagger-2">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-sm md:text-lg text-white/60 mb-6 md:mb-8 animate-slide-up stagger-3 px-4">
              Reach out for queries about Anuttama Hostels — admissions, residence options or general information.
              This contact page is for Anuttama-related queries only and is not for software sales or licensing enquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-8 md:py-12 -mt-6 md:-mt-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <a
                key={method.title}
                href={method.href}
                className="group p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 text-center animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={`inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl ${method.color} mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                  <method.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <h3 className="font-bold text-foreground text-sm md:text-base mb-1">{method.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">{method.desc}</p>
                <p className="text-xs md:text-sm font-medium text-primary">{method.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Form & info */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="p-4 md:p-8 lg:p-10 rounded-xl md:rounded-2xl lg:rounded-3xl bg-card border border-border shadow-lg animate-slide-up">
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Send us a message</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  For queries about staying at Anuttama Hostels or general information.
                </p>
              </div>

              <form className="space-y-4 md:space-y-5">
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-foreground mb-1.5 md:mb-2 block">Your Name *</label>
                    <Input placeholder="Full name" className="h-10 md:h-12 text-sm md:text-base" />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-foreground mb-1.5 md:mb-2 block">Email Address *</label>
                    <Input placeholder="you@example.com" type="email" className="h-10 md:h-12 text-sm md:text-base" />
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-foreground mb-1.5 md:mb-2 block">Phone Number</label>
                  <Input placeholder="+91" type="tel" className="h-10 md:h-12 text-sm md:text-base" />
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-foreground mb-1.5 md:mb-2 block">How can we help? *</label>
                  <Textarea placeholder="Your message…" className="min-h-[100px] md:min-h-[120px] text-sm md:text-base" />
                </div>

                <Button className="w-full h-10 md:h-12 gap-2 bg-[#29926A] hover:bg-[#22805C] text-white text-sm md:text-lg">
                  Send Message <Send className="h-4 w-4 md:h-5 md:w-5" />
                </Button>

                <p className="text-[10px] md:text-xs text-muted-foreground text-center">
                  By submitting, you agree that this is a request directed at Anuttama Hostels.
                </p>
              </form>
            </div>

            <div className="space-y-4 md:space-y-8 animate-slide-up">
              <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <h3 className="font-bold text-foreground text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2">
                  <Headphones className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  This contact form is for
                </h3>
                <ul className="space-y-2 text-xs md:text-sm text-foreground list-disc list-inside">
                  <li>Queries about staying at an Anuttama hostel</li>
                  <li>Resident or parent queries</li>
                  <li>General information about Anuttama Hostels</li>
                </ul>
                <p className="text-xs md:text-sm text-muted-foreground mt-3">
                  This platform is not offered as a public software service, so we do not handle software sales,
                  licensing or partnership requests here.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-foreground text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Anuttama Hostels Office
                </h3>
                <div className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm md:text-base">Kota, Rajasthan</p>
                      <p className="text-xs md:text-sm text-muted-foreground">22, Modern Petrol Pump, Second Floor, Kota, Rajasthan</p>
                      <a href="tel:+918619483010" className="text-xs md:text-sm text-primary font-medium mt-1 inline-block">
                        +91 8619483010
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border">
                <p className="text-xs md:text-sm text-muted-foreground">
                  Anuttama staff and residents can <Link to="/auth" className="text-primary font-medium">sign in here</Link> to access the internal workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className="p-4 md:p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <h4 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2">{faq.q}</h4>
                <p className="text-muted-foreground text-xs md:text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal access CTA */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-r from-primary to-secondary p-6 md:p-12 lg:p-16 text-center overflow-hidden">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
              Anuttama Staff or Resident?
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto mb-6 md:mb-8">
              Sign in to your internal workspace.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 text-sm md:text-base">
                Sign In <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
