import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import campusImage from "@/assets/campus-aerial.jpg";

export const CTA = () => {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={campusImage}
          alt="Anuttama campus aerial view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[hsl(222,47%,6%)]/90" />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[250px] lg:w-[400px] h-[250px] lg:h-[400px] rounded-full bg-primary/20 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] rounded-full bg-secondary/15 blur-[100px]" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight">
            Sign in to your
            <br />
            <span className="text-gradient">Anuttama Workspace</span>
          </h2>

          <p className="text-sm lg:text-xl text-white/60 mb-6 lg:mb-10 max-w-2xl mx-auto">
            Access is restricted to <span className="text-white font-semibold">Anuttama Hostels staff and residents</span>.
            This is an internal operations workspace and is not offered as a public software service.
          </p>

          <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-6 lg:mb-10 max-w-md mx-auto">
            {[
              { icon: Shield, label: "Internal Use", desc: "Restricted access" },
              { icon: ClipboardList, label: "Anuttama Owned", desc: "Not for resale" },
            ].map((benefit) => (
              <div key={benefit.label} className="p-2 lg:p-4 rounded-lg lg:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <benefit.icon className="h-4 w-4 lg:h-6 lg:w-6 text-secondary mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-white text-xs lg:text-base">{benefit.label}</p>
                <p className="text-[10px] lg:text-sm text-white/50 hidden sm:block">{benefit.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4">
            <Link to="/auth">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white px-6 lg:px-10 py-5 lg:py-7 text-sm lg:text-lg shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-500 gap-2 rounded-xl group"
              >
                Staff Login
                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 lg:px-10 py-5 lg:py-7 text-sm lg:text-lg transition-all duration-300 rounded-xl"
              >
                Resident Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
