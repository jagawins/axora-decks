import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Hero from "@/components/landing/Hero";
import ValueTriplet from "@/components/landing/ValueTriplet";
import AIChatbot from "@/components/AIChatbot";

// Below the fold — deferred to keep the first paint light on mobile
const ExampleDecks = lazy(() => import("@/components/landing/ExampleDecks"));
const ConsultingMethodology = lazy(() => import("@/components/landing/ConsultingMethodology"));
const Features = lazy(() => import("@/components/landing/Features"));
const Pricing = lazy(() => import("@/components/landing/Pricing"));
const HomeFaq = lazy(() => import("@/components/landing/HomeFaq"));
const FounderCard = lazy(() => import("@/components/landing/FounderCard"));
const CTA = lazy(() => import("@/components/landing/CTA"));
const Footer = lazy(() => import("@/components/landing/Footer"));

const SectionFallback = () => <div className="min-h-[20vh]" aria-hidden="true" />;

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AXIVA — AI executive presentation builder</title>
        <meta
          name="description"
          content="AXIVA turns your notes into an executive deck with a clear recommendation, the evidence behind it and the next steps, then helps you prepare to present it."
        />
        <link rel="canonical" href="https://axiva.ai/" />
        <meta property="og:title" content="AXIVA — AI executive presentation builder" />
        <meta
          property="og:description"
          content="Turn a brief into a structured recommendation, evidence and next steps, then prepare to present it."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="prefetch" href="/demo" />
        <link rel="prefetch" href="/create" />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <MarketingHeader />

      <main id="main-content">
        <Hero />
        <ValueTriplet />

        <Suspense fallback={<SectionFallback />}>
          <ExampleDecks />
          <ConsultingMethodology />
          <Features />
          <Pricing />
          <HomeFaq />
          <FounderCard />
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
