import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DRIP_SCHEDULE = [
  { key: "day1", daysAfterSignup: 0, subject: "Welcome to Axiva — create your first deck", needsDeck: false, needsNoDeck: false },
  { key: "day3", daysAfterSignup: 3, subject: "Haven't created a deck yet? Here's how", needsDeck: false, needsNoDeck: true },
  { key: "day7", daysAfterSignup: 7, subject: "You're halfway through your trial — unlock these features", needsDeck: false, needsNoDeck: false },
  { key: "day12", daysAfterSignup: 12, subject: "Your trial ends in 2 days — here's what you'll miss", needsDeck: false, needsNoDeck: false },
  { key: "day14", daysAfterSignup: 14, subject: "Last day of your trial — special offer inside", needsDeck: false, needsNoDeck: false },
];

function getEmailBody(key: string, appUrl: string, hasDeck: boolean, hasExport: boolean, hasBrandKit: boolean): string {
  switch (key) {
    case "day1":
      return `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111">Welcome to Axiva 👋</h2>
        <p style="color:#555;line-height:1.6">You've just unlocked 14 days of executive-grade presentations, powered by AI.</p>
        <p style="color:#555;line-height:1.6">Here's your quickstart checklist:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;color:#555">✅ Create your first deck (takes 90 seconds)</td></tr>
          <tr><td style="padding:8px 0;color:#555">🎨 Set up your Brand Kit</td></tr>
          <tr><td style="padding:8px 0;color:#555">📤 Export to PowerPoint</td></tr>
          <tr><td style="padding:8px 0;color:#555">🔗 Share a deck with your team</td></tr>
        </table>
        <a href="${appUrl}/create" style="display:inline-block;padding:14px 28px;background:#0057C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Create Your First Deck →</a>
      `;
    case "day3":
      return `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111">Create a deck in under 2 minutes ⚡</h2>
        <p style="color:#555;line-height:1.6">We noticed you haven't created a deck yet. Here's how easy it is:</p>
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0">
          <p style="margin:0 0 8px;color:#333;font-weight:600">Step 1:</p>
          <p style="margin:0 0 16px;color:#555">Type a one-line prompt like "Q4 board update with revenue metrics"</p>
          <p style="margin:0 0 8px;color:#333;font-weight:600">Step 2:</p>
          <p style="margin:0 0 16px;color:#555">Axiva generates 8–12 structured slides with data visualizations</p>
          <p style="margin:0 0 8px;color:#333;font-weight:600">Step 3:</p>
          <p style="margin:0;color:#555">Edit, export to PowerPoint, or share a live link</p>
        </div>
        <a href="${appUrl}/create" style="display:inline-block;padding:14px 28px;background:#0057C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Try It Now →</a>
      `;
    case "day7":
      return `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111">You're halfway through your trial ⏳</h2>
        <p style="color:#555;line-height:1.6">Here are the top features you should try before your trial ends:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${!hasBrandKit ? '<tr><td style="padding:10px 0;border-bottom:1px solid #eee"><strong style="color:#333">🎨 Brand Kit</strong><br/><span style="color:#777;font-size:13px">Your logo, fonts, and colors on every slide</span></td></tr>' : ''}
          ${!hasExport ? '<tr><td style="padding:10px 0;border-bottom:1px solid #eee"><strong style="color:#333">📤 PowerPoint Export</strong><br/><span style="color:#777;font-size:13px">Fully editable .pptx files your team can work with</span></td></tr>' : ''}
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee"><strong style="color:#333">🧩 Interactive Blocks</strong><br/><span style="color:#777;font-size:13px">Tabs, Toggle, Reveal for richer storytelling</span></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee"><strong style="color:#333">🖼️ AI Images</strong><br/><span style="color:#777;font-size:13px">Generated visuals that match your narrative</span></td></tr>
          <tr><td style="padding:10px 0"><strong style="color:#333">📊 KPI Dashboards</strong><br/><span style="color:#777;font-size:13px">Automatic chart blocks from your data</span></td></tr>
        </table>
        <a href="${appUrl}/dashboard" style="display:inline-block;padding:14px 28px;background:#0057C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Explore Features →</a>
      `;
    case "day12":
      return `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111">Your trial ends in 2 days 🔔</h2>
        <p style="color:#555;line-height:1.6">Here's what you'll lose when your trial expires:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;color:#555">❌ Unlimited deck generations</td></tr>
          <tr><td style="padding:8px 0;color:#555">❌ Brand Kit customization</td></tr>
          <tr><td style="padding:8px 0;color:#555">❌ PowerPoint export</td></tr>
          <tr><td style="padding:8px 0;color:#555">❌ Interactive blocks (Tabs, Toggle, Reveal)</td></tr>
          <tr><td style="padding:8px 0;color:#555">❌ AI-generated images</td></tr>
        </table>
        <p style="color:#555;line-height:1.6"><strong>$28/mo</strong> — 14-day refund guarantee. Zero risk.</p>
        <a href="${appUrl}/pricing" style="display:inline-block;padding:14px 28px;background:#0057C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Upgrade to Pro →</a>
      `;
    case "day14":
      return `
        <h2 style="margin:0 0 16px;font-size:22px;color:#111">Last day — your trial expires tonight 🚨</h2>
        <p style="color:#555;line-height:1.6">This is your final chance to keep Axiva Pro. After today, your account reverts to Free (3 deck limit, no Brand Kit, no PowerPoint export).</p>
        <div style="background:#f0f7ff;border:1px solid #0057C3;border-radius:8px;padding:20px;margin:16px 0;text-align:center">
          <p style="margin:0 0 4px;font-size:18px;font-weight:bold;color:#0057C3">Special offer: 20% off your first 3 months</p>
          <p style="margin:0;color:#555;font-size:14px">Use code <strong>LAUNCH20</strong> at checkout</p>
        </div>
        <a href="${appUrl}/pricing" style="display:inline-block;padding:14px 28px;background:#0057C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Keep Pro — Upgrade Now →</a>
      `;
    default:
      return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const appUrl = "https://axiva.ai";
    const fourteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

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

      // Check user activity for personalized content
      const [
        { count: deckCount },
        { count: exportCount },
        { data: profileData },
      ] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("exports").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("brand_kit").eq("user_id", user.id).maybeSingle(),
      ]);

      const hasDeck = (deckCount || 0) > 0;
      const hasExport = (exportCount || 0) > 0;
      const hasBrandKit = profileData?.brand_kit &&
        typeof profileData.brand_kit === "object" &&
        ((profileData.brand_kit as any)?.logoUrl || (profileData.brand_kit as any)?.primaryColor);

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

        const body = getEmailBody(drip.key, appUrl, hasDeck, !!hasExport, !!hasBrandKit);
        const htmlEmail = `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#333;background:#fff;">
            ${body}
            <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
            <p style="font-size:12px;color:#999;margin-top:16px">Axiva — Executive-grade presentations, powered by AI.<br/>
            <a href="${appUrl}" style="color:#999">axiva.ai</a></p>
          </body></html>
        `;

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
