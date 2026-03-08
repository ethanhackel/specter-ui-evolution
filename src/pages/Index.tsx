import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { lazy, Suspense } from "react";

// Lazy load below-the-fold component
const TerminalDemo = lazy(() => import("@/components/TerminalDemo"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <Suspense fallback={<div className="h-[500px]" />}>
          <TerminalDemo />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
