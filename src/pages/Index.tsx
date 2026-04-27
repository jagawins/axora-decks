import { lazy, Suspense } from "react";
import MarketingHeader from "@/components/MarketingHeader";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/landing/Hero";
import ValueTriplet from "@/components/landing/ValueTriplet";
import AIChatbot from "@/components/AIChatbot";

// Defer everything below the fold — cuts mobile JS by ~60% on first paint
const Features = lazy(() => import("@/components/landing/Features"));
const Pricing = lazy(() => import("@/components/landing/Pricing"));
const CTA = lazy(() => import("@/components/landing/CTA"));
const Footer = lazy(() => import("@/components/landing/Footer"));
const FounderCard = lazy(() => import("@/components/landing/FounderCard"));
const BeforeAfter = lazy(() => import("@/components/landing/BeforeAfter"));
const ExampleDecks = lazy(() => import("@/components/landing/ExampleDecks"));
const SocialProof = lazy(() => import("@/components/landing/SocialProof"));
const ConsultingMethodology = lazy(() => import("@/components/landing/ConsultingMethodology"));
const ExecutiveShowcase = lazy(() => import("@/components/landing/ExecutiveShowcase"));
const SlideInspiration = lazy(() => import("@/components/landing/SlideInspiration"));

const SectionFallback = () => <div className="min-h-[20vh]" aria-hidden="true" />;

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <link rel="prefetch" href="/auth" />
        <link rel="prefetch" href="/demo" />
        <link rel="prefetch" href="/create" />
      </Helmet>
      <MarketingHeader />
      <main>
        {/* Above the fold — eager */}
        <Hero />
        <ValueTriplet />

        {/* Below the fold — lazy */}
        <Suspense fallback={<SectionFallback />}>
          <BeforeAfter />
          <Features />
          <ExecutiveShowcase />
          <ConsultingMethodology />
          <ExampleDecks />
          <SlideInspiration />
          <SocialProof />
          <FounderCard />
          <Pricing />
          <CTA />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}>
        <Footer />
      </Suspense>
      <AIChatbot />
    </div>
  );
};

export default Index;
