import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewsletterAdmin from "./pages/NewsletterAdmin";
import Editor from "./pages/Editor";
import Preview from "./pages/Preview";
import PublicPreview from "./pages/PublicPreview";
import Print from "./pages/Print";
import Present from "./pages/Present";
import Create from "./pages/Create";
import Templates from "./pages/Templates";
import ExecutiveHub from "./pages/ExecutiveHub";
import LivePolls from "./pages/LivePolls";
import LivePollParticipant from "./pages/LivePollParticipant";
import Webinars from "./pages/Webinars";
import AllHands from "./pages/AllHands";
import TemplateDetail from "./pages/TemplateDetail";
import TemplateSEOPage from "./pages/TemplateSEOPage";
import HowItWorks from "./pages/HowItWorks";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Press from "./pages/Press";
import Founder from "./pages/Founder";
import Roadmap from "./pages/Roadmap";
import GammaAlternative from "./pages/GammaAlternative";
import GensparkAlternative from "./pages/GensparkAlternative";
import PowerPointAI from "./pages/PowerPointAI";
import PPTGenerator from "./pages/PPTGenerator";
import ExecutiveDeckGenerator from "./pages/ExecutiveDeckGenerator";
import AIDeckGenerator from "./pages/AIDeckGenerator";
import AIPresentationMaker from "./pages/AIPresentationMaker";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import AIIndex from "./pages/AIIndex";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";
import SettingsPage from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import FAQ from "./pages/FAQ";
import InvestorPitchDeck from "./pages/InvestorPitchDeck";
import BeautifulAiAlternative from "./pages/BeautifulAiAlternative";
import BrandKitPage from "./pages/BrandKit";
import HealthcareAIPresentations from "./pages/HealthcareAIPresentations";
import NHSBoardPresentationGenerator from "./pages/NHSBoardPresentationGenerator";
import APACEnterprisePresentations from "./pages/APACEnterprisePresentations";
import ConversionDashboard from "./pages/ConversionDashboard";
import Enterprise from "./pages/Enterprise";

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
              <PWAInstallPrompt />
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
              </SubscriptionProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
