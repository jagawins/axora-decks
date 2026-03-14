import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Newsletter Broadcast
 * 
 * Sends an email to all active subscribers.
 * Requires authenticated user (admin check via allowed emails).
 * Uses Resend API for delivery.
 */

const ADMIN_EMAILS = ["jag@axiva.ai", "jag@verityaxis.com"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { subject, bodyHtml, preview } = body;

    if (!subject || !bodyHtml) {
      return new Response(JSON.stringify({ error: "subject and bodyHtml are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("subscribed", true);

    if (subError) throw subError;

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ error: "No active subscribers", count: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Preview mode — return count without sending
    if (preview) {
      return new Response(JSON.stringify({
        preview: true,
        subscriberCount: subscribers.length,
        subject,
        sampleEmails: subscribers.slice(0, 5).map(s => s.email),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build full HTML email
    const fullHtml = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#333;background:#fff;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:22px;font-weight:800;letter-spacing:2px;color:#111;">AXIVA</span>
        </div>
        ${bodyHtml}
        <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
        <p style="font-size:11px;color:#aaa;text-align:center;margin-top:16px;">
          Axiva — AI Executive Deck Generator<br/>
          <a href="https://axiva.ai" style="color:#aaa;">axiva.ai</a><br/><br/>
          <a href="https://axiva.ai/newsletter/unsubscribe?email={{email}}" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>
        </p>
      </body></html>
    `;

    // Send to each subscriber via Resend (batch)
    let sentCount = 0;
    const batchSize = 50; // Resend rate limit friendly
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const promises = batch.map(async (sub) => {
        try {
          const personalizedHtml = fullHtml.replace("{{email}}", encodeURIComponent(sub.email));
          
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "AXIVA <jag@axiva.ai>",
              to: [sub.email],
              subject,
              html: personalizedHtml,
            }),
          });

          if (res.ok) {
            sentCount++;
          } else {
            const err = await res.text();
            console.error(`[BROADCAST] Failed to send to ${sub.email}:`, err);
          }
        } catch (e) {
          console.error(`[BROADCAST] Error sending to ${sub.email}:`, e);
        }
      });

      await Promise.all(promises);
    }

    // Log the broadcast
    await supabase.from("newsletter_broadcasts").insert({
      subject,
      body_html: bodyHtml,
      sent_by: user.id,
      recipient_count: sentCount,
    });

    console.log(`[BROADCAST] Sent "${subject}" to ${sentCount}/${subscribers.length} subscribers`);

    return new Response(JSON.stringify({
      success: true,
      sentCount,
      totalSubscribers: subscribers.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[BROADCAST] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
