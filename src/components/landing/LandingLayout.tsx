import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const LandingLayout = () => (
  <div className="min-h-screen bg-brand-cream text-brand-ink">
    <Navbar />
    <Outlet />
    <Footer />
  </div>
);
