import MarketingHeader from "@/components/MarketingHeader";
import Hero from "@/components/landing/Hero";
import ValueTriplet from "@/components/landing/ValueTriplet";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import FounderCard from "@/components/landing/FounderCard";
import BeforeAfter from "@/components/landing/BeforeAfter";
import ExampleDecks from "@/components/landing/ExampleDecks";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        <Hero />
        <ValueTriplet />
        <Features />
        <BeforeAfter />
        <ExampleDecks />
        <FounderCard />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
