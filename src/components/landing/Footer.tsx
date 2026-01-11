import { Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { HostyliaLogo } from "@/components/brand/HostyliaLogo";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Solutions", href: "/solutions" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Status", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
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
    <footer className="bg-primary py-16 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <HostyliaLogo size="lg" showText={true} textColor="light" />
            </Link>
            <p className="text-white/60 text-sm mb-6 max-w-xs leading-relaxed">
              Enterprise-grade SaaS platform for managing hostels, boarding schools, 
              and co-living spaces with policy-driven flexibility.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <a href="mailto:contact@hostylia.com" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
                <Mail className="h-4 w-4" />
                contact@hostylia.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </a>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="h-4 w-4" />
                Bangalore, India
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-white/5 hover:bg-secondary/20 transition-colors group"
                >
                  <social.icon className="h-4 w-4 text-white/60 group-hover:text-secondary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © 2025 Hostylia. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};