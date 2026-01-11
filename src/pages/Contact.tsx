import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/15 blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
              <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Your Name" className="h-12" />
                  <Input placeholder="Your Email" type="email" className="h-12" />
                </div>
                <Input placeholder="Organization Name" className="h-12" />
                <Input placeholder="Phone Number" type="tel" className="h-12" />
                <Textarea placeholder="Your Message" className="min-h-[120px]" />
                <Button className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-secondary">
                  Send Message <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <a href="mailto:contact@hostylia.com" className="text-muted-foreground hover:text-primary transition-colors">
                      contact@hostylia.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-secondary/10">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <a href="tel:+919876543210" className="text-muted-foreground hover:text-secondary transition-colors">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Office</p>
                    <p className="text-muted-foreground">Bangalore, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;