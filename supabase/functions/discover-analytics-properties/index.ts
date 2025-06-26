
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { provider } = await req.json()

    // Get API connection
    const { data: connection } = await supabaseClient
      .from('api_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single()

    if (!connection) {
      return new Response(JSON.stringify({ error: 'No API connection found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let properties = []

    if (provider === 'google_analytics') {
      console.log('Starting Google Analytics property discovery...')
      console.log('Access token available:', connection.access_token ? 'Yes' : 'No')

      try {
        // Discover Google Analytics properties using GA4 Admin API
        console.log('Fetching Google Analytics accounts...')
        const accountsResponse = await fetch('https://analyticsadmin.googleapis.com/v1beta/accounts', {
          headers: {
            'Authorization': `Bearer ${connection.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Accounts API response status:', accountsResponse.status)
        
        if (!accountsResponse.ok) {
          const errorText = await accountsResponse.text()
          console.error('Accounts API error:', errorText)
          
          if (accountsResponse.status === 403) {
            return new Response(JSON.stringify({ 
              error: 'insufficient_permissions',
              message: 'Google Analytics Admin API access denied. Please reconnect with proper permissions.'
            }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          throw new Error(`Google Analytics API error: ${accountsResponse.status} - ${errorText}`)
        }

        const accountsData = await accountsResponse.json()
        console.log('Accounts found:', accountsData.accounts?.length || 0)

        if (accountsData.accounts) {
          for (const account of accountsData.accounts) {
            console.log(`Fetching properties for account: ${account.displayName}`)
            
            // Extract account ID from account.name (e.g., "accounts/41428519" -> "41428519")
            const accountId = account.name.split('/').pop()
            console.log(`Extracted account ID: ${accountId}`)
            
            // Get properties for each account using the correct URL format
            const propertiesUrl = `https://analyticsadmin.googleapis.com/v1beta/accounts/${accountId}/properties`
            console.log(`Properties URL: ${propertiesUrl}`)
            
            const propertiesResponse = await fetch(propertiesUrl, {
              headers: {
                'Authorization': `Bearer ${connection.access_token}`,
                'Content-Type': 'application/json'
              }
            })

            if (!propertiesResponse.ok) {
              console.error(`Properties API error for account ${accountId}:`, propertiesResponse.status)
              const errorText = await propertiesResponse.text()
              console.error(`Properties API error details:`, errorText)
              continue
            }

            const propertiesData = await propertiesResponse.json()
            console.log(`Properties found for ${account.displayName}:`, propertiesData.properties?.length || 0)

            if (propertiesData.properties) {
              for (const property of propertiesData.properties) {
                properties.push({
                  provider: 'google_analytics',
                  property_id: property.name.split('/').pop(),
                  property_name: property.displayName,
                  account_id: accountId,
                  account_name: account.displayName
                })
              }
            }
          }
        }
      } catch (error) {
        console.error('Google Analytics discovery error:', error)
        
        if (error.message?.includes('403') || error.message?.includes('insufficient_permissions')) {
          return new Response(JSON.stringify({ 
            error: 'insufficient_permissions',
            message: 'Google Analytics Admin API access denied. Please reconnect with proper permissions.'
          }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        throw error
      }
    } else if (provider === 'instagram') {
      // Discover Instagram business accounts
      const accountsResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${connection.access_token}`)
      const accountsData = await accountsResponse.json()

      if (accountsData.data) {
        for (const account of accountsData.data) {
          // Check if account has Instagram business account
          const igResponse = await fetch(`https://graph.facebook.com/v18.0/${account.id}?fields=instagram_business_account&access_token=${connection.access_token}`)
          const igData = await igResponse.json()

          if (igData.instagram_business_account) {
            properties.push({
              provider: 'instagram',
              property_id: igData.instagram_business_account.id,
              property_name: account.name,
              account_id: account.id,
              account_name: account.name
            })
          }
        }
      }
    }

    console.log(`Total properties discovered: ${properties.length}`)

    // Store discovered properties
    if (properties.length > 0) {
      // Clear existing properties for this provider
      await supabaseClient
        .from('user_analytics_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', provider)

      // Insert new properties
      const propertiesToInsert = properties.map(prop => ({
        ...prop,
        user_id: user.id
      }))

      const { error: insertError } = await supabaseClient
        .from('user_analytics_properties')
        .insert(propertiesToInsert)

      if (insertError) {
        console.error('Error inserting properties:', insertError)
        throw insertError
      }

      console.log('Properties stored successfully')
    }

    return new Response(JSON.stringify({ properties }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error discovering properties:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the function logs for more information'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
