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
    const { action, code, origin, refresh_token } = requestBody

    if (action === 'get_auth_url') {
      console.log('Generating Google Analytics auth URL...')
      
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      
      console.log('Environment check:')
      console.log('- GOOGLE_CLIENT_ID:', clientId ? 'Present' : 'Missing')
      console.log('- Origin from request:', origin)
      
      if (!clientId) {
        const error = 'Google Client ID not configured. Please add GOOGLE_CLIENT_ID to your Supabase secrets.'
        console.error(error)
        return new Response(JSON.stringify({ error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Use React route for popup callback - no .html extension
      const redirectUri = `${origin}/auth/google/callback`
      const scope = 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users.readonly'
      
      console.log('OAuth configuration:')
      console.log('- Redirect URI (React route):', redirectUri)
      console.log('- Scope:', scope)
      console.log('- Client ID (first 10 chars):', clientId.substring(0, 10) + '...')
      
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=select_account`

      console.log('Generated auth URL (first 100 chars):', authUrl.substring(0, 100) + '...')

      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'refresh_token' && refresh_token) {
      console.log('Refreshing Google Analytics token...')
      
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      
      if (!clientId || !clientSecret) {
        const error = 'Google OAuth credentials not configured.'
        console.error(error)
        return new Response(JSON.stringify({ error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const refreshPayload = {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token,
        grant_type: 'refresh_token'
      }
      
      console.log('Requesting token refresh...')
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(refreshPayload)
      })

      const tokenData = await tokenResponse.json()
      
      console.log('Token refresh response status:', tokenResponse.status)
      
      if (tokenData.error) {
        const error = `Google token refresh error: ${tokenData.error_description || tokenData.error}`
        console.error(error)
        return new Response(JSON.stringify({ error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (!tokenData.access_token) {
        const error = 'No access token received from token refresh'
        console.error(error)
        return new Response(JSON.stringify({ error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Calculate proper expiration time (default to 1 hour if not provided)
      const expiresIn = tokenData.expires_in || 3600
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

      console.log('Updating connection with refreshed token...')
      
      // Update the connection with new token
      const { error: updateError } = await supabaseClient
        .from('api_connections')
        .update({
          access_token: tokenData.access_token,
          expires_at: expiresAt,
          // Keep the existing refresh token if new one not provided
          refresh_token: tokenData.refresh_token || refresh_token
        })
        .eq('user_id', user.id)
        .eq('provider', 'google_analytics')

      if (updateError) {
        console.error('Database update error:', updateError)
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Successfully refreshed Google Analytics token')

      return new Response(JSON.stringify({ 
        success: true,
        access_token: tokenData.access_token,
        expires_in: expiresIn
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (code) {
      console.log('Processing OAuth callback with code:', code.substring(0, 10) + '...')
      
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      
      console.log('OAuth credentials check:')
      console.log('- Client ID:', clientId ? 'Present' : 'Missing')
      console.log('- Client Secret:', clientSecret ? 'Present' : 'Missing')
      
      if (!clientId || !clientSecret) {
        const error = 'Google OAuth credentials not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your Supabase secrets.'
        console.error(error)
        return new Response(JSON.stringify({ error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Use same React route for token exchange
      const redirectUri = `${origin}/auth/google/callback`
      console.log('Token exchange redirect URI:', redirectUri)
      
      // Exchange code for access token
      const tokenPayload = {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }
      
      console.log('Requesting token exchange...')
      console.log('Token payload (without secrets):', {
        ...tokenPayload,
        client_secret: '[HIDDEN]',
        code: code.substring(0, 10) + '...'
      })
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(tokenPayload)
      })

      const tokenData = await tokenResponse.json()
      
      console.log('Token response status:', tokenResponse.status)
      console.log('Token response data (sanitized):', {
        ...tokenData,
        access_token: tokenData.access_token ? tokenData.access_token.substring(0, 20) + '...' : 'Missing',
        refresh_token: tokenData.refresh_token ? '[PRESENT]' : 'Missing',
        expires_in: tokenData.expires_in
      })

      if (tokenData.error) {
        const error = `Google OAuth error: ${tokenData.error_description || tokenData.error}`
        console.error(error)
        return new Response(JSON.stringify({ error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (!tokenData.access_token) {
        const error = 'No access token received from Google'
        console.error(error)
        return new Response(JSON.stringify({ error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Calculate proper expiration time
      const expiresIn = tokenData.expires_in || 3600 // Default to 1 hour if not provided
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

      console.log('Storing connection in database...')
      console.log('- Token expires in:', expiresIn, 'seconds')
      console.log('- Expires at:', expiresAt)
      
      // Store the connection
      const { error } = await supabaseClient
        .from('api_connections')
        .upsert({
          user_id: user.id,
          provider: 'google_analytics',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt
        })

      if (error) {
        console.error('Database error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Successfully stored Google Analytics connection')

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.error('Invalid request - missing action or code')
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Google Analytics auth error:', error)
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
