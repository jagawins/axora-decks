import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Find active or trialing subscriptions
    const activeSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const trialingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });

    const allSubs = [...activeSubs.data, ...trialingSubs.data];
    if (allSubs.length === 0) {
      throw new Error("No active subscription found to cancel");
    }

    const subscription = allSubs[0];
    logStep("Canceling subscription", { subscriptionId: subscription.id, status: subscription.status });

    // Cancel immediately
    const canceled = await stripe.subscriptions.cancel(subscription.id);
    logStep("Subscription canceled", { subscriptionId: canceled.id, status: canceled.status });

    // Send cancellation confirmation email
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "there";
    try {
      const emailResponse = await supabaseClient.functions.invoke("send-transactional-email", {
        body: {
          templateName: "subscription-canceled",
          recipientEmail: user.email,
          idempotencyKey: `cancel-${canceled.id}`,
          templateData: { name: userName },
        },
      });
      logStep("Cancellation email sent", { success: !emailResponse.error });
    } catch (emailErr) {
      // Non-fatal — log and continue
      logStep("Failed to send cancellation email (non-fatal)", { error: String(emailErr) });
    }

    return new Response(JSON.stringify({ success: true, status: canceled.status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
