
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { WelcomeEmail } from "./_templates/welcome-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, email, firstName = '', lastName = '' }: WelcomeEmailRequest = await req.json();

    console.log(`Processing welcome email request for user ${userId} (${email})`);

    // Check if welcome email has already been sent
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('welcome_email_sent')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error checking profile:', profileError);
      throw new Error(`Failed to check profile: ${profileError.message}`);
    }

    if (profile?.welcome_email_sent) {
      console.log(`Welcome email already sent for user ${userId}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Welcome email already sent",
          alreadySent: true 
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Get user's subscription details for the email
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('trial_end, price_amount, currency')
      .eq('user_id', userId)
      .single();

    const trialEndDate = subscriber?.trial_end ? new Date(subscriber.trial_end).toLocaleDateString() : null;
    const priceAmount = subscriber?.price_amount ? (subscriber.price_amount / 100).toFixed(2) : '12.99';
    const currency = subscriber?.currency?.toUpperCase() || 'GBP';

    console.log(`Sending welcome email to ${email} for user ${userId}`);

    // Render the email template
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        firstName: firstName || 'Valued User',
        trialEndDate,
        priceAmount,
        currency,
      })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "AI Marketing Bestie <aimarketingbestie@gmail.com>",
      to: [email],
      subject: "🎉 Welcome to AI Marketing Bestie - Your Analytics Journey Starts Now!",
      html,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Mark welcome email as sent in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        welcome_email_sent: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Don't throw error here as email was sent successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Welcome email sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
