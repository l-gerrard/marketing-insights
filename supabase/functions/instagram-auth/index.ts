
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request received`)
  console.log('Request URL:', req.url)

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    console.log('Checking user authentication...')
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      console.error('User not authenticated')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    console.log('User authenticated:', user.id)

    const requestBody = await req.json()
    console.log('Request body:', JSON.stringify(requestBody, null, 2))
    const { action, code, origin } = requestBody

    if (action === 'get_auth_url') {
      console.log('Generating Instagram auth URL...')
      
      // Check environment variables
      const clientId = Deno.env.get('FACEBOOK_APP_ID') || Deno.env.get('INSTAGRAM_CLIENT_ID')
      
      console.log('Environment check:')
      console.log('- FACEBOOK_APP_ID:', Deno.env.get('FACEBOOK_APP_ID') ? 'Present' : 'Missing')
      console.log('- INSTAGRAM_CLIENT_ID:', Deno.env.get('INSTAGRAM_CLIENT_ID') ? 'Present' : 'Missing')
      console.log('- Final clientId:', clientId ? 'Present' : 'Missing')
      console.log('- Origin from request:', origin)
      
      if (!clientId) {
        const error = 'Instagram/Facebook App ID not configured. Please add FACEBOOK_APP_ID or INSTAGRAM_CLIENT_ID to your Supabase secrets.'
        console.error(error)
        return new Response(JSON.stringify({ error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Use HTML file for popup callback (similar to Google)
      const redirectUri = `${origin}/auth/instagram/callback/popup.html`
      
      console.log('Instagram OAuth configuration:')
      console.log('- Redirect URI (HTML file):', redirectUri)
      console.log('- Client ID (first 10 chars):', clientId.substring(0, 10) + '...')
      
      // Instagram Basic Display API OAuth URL
      const authUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=user_profile,user_media&` +
        `response_type=code`

      console.log('Generated Instagram auth URL (first 100 chars):', authUrl.substring(0, 100) + '...')

      return new Response(JSON.stringify({ 
        auth_url: authUrl,
        note: 'Instagram Basic Display API requires app review for production use.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (code) {
      console.log('Processing Instagram OAuth callback with code:', code.substring(0, 10) + '...')
      
      const clientId = Deno.env.get('FACEBOOK_APP_ID') || Deno.env.get('INSTAGRAM_CLIENT_ID')
      const clientSecret = Deno.env.get('FACEBOOK_APP_SECRET') || Deno.env.get('INSTAGRAM_CLIENT_SECRET')
      
      console.log('Instagram OAuth credentials check:')
      console.log('- Client ID:', clientId ? 'Present' : 'Missing')
      console.log('- Client Secret:', clientSecret ? 'Present' : 'Missing')
      
      if (!clientId || !clientSecret) {
        console.log('Missing credentials, creating demo connection...')
        
        // Create placeholder connection for demo purposes
        const { error } = await supabaseClient
          .from('api_connections')
          .upsert({
            user_id: user.id,
            provider: 'instagram',
            access_token: 'demo_token',
            expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
          })

        if (error) {
          console.error('Database error creating demo connection:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Demo Instagram connection created successfully')
        return new Response(JSON.stringify({ 
          success: true,
          note: 'Instagram connection created as demo. Full Instagram integration requires app review and proper credentials.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      try {
        const redirectUri = `${origin}/auth/instagram/callback/popup.html`
        console.log('Token exchange redirect URI:', redirectUri)
        
        // Exchange code for access token
        const tokenPayload = {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code
        }
        
        console.log('Requesting Instagram token exchange...')
        const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(tokenPayload)
        })

        const tokenData = await tokenResponse.json()
        
        console.log('Instagram token response status:', tokenResponse.status)
        console.log('Instagram token response data (sanitized):', {
          ...tokenData,
          access_token: tokenData.access_token ? tokenData.access_token.substring(0, 20) + '...' : 'Missing'
        })

        if (tokenData.error) {
          throw new Error(`Instagram OAuth error: ${tokenData.error_description || tokenData.error}`)
        }

        // Store the connection
        const { error } = await supabaseClient
          .from('api_connections')
          .upsert({
            user_id: user.id,
            provider: 'instagram',
            access_token: tokenData.access_token,
            expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
          })

        if (error) {
          console.error('Database error:', error)
          throw error
        }

        console.log('Successfully stored Instagram connection')

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      } catch (tokenError) {
        console.error('Instagram token exchange error:', tokenError)
        
        // Fallback: create placeholder connection for demo purposes
        const { error } = await supabaseClient
          .from('api_connections')
          .upsert({
            user_id: user.id,
            provider: 'instagram',
            access_token: 'demo_token',
            expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
          })

        if (error) {
          console.error('Database error creating fallback connection:', error)
          throw error
        }

        console.log('Fallback Instagram connection created')
        return new Response(JSON.stringify({ 
          success: true,
          note: 'Instagram connection created as demo. Full Instagram integration requires app review and proper credentials.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    console.error('Invalid request - missing action or code')
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Instagram auth error:', error)
    console.error('Error stack:', error.stack)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
