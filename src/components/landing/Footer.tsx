import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { HostyliaLogo } from "@/components/brand/HostyliaLogo";

const footerLinks = {
  Platform: [
    { label: "Operations", href: "/features" },
    { label: "Our Hostels", href: "/solutions" },
  ],
  Anuttama: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Access: [
    { label: "Sign In", href: "/auth" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-[hsl(222,47%,6%)] py-12 md:py-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4 md:mb-6">
              <HostyliaLogo size="lg" variant="dark" />
            </Link>
            <p className="text-white/50 text-xs md:text-sm mb-4 md:mb-6 max-w-xs leading-relaxed">
              Anuttama Hostels owns and operates a network of hostels. This is our internal operations workspace, developed exclusively for Anuttama-owned hostel operations and not offered as a public software service.
            </p>

            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              <a href="mailto:contact@anuttamahostels.com" className="flex items-center gap-2 md:gap-3 text-white/50 hover:text-white transition-colors text-xs md:text-sm group">
                <div className="p-1.5 md:p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                contact@anuttamahostels.com
              </a>
              <a href="tel:+918619483010" className="flex items-center gap-2 md:gap-3 text-white/50 hover:text-white transition-colors text-xs md:text-sm group">
                <div className="p-1.5 md:p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                +91 8619483010
              </a>
            </div>
          </div>

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

        <div className="py-4 md:py-6 border-t border-b border-white/10 mb-4 md:mb-6 text-center">
          <p className="text-xs text-white/40 mb-1">Powered by</p>
          <p className="text-sm md:text-base font-semibold text-white/70">Jeevijay Technologies Private Limited</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-xs md:text-sm text-white/30 text-center md:text-left">
            © 2026 Anuttama Hostels. All rights reserved. Internal platform — not a public software service.
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
