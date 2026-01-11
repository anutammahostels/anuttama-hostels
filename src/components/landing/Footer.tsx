import { Building2, Twitter, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Resources: ["Documentation", "Help Center", "API Reference", "Status"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export const Footer = () => {
  return (
    <footer className="bg-sidebar py-16 border-t border-sidebar-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">HostelHub</span>
            </Link>
            <p className="text-sidebar-foreground/70 text-sm mb-6 max-w-xs">
              The next-generation SaaS platform for managing student housing 
              with policy-driven flexibility.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-primary transition-colors"
                >
                  <Icon className="h-4 w-4 text-sidebar-foreground" />
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
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-sidebar-foreground/70 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-sidebar-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-sidebar-foreground/50">
            © 2024 HostelHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-sidebar-foreground/50 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-sidebar-foreground/50 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-sidebar-foreground/50 hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
