import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { invokeFunction } from "@/lib/supabase-function-client";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Eye, Loader2, Users, Mail, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";

const ADMIN_EMAILS = ["jag@axiva.ai", "jag@verityaxis.com"];

interface Broadcast {
  id: string;
  subject: string;
  recipient_count: number;
  sent_at: string;
}

export default function NewsletterAdmin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<{ subscriberCount: number; sampleEmails: string[] } | null>(null);
  const [pastBroadcasts, setPastBroadcasts] = useState<Broadcast[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      navigate("/dashboard");
    }
  }, [authLoading, user, navigate]);

  // Load past broadcasts via edge function (service-role only in DB)
  const loadBroadcasts = async () => {
    try {
      const res = await invokeFunction<{ broadcasts: Broadcast[] }>(
        "newsletter-broadcast",
        { action: "list" }
      );
      if (res.data?.broadcasts) setPastBroadcasts(res.data.broadcasts);
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadBroadcasts();
  }, [user]);

  const handlePreview = async () => {
    if (!subject || !bodyHtml) {
      toast({ title: "Missing fields", description: "Subject and body are required.", variant: "destructive" });
      return;
    }

    setPreviewing(true);
    try {
      const res = await invokeFunction<{ preview: boolean; subscriberCount: number; sampleEmails: string[] }>(
        "newsletter-broadcast",
        { subject, bodyHtml, preview: true }
      );
      if (res.data) {
        setPreviewData(res.data);
        setSubscriberCount(res.data.subscriberCount);
      }
    } catch (err) {
      toast({ title: "Preview failed", description: String(err), variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  };

  const handleSend = async () => {
    if (!subject || !bodyHtml) return;
    
    const confirmed = window.confirm(
      `Send "${subject}" to ${previewData?.subscriberCount || "all"} subscribers? This cannot be undone.`
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const res = await invokeFunction<{ success: boolean; sentCount: number; totalSubscribers: number }>(
        "newsletter-broadcast",
        { subject, bodyHtml }
      );
      if (res.data?.success) {
        toast({
          title: "Broadcast sent!",
          description: `Delivered to ${res.data.sentCount} of ${res.data.totalSubscribers} subscribers.`,
        });
        setSubject("");
        setBodyHtml("");
        setPreviewData(null);
        // Refresh broadcasts via edge function
        await loadBroadcasts();
        toast({ title: "Send failed", description: res.error || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Send failed", description: String(err), variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Newsletter Admin</h1>
          </div>
          {subscriberCount !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {subscriberCount} subscribers
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Compose */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">Compose Broadcast</h2>
          </div>

          <div className="space-y-2">
            <Label>Subject Line</Label>
            <Input
              placeholder="e.g., New feature: AI chart generation is live"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Body (HTML)</Label>
            <Textarea
              placeholder={`<h2>What's new this week</h2>\n<p>We shipped AI chart generation — bar charts, donut charts, and area charts, all from a single prompt.</p>\n<a href="https://axiva.ai/auth">Try it free →</a>`}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use basic HTML: &lt;h2&gt;, &lt;p&gt;, &lt;a&gt;, &lt;ul&gt;/&lt;li&gt;, &lt;strong&gt;. 
              AXIVA header + footer + unsubscribe link are added automatically.
            </p>
          </div>

          {/* Preview result */}
          {previewData && (
            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 space-y-2">
              <p className="text-sm font-medium text-accent">Preview: Will send to {previewData.subscriberCount} subscribers</p>
              <p className="text-xs text-muted-foreground">
                Sample recipients: {previewData.sampleEmails.join(", ")}
                {previewData.subscriberCount > 5 && ` and ${previewData.subscriberCount - 5} more...`}
              </p>
            </div>
          )}

          {/* HTML Preview */}
          {bodyHtml && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Email Preview</Label>
              <div
                className="rounded-xl border border-border bg-white text-gray-900 p-6 max-h-[300px] overflow-y-auto prose prose-sm"
                dangerouslySetInnerHTML={{
                  __html: `<div style="text-align:center;margin-bottom:16px;font-size:18px;font-weight:800;letter-spacing:2px;">AXIVA</div>${bodyHtml}`
                }}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handlePreview} disabled={previewing || !subject || !bodyHtml} className="gap-2">
              {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Preview
            </Button>
            <Button
              variant="hero"
              onClick={handleSend}
              disabled={sending || !subject || !bodyHtml || !previewData}
              className="gap-2"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send to {previewData?.subscriberCount || "all"} subscribers
            </Button>
          </div>
        </div>

        {/* Past broadcasts */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Past Broadcasts
          </h2>
          {pastBroadcasts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No broadcasts sent yet.</p>
          ) : (
            <div className="space-y-3">
              {pastBroadcasts.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{b.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    {b.recipient_count} sent
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
