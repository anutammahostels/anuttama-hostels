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
    <footer
      className="py-14 md:py-16 text-white/80"
      style={{ backgroundColor: "hsl(var(--brand-deep))" }}
    >
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-5">
              <HostyliaLogo size="md" variant="dark" rounded="full" />
            </Link>
            <p className="text-sm text-white/60 mb-5 max-w-xs leading-relaxed">
              Quiet, reliable software for hostels, boarding schools, and
              co-living spaces.
            </p>

            <div className="space-y-2.5 mb-5">
              <a
                href="mailto:contact@hostylia.com"
                className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4 text-white/40" />
                contact@hostylia.com
              </a>
              <a
                href="tel:+918619483010"
                className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-white/40" />
                +91 8619483010
              </a>
              <div className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="h-4 w-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>22, Modern Petrol Pump, Second Floor, Kota, Rajasthan</span>
              </div>
            </div>

            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 transition-colors"
                >
                  <social.icon className="h-4 w-4 text-white/70" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2.5">
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

        {/* Powered by */}
        <div className="py-5 border-t border-white/10 mb-5 text-center">
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">
            Powered by
          </p>
          <p className="text-sm font-semibold text-white/80">
            Jeevijay Technologies Private Limited
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            AI · Automations · Digital Solutions
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-white/40 text-center md:text-left">
            © 2026 Anuttama Hostels. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="#" className="text-xs text-white/40 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="#" className="text-xs text-white/40 hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
