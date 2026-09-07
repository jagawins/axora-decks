import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Hero from "@/components/landing/Hero";
import ValueTriplet from "@/components/landing/ValueTriplet";
import CompactPricing from "@/components/landing/CompactPricing";
import Footer from "@/components/landing/Footer";
import AIChatbot from "@/components/AIChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AXIVA — AI executive presentation builder</title>
        <meta
          name="description"
          content="Turn your notes into a clear, presentation-ready deck with AXIVA."
        />
        <link rel="canonical" href="https://axiva.ai/" />
        <meta property="og:title" content="AXIVA — AI executive presentation builder" />
        <meta
          property="og:description"
          content="Turn your notes into a clear, presentation-ready deck with AXIVA."
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
        <CompactPricing />
      </main>

      <Footer compact />
      <AIChatbot />
    </div>
  );
};

export default Index;
