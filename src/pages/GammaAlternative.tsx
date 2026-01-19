import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Triangle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

const GammaAlternative = () => {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
          </div>
          
          <div className="container-narrow relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                <span>Gamma Alternative</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                AXOR vs Gamma:{" "}
                <span className="text-gradient">The AI Presentation Tool</span>{" "}
                Leaders Prefer
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                Gamma is strong for quick visual slides. AXOR is built for executives who need 
                structure, logic, and clarity. They serve different purposes—and one is made for business leadership.
              </p>

              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Try AXOR Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Summary Comparison */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Which Tool is Right for You?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* AXOR Column */}
              <div className="glass-card p-8 border-accent/20">
                <h3 className="text-2xl font-bold mb-6 text-accent">When to Choose AXOR</h3>
                <ul className="space-y-4">
                  {[
                    "You work in leadership, operations, strategy, consulting, healthcare, enterprise, or transformation",
                    "You need structured thinking, not visual experiments",
                    "You produce decks that inform decisions, not just impress viewers",
                    "You want concise messaging with executive tone"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gamma Column */}
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold mb-6">When to Choose Gamma</h3>
                <ul className="space-y-4">
                  {[
                    "You want rapid design automation",
                    "You need templates and visual-first slides",
                    "You prioritize aesthetics over reasoning structure"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Triangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What Breaks in Gamma */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
                What Breaks in Gamma for Executives
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                Gamma struggles with the requirements business leaders actually have.
              </p>
              
              <div className="glass-card p-8">
                <ul className="space-y-4">
                  {[
                    "Over-styled slides lacking hierarchy",
                    "Weak narrative flow",
                    "Generic business language",
                    "Heavy formatting that hides the message",
                    "Difficulty exporting clean PowerPoint builds"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-lg font-medium text-foreground">
                    Executives don't want animation. They want clarity, sequencing, and logic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why AXOR Wins */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Why AXOR Wins for Business Users
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Executive-grade structure",
                  description: "AXOR organizes thinking into arguments, insights, decisions, and recommendations."
                },
                {
                  title: "Decision-oriented messaging",
                  description: "Slides reflect how boards, VPs, and directors actually communicate."
                },
                {
                  title: "Consistent North Star",
                  description: "Every deck has a single clear through-line. No confusion. No decorated noise."
                },
                {
                  title: "PowerPoint-first output",
                  description: "Built for the tools your organization already uses."
                }
              ].map((feature, i) => (
                <div key={i} className="glass-card p-6">
                  <h3 className="text-xl font-semibold mb-3 text-accent">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Feature Comparison
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-accent">AXOR</th>
                    <th className="text-center py-4 px-4 font-semibold">Gamma</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Executive-grade structure", axor: true, gamma: false },
                    { feature: "PowerPoint logic", axor: true, gamma: false },
                    { feature: "Investor / strategy deck quality", axor: true, gamma: "partial" },
                    { feature: "Design automation", axor: "partial", gamma: true },
                    { feature: "Export stability", axor: true, gamma: "partial" },
                    { feature: "Visual templates", axor: "partial", gamma: true },
                    { feature: "Data-driven narrative", axor: true, gamma: false }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-4 px-4 text-muted-foreground">{row.feature}</td>
                      <td className="text-center py-4 px-4">
                        {row.axor === true ? (
                          <Check className="h-5 w-5 text-accent mx-auto" />
                        ) : row.axor === "partial" ? (
                          <Triangle className="h-5 w-5 text-warning mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-destructive mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.gamma === true ? (
                          <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : row.gamma === "partial" ? (
                          <Triangle className="h-5 w-5 text-warning mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-destructive mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="glass-card p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Try AXOR and experience the difference
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join leaders who have switched from Gamma to AXOR for executive-grade presentations.
              </p>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Try AXOR Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • Free tier forever
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default GammaAlternative;