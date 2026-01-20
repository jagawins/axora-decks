import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Preview from "./pages/Preview";
import PublicPreview from "./pages/PublicPreview";
import Print from "./pages/Print";
import Create from "./pages/Create";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import HowItWorks from "./pages/HowItWorks";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Press from "./pages/Press";
import Founder from "./pages/Founder";
import Roadmap from "./pages/Roadmap";
import GammaAlternative from "./pages/GammaAlternative";
import PowerPointAI from "./pages/PowerPointAI";
import PPTGenerator from "./pages/PPTGenerator";
import ExecutiveDeckGenerator from "./pages/ExecutiveDeckGenerator";
import AIDeckGenerator from "./pages/AIDeckGenerator";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import AIIndex from "./pages/AIIndex";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create" element={<Create />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/template/:slug" element={<TemplateDetail />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/press" element={<Press />} />
                <Route path="/founder" element={<Founder />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/editor/:id" element={<Editor />} />
                <Route path="/preview/:id" element={<Preview />} />
                <Route path="/print/:id" element={<Print />} />
                <Route path="/p/:token" element={<PublicPreview />} />
                <Route path="/gamma-alternative" element={<GammaAlternative />} />
                <Route path="/powerpoint-ai" element={<PowerPointAI />} />
                <Route path="/ppt-generator" element={<PPTGenerator />} />
                <Route path="/executive-deck-generator" element={<ExecutiveDeckGenerator />} />
                <Route path="/ai-deck-generator" element={<AIDeckGenerator />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/ai-index" element={<AIIndex />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
