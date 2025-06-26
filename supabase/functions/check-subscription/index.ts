
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// EMERGENCY: Faster timeout helper
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    logStep(`ERROR in ${operation}`, { error: error.message });
    throw error;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user");
    
    // Reduced timeout to 2 seconds for user authentication
    const { data: userData, error: userError } = await withTimeout(
      supabaseClient.auth.getUser(token),
      2000,
      "user authentication"
    );
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // EMERGENCY FIX: Check database first for immediate response
    logStep("Checking database subscription record");
    let { data: subscriber } = await withTimeout(
      supabaseClient
        .from("subscribers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      2000,
      "subscriber query"
    );

    const now = new Date();
    const isTrialActive = subscriber?.trial_end && new Date(subscriber.trial_end) > now;
    
    // If no subscriber record exists, create one with early adopter legacy pricing
    if (!subscriber) {
      logStep("Creating new subscriber record");
      const { data: newSubscriber, error: insertError } = await withTimeout(
        supabaseClient
          .from("subscribers")
          .insert({
            email: user.email,
            user_id: user.id,
            is_trial_active: true,
            trial_start: now.toISOString(),
            trial_end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            legacy_pricing: true,
            price_amount: 1299,
            currency: 'gbp',
            subscribed: false,
            stripe_customer_id: null,
            subscription_tier: null,
            subscription_end: null,
          })
          .select()
          .single(),
        2000,
        "subscriber creation"
      );
      
      if (insertError) {
        logStep("Error creating subscriber", { error: insertError });
        throw insertError;
      }
      
      subscriber = newSubscriber;
      logStep("Created new subscriber with legacy pricing", { userId: user.id });
    }

    // EMERGENCY: Return database data immediately if user has active trial or subscription
    if (subscriber.subscribed || isTrialActive) {
      logStep("Returning cached subscription data immediately");
      const response = {
        subscribed: subscriber.subscribed,
        subscription_tier: subscriber.subscription_tier,
        subscription_end: subscriber.subscription_end,
        is_trial_active: isTrialActive,
        trial_end: subscriber.trial_end,
        legacy_pricing: subscriber.legacy_pricing ?? true,
        price_amount: subscriber.price_amount ?? 1299,
        currency: subscriber.currency ?? 'gbp'
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("Trial status checked", { 
      isTrialActive, 
      trialEnd: subscriber?.trial_end,
      subscribed: subscriber?.subscribed,
      legacyPricing: subscriber?.legacy_pricing,
      priceAmount: subscriber?.price_amount,
      currency: subscriber?.currency || 'gbp'
    });

    // Only check Stripe for non-trial, non-subscribed users
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("No Stripe key, returning database state");
      const response = { 
        subscribed: false,
        is_trial_active: isTrialActive,
        trial_end: subscriber?.trial_end,
        legacy_pricing: subscriber?.legacy_pricing ?? true,
        price_amount: subscriber?.price_amount ?? 1299,
        currency: subscriber?.currency ?? 'gbp'
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Stripe with very short timeout
    logStep("Initializing Stripe for subscription check");
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16",
      timeout: 3000, // Very short timeout
    });
    
    logStep("Checking for existing Stripe customer");
    const customers = await withTimeout(
      stripe.customers.list({ email: user.email, limit: 1 }),
      3000,
      "Stripe customer lookup"
    );
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, updating trial-only state");
      await withTimeout(
        supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          is_trial_active: isTrialActive,
          trial_start: subscriber?.trial_start,
          trial_end: subscriber?.trial_end,
          legacy_pricing: subscriber?.legacy_pricing ?? true,
          price_amount: subscriber?.price_amount ?? 1299,
          currency: subscriber?.currency ?? 'gbp',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' }),
        2000,
        "subscriber update (no customer)"
      );
      
      const response = { 
        subscribed: false,
        is_trial_active: isTrialActive,
        trial_end: subscriber?.trial_end,
        legacy_pricing: subscriber?.legacy_pricing ?? true,
        price_amount: subscriber?.price_amount ?? 1299,
        currency: subscriber?.currency ?? 'gbp'
      };
      logStep("Returning trial-only response", response);
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    logStep("Checking for active subscriptions");
    const subscriptions = await withTimeout(
      stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      }),
      3000,
      "Stripe subscription lookup"
    );
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionTier = "Premium";
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
    } else {
      logStep("No active subscription found");
    }

    logStep("Updating subscriber record with final status");
    await withTimeout(
      supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        is_trial_active: hasActiveSub ? false : isTrialActive,
        trial_start: subscriber?.trial_start,
        trial_end: subscriber?.trial_end,
        legacy_pricing: subscriber?.legacy_pricing ?? true,
        price_amount: subscriber?.price_amount ?? 1299,
        currency: subscriber?.currency ?? 'gbp',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' }),
      2000,
      "final subscriber update"
    );

    const finalResponse = {
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      is_trial_active: hasActiveSub ? false : isTrialActive,
      trial_end: subscriber?.trial_end,
      legacy_pricing: subscriber?.legacy_pricing ?? true,
      price_amount: subscriber?.price_amount ?? 1299,
      currency: subscriber?.currency ?? 'gbp'
    };

    logStep("Updated database with subscription info", finalResponse);

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    // Enhanced fallback with better error handling
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      fallback: {
        subscribed: false,
        is_trial_active: false,
        legacy_pricing: true,
        price_amount: 1299,
        currency: 'gbp'
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
