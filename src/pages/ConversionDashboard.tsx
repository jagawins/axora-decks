/**
 * Conversion Analytics Dashboard
 * 
 * Internal tool for tracking the one metric that matters:
 * free-to-paid conversion rate. Plus A/B test results.
 * 
 * Target: 1-2% (Gamma = 0.86%, Beautiful.ai = 5-8%, Tome = 0.014%)
 */

import { useEffect, useState } from "react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  getAllExperimentReports,
  getFunnelEvents,
  type ExperimentReport,
  type FunnelEvent,
} from "@/lib/ab-testing";
import { getUsageSummary } from "@/lib/usage-gates";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Target,
  Beaker,
  ArrowRight,
  Crown,
} from "lucide-react";

const FUNNEL_STEPS: { step: FunnelEvent["step"]; label: string; icon: React.ElementType }[] = [
  { step: "visit", label: "Site Visit", icon: Users },
  { step: "signup", label: "Sign Up", icon: Users },
  { step: "first_deck", label: "First Deck", icon: BarChart3 },
  { step: "second_deck", label: "Second Deck", icon: BarChart3 },
  { step: "hit_limit", label: "Hit Limit", icon: Target },
  { step: "pricing_view", label: "Viewed Pricing", icon: CreditCard },
  { step: "checkout_start", label: "Started Checkout", icon: CreditCard },
  { step: "paid", label: "Converted", icon: Crown },
];

export default function ConversionDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const [reports, setReports] = useState<ExperimentReport[]>([]);
  const [funnel, setFunnel] = useState<FunnelEvent[]>([]);
  const [dbStats, setDbStats] = useState({ totalUsers: 0, paidUsers: 0, totalProjects: 0 });

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    setReports(getAllExperimentReports());
    setFunnel(getFunnelEvents());
    loadDbStats();
  }, [user]);

  const loadDbStats = async () => {
    try {
      // Get aggregate counts from DB
      const [profilesRes, subsRes, projectsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("user_id", { count: "exact", head: true }).eq("subscribed", true),
        supabase.from("projects").select("id", { count: "exact", head: true }),
      ]);
      setDbStats({
        totalUsers: profilesRes.count || 0,
        paidUsers: subsRes.count || 0,
        totalProjects: projectsRes.count || 0,
      });
    } catch { /* silent */ }
  };

  const conversionRate = dbStats.totalUsers > 0
    ? ((dbStats.paidUsers / dbStats.totalUsers) * 100).toFixed(2)
    : "0.00";

  const usage = getUsageSummary(subscription.tier);

  const completedSteps = new Set(funnel.map(f => f.step));

  return (
    <>
      <SeoHead
        title="Conversion Analytics | AXIVA"
        description="Internal conversion rate tracking and A/B test results."
        canonicalPath="/conversion"
        noIndex
      />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Conversion Analytics</h1>
              <p className="text-sm text-muted-foreground">The one metric that matters: free→paid</p>
            </div>
          </div>

          {/* ── Key Metrics ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: dbStats.totalUsers, icon: Users, color: "text-accent" },
              { label: "Paid Users", value: dbStats.paidUsers, icon: CreditCard, color: "text-emerald-500" },
              { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: parseFloat(conversionRate) >= 1 ? "text-emerald-500" : "text-amber-500" },
              { label: "Total Decks", value: dbStats.totalProjects, icon: BarChart3, color: "text-accent" },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                </div>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* ── Benchmark Context ── */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4 mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Industry Benchmarks</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Tome", rate: "0.014%", status: "danger" },
                { name: "Gamma", rate: "0.86%", status: "warning" },
                { name: "AXIVA Target", rate: "1-2%", status: "success" },
                { name: "Beautiful.ai", rate: "5-8%", status: "success" },
              ].map(b => (
                <div key={b.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20">
                  <span className="text-xs font-medium text-foreground">{b.name}</span>
                  <Badge variant={b.status === "success" ? "default" : b.status === "warning" ? "secondary" : "destructive"} className="text-[10px]">
                    {b.rate}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* ── Conversion Funnel ── */}
          <div className="rounded-xl border border-border/50 bg-card p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold text-foreground">Your Conversion Funnel</h2>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {FUNNEL_STEPS.map((s, i) => {
                const completed = completedSteps.has(s.step);
                const Icon = s.icon;
                return (
                  <div key={s.step} className="flex items-center">
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap ${
                      completed
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "bg-muted/10 border-border/30 text-muted-foreground"
                    }`}>
                      <Icon className="h-3 w-3" />
                      {s.label}
                    </div>
                    {i < FUNNEL_STEPS.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/30 mx-0.5 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="my-8" />

          {/* ── A/B Test Results ── */}
          <div className="flex items-center gap-2 mb-6">
            <Beaker className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">A/B Test Results</h2>
          </div>

          <div className="grid gap-4">
            {reports.map(report => (
              <div key={report.experimentId} className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {report.experimentId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {report.totalImpressions} impressions · {report.totalClicks} clicks
                    </p>
                  </div>
                  {report.winningVariant && (
                    <Badge className="text-[10px]">
                      Winner: {report.winningVariant}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {report.variants.map(v => (
                    <div key={v.variant} className={`rounded-lg border p-3 ${
                      v.variant === report.winningVariant
                        ? "border-accent/40 bg-accent/5"
                        : "border-border/30 bg-muted/10"
                    }`}>
                      <p className="text-xs font-semibold text-foreground capitalize mb-2">
                        {v.variant.replace(/_/g, " ")}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Impressions</span>
                          <span className="font-medium text-foreground">{v.impressions}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Clicks</span>
                          <span className="font-medium text-foreground">{v.clicks}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Dismissals</span>
                          <span className="font-medium text-foreground">{v.dismissals}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">CTR</span>
                          <span className={`font-bold ${v.ctr > 5 ? "text-emerald-500" : "text-foreground"}`}>
                            {v.ctr}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Weekly Tracking Guide ── */}
          <div className="mt-8 rounded-xl border border-border/50 bg-muted/20 p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">📊 Weekly Review Checklist</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• Check conversion rate — target 1-2% (currently {conversionRate}%)</li>
              <li>• Review A/B test winners — implement winning variants</li>
              <li>• Check funnel drop-off — where are users leaving?</li>
              <li>• Compare against benchmarks: Tome (0.014%), Gamma (0.86%), Beautiful.ai (5-8%)</li>
              <li>• Update copy variants based on results — iterate weekly</li>
            </ul>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
