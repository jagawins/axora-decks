import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Weekly Deck Analytics Email
 * 
 * Sends each user a summary of their deck views from the past 7 days.
 * "Your deck was viewed 14 times this week. Slide 3 got the most attention."
 * 
 * Run via Supabase cron: every Monday at 9am UTC
 * pg_cron: SELECT cron.schedule('weekly-analytics', '0 9 * * 1', $$SELECT ... $$);
 */

interface DeckSummary {
  project_id: string;
  title: string;
  total_views: number;
  unique_viewers: number;
  top_slide_index: number | null;
  top_slide_avg_time: number | null;
  is_shared: boolean;
}

function buildEmailHtml(
  userName: string,
  decks: DeckSummary[],
  totalViews: number,
  appUrl: string,
  isPaid: boolean
): string {
  const deckRows = decks
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 5)
    .map((d) => {
      const topSlide = d.top_slide_index !== null ? `Slide ${d.top_slide_index + 1}` : "—";
      const avgTime = d.top_slide_avg_time ? `${d.top_slide_avg_time}s avg` : "";
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#111;">${escapeHtml(d.title)}</strong>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;">
            <strong style="color:#6C3AFF;font-size:18px;">${d.total_views}</strong>
            <br/><span style="font-size:11px;color:#888;">${d.unique_viewers} unique</span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;">
            <span style="color:#555;">${topSlide}</span>
            ${avgTime ? `<br/><span style="font-size:11px;color:#888;">${avgTime}</span>` : ""}
          </td>
        </tr>
      `;
    })
    .join("");

  const analyticsTeaser = !isPaid
    ? `
      <div style="margin:24px 0;padding:16px 20px;background:#f8f6ff;border:1px solid #e8e0ff;border-radius:12px;">
        <p style="margin:0 0 8px;font-weight:600;color:#6C3AFF;font-size:14px;">📊 Want deeper analytics?</p>
        <p style="margin:0 0 12px;font-size:13px;color:#555;">Pro users see slide-by-slide heatmaps, viewer engagement scores, and time-on-slide breakdowns.</p>
        <a href="${appUrl}/pricing" style="display:inline-block;padding:8px 20px;background:#6C3AFF;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">Unlock Full Analytics →</a>
      </div>
    `
    : "";

  const shareTeaser = decks.some((d) => !d.is_shared)
    ? `
      <div style="margin:24px 0;padding:16px 20px;background:#f0fdf4;border:1px solid #d1fae5;border-radius:12px;">
        <p style="margin:0 0 8px;font-weight:600;color:#059669;font-size:14px;">💡 Tip: Share your decks to get more views</p>
        <p style="margin:0;font-size:13px;color:#555;">Some of your decks aren't shared yet. Enable link sharing in the editor to start tracking viewer engagement.</p>
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#333;background:#fff;">
      
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:22px;font-weight:800;letter-spacing:2px;color:#111;">AXIVA</span>
      </div>

      <h2 style="margin:0 0 4px;font-size:20px;color:#111;">Your Weekly Deck Report</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#888;">Week of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <!-- Summary stat -->
      <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#f8f6ff,#f0f0ff);border-radius:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:42px;font-weight:800;color:#6C3AFF;">${totalViews}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#666;">total views this week</p>
      </div>

      ${totalViews > 0 ? `
        <!-- Deck breakdown table -->
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#fafafa;">
              <th style="padding:10px 16px;text-align:left;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Deck</th>
              <th style="padding:10px 16px;text-align:center;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Views</th>
              <th style="padding:10px 16px;text-align:center;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Top Slide</th>
            </tr>
          </thead>
          <tbody>
            ${deckRows}
          </tbody>
        </table>
      ` : `
        <div style="text-align:center;padding:24px;color:#888;">
          <p>No views this week. Share a deck to start tracking!</p>
          <a href="${appUrl}/dashboard" style="display:inline-block;padding:10px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;">Open Dashboard →</a>
        </div>
      `}

      ${analyticsTeaser}
      ${shareTeaser}

      <div style="text-align:center;margin-top:24px;">
        <a href="${appUrl}/dashboard" style="display:inline-block;padding:12px 28px;background:#111;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">View Full Analytics →</a>
      </div>

      <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
      <p style="font-size:11px;color:#aaa;text-align:center;margin-top:16px;">
        Axiva — AI Executive Deck Generator<br/>
        <a href="${appUrl}" style="color:#aaa;">axiva.ai</a>
        <br/><br/>
        <a href="${appUrl}/settings?unsubscribe=weekly" style="color:#aaa;text-decoration:underline;">Unsubscribe from weekly reports</a>
      </p>
    </body></html>
  `;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const appUrl = "https://axiva.ai";
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all users who have projects with views in the last 7 days
    const { data: viewData, error: viewError } = await supabase
      .from("deck_views")
      .select("project_id, viewer_hash, slide_index, duration_seconds, created_at")
      .gte("created_at", sevenDaysAgo);

    if (viewError) throw viewError;
    if (!viewData || viewData.length === 0) {
      console.log("[WEEKLY-ANALYTICS] No views in the past week");
      return new Response(JSON.stringify({ success: true, emailsSent: 0, reason: "no views" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group views by project_id
    const viewsByProject = new Map<string, typeof viewData>();
    for (const v of viewData) {
      if (!viewsByProject.has(v.project_id)) viewsByProject.set(v.project_id, []);
      viewsByProject.get(v.project_id)!.push(v);
    }

    // Get project details + owners
    const projectIds = Array.from(viewsByProject.keys());
    const { data: projects, error: projError } = await supabase
      .from("projects")
      .select("id, title, user_id, share_enabled")
      .in("id", projectIds);

    if (projError) throw projError;

    // Group projects by user
    const userDecks = new Map<string, DeckSummary[]>();
    for (const proj of projects || []) {
      const views = viewsByProject.get(proj.id) || [];
      const uniqueViewers = new Set(views.filter((v) => v.viewer_hash).map((v) => v.viewer_hash)).size;

      // Find top slide by total view time
      const slideTime = new Map<number, { totalTime: number; count: number }>();
      for (const v of views) {
        if (v.slide_index !== null && v.duration_seconds) {
          const existing = slideTime.get(v.slide_index) || { totalTime: 0, count: 0 };
          existing.totalTime += v.duration_seconds;
          existing.count += 1;
          slideTime.set(v.slide_index, existing);
        }
      }

      let topSlideIndex: number | null = null;
      let topSlideAvgTime: number | null = null;
      let maxAvgTime = 0;
      for (const [idx, data] of slideTime) {
        const avg = data.totalTime / data.count;
        if (avg > maxAvgTime) {
          maxAvgTime = avg;
          topSlideIndex = idx;
          topSlideAvgTime = Math.round(avg);
        }
      }

      const summary: DeckSummary = {
        project_id: proj.id,
        title: proj.title || "Untitled",
        total_views: views.length,
        unique_viewers: uniqueViewers || views.length,
        top_slide_index: topSlideIndex,
        top_slide_avg_time: topSlideAvgTime,
        is_shared: !!proj.share_enabled,
      };

      if (!userDecks.has(proj.user_id)) userDecks.set(proj.user_id, []);
      userDecks.get(proj.user_id)!.push(summary);
    }

    let emailsSent = 0;

    for (const [userId, decks] of userDecks) {
      // Get user email
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData?.user?.email) continue;

      const email = userData.user.email;
      const userName = userData.user.user_metadata?.full_name || email.split("@")[0];

      // Check subscription tier
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("tier")
        .eq("user_id", userId)
        .maybeSingle();

      const isPaid = sub && sub.tier !== "free";
      const totalViews = decks.reduce((sum, d) => sum + d.total_views, 0);

      // Don't email if 0 views (shouldn't happen but safety check)
      if (totalViews === 0) continue;

      // Check if we already sent this week
      const weekKey = `weekly_${new Date().toISOString().slice(0, 10)}`;
      const { data: alreadySent } = await supabase
        .from("trial_emails")
        .select("id")
        .eq("user_id", userId)
        .eq("email_key", weekKey)
        .maybeSingle();

      if (alreadySent) continue;

      const html = buildEmailHtml(userName, decks, totalViews, appUrl, !!isPaid);

      // Top deck for subject line
      const topDeck = decks.sort((a, b) => b.total_views - a.total_views)[0];
      const subject = totalViews === 1
        ? `Your deck "${topDeck.title}" was viewed this week`
        : `Your decks got ${totalViews} views this week`;

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Axiva <jag@axiva.ai>",
          to: [email],
          subject,
          html,
        }),
      });

      if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error(`[WEEKLY-ANALYTICS] Resend error for ${email}:`, err);
        continue;
      }

      // Record the send
      await supabase.from("trial_emails").insert({
        user_id: userId,
        email_key: weekKey,
      });

      emailsSent++;
      console.log(`[WEEKLY-ANALYTICS] Sent to ${email}: ${totalViews} views across ${decks.length} decks`);
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent, usersProcessed: userDecks.size }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WEEKLY-ANALYTICS] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
