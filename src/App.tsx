import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LiveVariableProvider } from "@/components/blocks/LiveAdaptive";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { lazy, Suspense } from "react";

// ── Critical path: loaded eagerly (landing page) ──
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// ── Everything else: lazy loaded (code-split per route) ──
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NewsletterAdmin = lazy(() => import("./pages/NewsletterAdmin"));
const Editor = lazy(() => import("./pages/Editor"));
const Preview = lazy(() => import("./pages/Preview"));
const PublicPreview = lazy(() => import("./pages/PublicPreview"));
const Print = lazy(() => import("./pages/Print"));
const Present = lazy(() => import("./pages/Present"));
const Create = lazy(() => import("./pages/Create"));
const Templates = lazy(() => import("./pages/Templates"));
const ExecutiveHub = lazy(() => import("./pages/ExecutiveHub"));
const LivePolls = lazy(() => import("./pages/LivePolls"));
const LivePollParticipant = lazy(() => import("./pages/LivePollParticipant"));
const Webinars = lazy(() => import("./pages/Webinars"));
const AllHands = lazy(() => import("./pages/AllHands"));
const ForConsultants = lazy(() => import("./pages/ForConsultants"));
const ForFounders = lazy(() => import("./pages/ForFounders"));
const ForSales = lazy(() => import("./pages/ForSales"));
const TemplateDetail = lazy(() => import("./pages/TemplateDetail"));
const TemplateSEOPage = lazy(() => import("./pages/TemplateSEOPage"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Press = lazy(() => import("./pages/Press"));
const Founder = lazy(() => import("./pages/Founder"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const GammaAlternative = lazy(() => import("./pages/GammaAlternative"));
const GensparkAlternative = lazy(() => import("./pages/GensparkAlternative"));
const PowerPointAI = lazy(() => import("./pages/PowerPointAI"));
const PPTGenerator = lazy(() => import("./pages/PPTGenerator"));
const ExecutiveDeckGenerator = lazy(() => import("./pages/ExecutiveDeckGenerator"));
const AIDeckGenerator = lazy(() => import("./pages/AIDeckGenerator"));
const AIPresentationMaker = lazy(() => import("./pages/AIPresentationMaker"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AIIndex = lazy(() => import("./pages/AIIndex"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Demo = lazy(() => import("./pages/Demo"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const FAQ = lazy(() => import("./pages/FAQ"));
const InvestorPitchDeck = lazy(() => import("./pages/InvestorPitchDeck"));
const BeautifulAiAlternative = lazy(() => import("./pages/BeautifulAiAlternative"));
const BrandKitPage = lazy(() => import("./pages/BrandKit"));
const HealthcareAIPresentations = lazy(() => import("./pages/HealthcareAIPresentations"));
const NHSBoardPresentationGenerator = lazy(() => import("./pages/NHSBoardPresentationGenerator"));
const APACEnterprisePresentations = lazy(() => import("./pages/APACEnterprisePresentations"));
const ConversionDashboard = lazy(() => import("./pages/ConversionDashboard"));
const Enterprise = lazy(() => import("./pages/Enterprise"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <SubscriptionProvider>
              <LiveVariableProvider>
              <PWAInstallPrompt />
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/create" element={<Create />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/executive" element={<ExecutiveHub />} />
                <Route path="/live-polls" element={<LivePolls />} />
                <Route path="/live/:code" element={<LivePollParticipant />} />
                <Route path="/webinars" element={<Webinars />} />
                <Route path="/all-hands" element={<AllHands />} />
                <Route path="/for/consultants" element={<ForConsultants />} />
                <Route path="/for/founders" element={<ForFounders />} />
                <Route path="/for/sales" element={<ForSales />} />
                <Route path="/template/:slug" element={<TemplateDetail />} />
                <Route path="/templates/:slug" element={<TemplateSEOPage />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/press" element={<Press />} />
                <Route path="/founder" element={<Founder />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/newsletter" element={<NewsletterAdmin />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/editor/:id" element={<Editor />} />
                <Route path="/preview/:id" element={<Preview />} />
                <Route path="/print/:id" element={<Print />} />
                <Route path="/p/:token" element={<PublicPreview />} />
                <Route path="/present/:id" element={<Present />} />
                <Route path="/gamma-alternative" element={<GammaAlternative />} />
                <Route path="/genspark-alternative" element={<GensparkAlternative />} />
                <Route path="/powerpoint-ai" element={<PowerPointAI />} />
                <Route path="/ppt-generator" element={<PPTGenerator />} />
                <Route path="/executive-deck-generator" element={<ExecutiveDeckGenerator />} />
                <Route path="/ai-deck-generator" element={<AIDeckGenerator />} />
                <Route path="/ai-presentation-maker" element={<AIPresentationMaker />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/ai-index" element={<AIIndex />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/investor-pitch-deck" element={<InvestorPitchDeck />} />
                <Route path="/beautiful-ai-alternative" element={<BeautifulAiAlternative />} />
                <Route path="/brand-kit" element={<BrandKitPage />} />
                <Route path="/healthcare-ai-presentations" element={<HealthcareAIPresentations />} />
                <Route path="/nhs-board-presentation-generator" element={<NHSBoardPresentationGenerator />} />
                <Route path="/asia-pacific-enterprise-presentations" element={<APACEnterprisePresentations />} />
                <Route path="/conversion" element={<ConversionDashboard />} />
                <Route path="/enterprise" element={<Enterprise />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              </LiveVariableProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
