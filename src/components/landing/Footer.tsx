import { Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { HostyliaLogo } from "@/components/brand/HostyliaLogo";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Solutions", href: "/solutions" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export const Footer = () => {
  return (
    <footer className="bg-[hsl(222,47%,6%)] py-12 md:py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4 md:mb-6">
              <HostyliaLogo size="lg" variant="dark" />
            </Link>
            <p className="text-white/50 text-xs md:text-sm mb-4 md:mb-6 max-w-xs leading-relaxed">
              Enterprise-grade SaaS platform for managing hostels, boarding schools, 
              and co-living spaces.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              <a href="mailto:contact@hostylia.com" className="flex items-center gap-2 md:gap-3 text-white/50 hover:text-white transition-colors text-xs md:text-sm group">
                <div className="p-1.5 md:p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                contact@hostylia.com
              </a>
              <a href="tel:+918619483010" className="flex items-center gap-2 md:gap-3 text-white/50 hover:text-white transition-colors text-xs md:text-sm group">
                <div className="p-1.5 md:p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                +91 8619483010
              </a>
              <div className="flex items-start gap-2 md:gap-3 text-white/50 text-xs md:text-sm">
                <div className="p-1.5 md:p-2 rounded-lg bg-white/5 flex-shrink-0">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                <span>22, Modern Petrol Pump, Second Floor, Kota, Rajasthan</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-primary hover:to-secondary transition-all duration-300 group"
                >
                  <social.icon className="h-3 w-3 md:h-4 md:w-4 text-white/50 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-xs md:text-sm">{title}</h4>
              <ul className="space-y-2 md:space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs md:text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Powered by Jeevijay */}
        <div className="py-4 md:py-6 border-t border-b border-white/10 mb-4 md:mb-6 text-center">
          <p className="text-xs text-white/40 mb-1">Powered by</p>
          <p className="text-sm md:text-base font-semibold text-white/70">Jeevijay Technologies Private Limited</p>
          <p className="text-xs text-white/40">AI • Automations • Digital Solutions</p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-xs md:text-sm text-white/30 text-center md:text-left">
            © 2025 Hostylia. All rights reserved.
          </p>
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="#" className="text-xs md:text-sm text-white/30 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="#" className="text-xs md:text-sm text-white/30 hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};