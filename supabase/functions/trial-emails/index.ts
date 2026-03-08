import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DRIP_SCHEDULE = [
  { key: "day0", daysAfterSignup: 0, subject: "Your deck is one prompt away", needsDeck: false, needsNoDeck: false },
  { key: "day3", daysAfterSignup: 3, subject: "Here's a deck we made in 90 seconds", needsDeck: false, needsNoDeck: true },
  { key: "day5", daysAfterSignup: 5, subject: "Here's what Pro unlocks", needsDeck: true, needsNoDeck: false },
  { key: "day10", daysAfterSignup: 10, subject: "You're halfway through your trial", needsDeck: false, needsNoDeck: false },
  { key: "day13", daysAfterSignup: 13, subject: "Your trial ends tomorrow", needsDeck: false, needsNoDeck: false },
];

function getEmailBody(key: string, appUrl: string): string {
  switch (key) {
    case "day0":
      return `
        <h2 style="margin:0 0 16px">Welcome to Axiva 👋</h2>
        <p>Your first executive-grade deck is one prompt away.</p>
        <p>Just describe what you need — "Seed round pitch for an AI startup" — and Axiva builds a polished presentation in under 2 minutes.</p>
        <a href="${appUrl}/onboarding" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">Create Your First Deck →</a>
      `;
    case "day3":
      return `
        <h2 style="margin:0 0 16px">See what Axiva can do in 90 seconds ⚡</h2>
        <p>We noticed you haven't created a deck yet. No worries — here's what a single prompt produces:</p>
        <p><strong>Prompt:</strong> "Q4 board update with revenue metrics and strategic outlook"</p>
        <p>→ 8 slides, structured narrative, data visualizations, executive formatting — all in under 2 minutes.</p>
        <a href="${appUrl}/onboarding" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">Try It Now →</a>
      `;
    case "day5":
      return `
        <h2 style="margin:0 0 16px">Here's what Pro unlocks 🚀</h2>
        <p>You've created your first deck — nice. Pro takes it further:</p>
        <ul style="padding-left:20px">
          <li><strong>Brand Kit</strong> — your logo, fonts, and colors on every slide</li>
          <li><strong>PowerPoint export</strong> — fully editable .pptx files</li>
          <li><strong>Unlimited decks</strong> — no generation limits</li>
          <li><strong>Interactive blocks</strong> — Tabs, Toggle, Reveal for richer storytelling</li>
          <li><strong>AI images</strong> — generated visuals that match your narrative</li>
        </ul>
        <p><strong>$28/mo</strong> — 14-day free trial, cancel anytime.</p>
        <a href="${appUrl}/pricing" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">Start Free Trial →</a>
      `;
    case "day10":
      return `
        <h2 style="margin:0 0 16px">You're halfway through your trial ⏳</h2>
        <p>4 days left to experience everything Axiva Pro offers — unlimited deck generations, Brand Kit, PowerPoint export, interactive blocks, and more.</p>
        <p>Don't let your trial expire without trying the features that make Axiva indispensable.</p>
        <a href="${appUrl}/pricing" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">Upgrade Now — $28/mo →</a>
      `;
    case "day13":
      return `
        <h2 style="margin:0 0 16px">Your trial ends tomorrow 🔔</h2>
        <p>This is your last chance to lock in Axiva Pro before your account reverts to Free (3 deck limit, no Brand Kit, no PowerPoint export).</p>
        <p><strong>$28/mo</strong> — and if you're not satisfied, we offer a full 14-day refund guarantee. Zero risk.</p>
        <a href="${appUrl}/pricing" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">Keep Pro — Start Now →</a>
      `;
    default:
      return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate: require CRON_SECRET as Bearer token
  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const appUrl = req.headers.get("origin") || "https://axiva.ai";
    
    // Get all free-tier users who signed up in the last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (usersError) throw usersError;

    const recentUsers = (users?.users || []).filter(
      (u) => u.created_at && new Date(u.created_at) >= new Date(fourteenDaysAgo)
    );

    console.log(`[TRIAL-EMAILS] Processing ${recentUsers.length} recent users`);

    let emailsSent = 0;

    for (const user of recentUsers) {
      if (!user.email) continue;

      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if user is on paid plan
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("tier")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sub && sub.tier !== "free") continue;

      // Check if user has any decks
      const { count: deckCount } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const hasDeck = (deckCount || 0) > 0;

      // Check already sent emails
      const { data: sentEmails } = await supabase
        .from("trial_emails")
        .select("email_key")
        .eq("user_id", user.id);

      const sentKeys = new Set((sentEmails || []).map((e) => e.email_key));

      for (const drip of DRIP_SCHEDULE) {
        if (daysSinceSignup < drip.daysAfterSignup) continue;
        if (sentKeys.has(drip.key)) continue;
        if (drip.needsNoDeck && hasDeck) continue;
        if (drip.needsDeck && !hasDeck) continue;

        // Send email via Lovable AI (using LOVABLE_API_KEY)
        const body = getEmailBody(drip.key, appUrl);
        const htmlEmail = `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"></head>
          <body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#333;">
            ${body}
            <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
            <p style="font-size:12px;color:#999;margin-top:16px">Axiva — Executive-grade presentations, powered by AI.<br/>
            <a href="${appUrl}" style="color:#999">axiva.ai</a></p>
          </body></html>
        `;

        // Send via Resend
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          },
          body: JSON.stringify({
            from: "Axiva <jag@axiva.ai>",
            to: [user.email],
            subject: drip.subject,
            html: htmlEmail,
          }),
        });

        if (!resendRes.ok) {
          const errBody = await resendRes.text();
          console.error(`[TRIAL-EMAILS] Resend error for ${user.email} (${drip.key}):`, errBody);
          continue;
        }
        await resendRes.text();
        console.log(`[TRIAL-EMAILS] Sent "${drip.subject}" to ${user.email} (${drip.key})`);

        // Record the send
        await supabase.from("trial_emails").insert({
          user_id: user.id,
          email_key: drip.key,
        });

        emailsSent++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[TRIAL-EMAILS] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
