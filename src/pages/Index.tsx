import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Benefits } from "@/components/landing/Benefits";
import { PolicyEngine } from "@/components/landing/PolicyEngine";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";

const Index = () => {
  return (
    <>
      <Hero />
      <Features />
      <Benefits />
      <PolicyEngine />
      <Testimonials />
      <CTA />
    </>
  );
};

export default Index;
