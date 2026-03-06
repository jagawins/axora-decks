<!-- Google tag (gtag.js) --> <script async src="https://www.googletagmanager.com/gtag/js?id=G-V2R1YRW6TX"></script> <script>   window.dataLayer = window.dataLayer || [];   function gtag(){dataLayer.push(arguments);}   gtag('js', new Date());    gtag('config', 'G-V2R1YRW6TX'); </script>
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
import SocialProof from "@/components/landing/SocialProof";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* 1. Hero — prompt input + live preview + stats */}
        <Hero />

        {/* 2. How it works — 3-step process */}
        <ValueTriplet />

        {/* 3. Before/After comparison */}
        <BeforeAfter />

        {/* 4. Features — blocks showcase + feature cards */}
        <Features />

        {/* 5. Example decks — YouExec-style showcase */}
        <ExampleDecks />

        {/* 6. Social proof & testimonials */}
        <SocialProof />

        {/* 7. Founder card */}
        <FounderCard />

        {/* 8. Pricing */}
        <Pricing />

        {/* 9. Final CTA */}
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
