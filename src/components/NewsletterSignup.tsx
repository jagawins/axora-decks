import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupProps {
  source?: string;
  variant?: "inline" | "card" | "minimal";
  className?: string;
}

export default function NewsletterSignup({ source = "website", variant = "card", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use raw fetch to bypass RLS (insert is allowed for anyone)
      const { error: insertError } = await supabase
        .from("newsletter_subscribers" as any)
        .insert({ email: email.trim().toLowerCase(), source } as any);

      if (insertError) {
        if (insertError.code === "23505") {
          // Duplicate email — treat as success
          setSuccess(true);
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
      }
      setEmail("");
    } catch (err) {
      console.error("Newsletter signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`flex items-center gap-2 ${variant === "card" ? "p-6 rounded-2xl border border-green-500/20 bg-green-500/5" : ""} ${className}`}>
        <Check className="h-5 w-5 text-green-500 shrink-0" />
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          You're in! Watch your inbox for executive presentation tips and product updates.
        </p>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          className="text-sm h-9"
          required
        />
        <Button type="submit" size="sm" disabled={loading} className="shrink-0 h-9 px-4">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Subscribe"}
        </Button>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </form>
    );
  }

  if (variant === "inline") {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="pl-9 text-sm"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="shrink-0 gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Subscribe <Mail className="h-3.5 w-3.5" /></>}
          </Button>
        </form>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`p-6 rounded-2xl border border-border/60 bg-card/50 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold">Executive Presentation Insights</p>
          <p className="text-[10px] text-muted-foreground">Weekly tips, templates & product updates</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className="pl-9 text-sm"
            required
          />
        </div>
        <Button type="submit" variant="hero" disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Subscribe Free <Mail className="h-3.5 w-3.5" /></>}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="text-[10px] text-muted-foreground text-center">No spam. Unsubscribe anytime.</p>
      </form>
    </div>
  );
}
