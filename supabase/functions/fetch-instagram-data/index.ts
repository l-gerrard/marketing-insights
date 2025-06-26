
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabaseClient.auth.getUser(token)
    
    if (!user?.user) {
      throw new Error('Unauthorized')
    }

    const userId = user.user.id

    // Get Instagram connection details
    const { data: connection } = await supabaseClient
      .from('api_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'instagram')
      .single()

    if (!connection) {
      throw new Error('Instagram connection not found')
    }

    const accessToken = connection.access_token
    const instagramUserId = connection.configuration?.user_id

    if (!instagramUserId) {
      throw new Error('Instagram user ID not found in connection')
    }

    console.log('🔄 Starting Instagram data fetch for user:', userId)

    // Fetch Instagram posts
    await fetchInstagramPosts(supabaseClient, userId, instagramUserId, accessToken)
    
    // Fetch Instagram insights for posts
    await fetchInstagramInsights(supabaseClient, userId, accessToken)
    
    // Fetch account insights
    await fetchAccountInsights(supabaseClient, userId, instagramUserId, accessToken)
    
    // Fetch audience data
    await fetchAudienceData(supabaseClient, userId, instagramUserId, accessToken)

    console.log('✅ Instagram data fetch completed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Instagram data fetched successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error fetching Instagram data:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function fetchInstagramPosts(supabaseClient: any, userId: string, instagramUserId: string, accessToken: string) {
  try {
    console.log('📸 Fetching Instagram posts...')
    
    // Fetch user's media using Instagram Basic Display API
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}`
    )
    
    if (!mediaResponse.ok) {
      throw new Error(`Instagram API error: ${mediaResponse.status}`)
    }
    
    const mediaData = await mediaResponse.json()
    
    if (!mediaData.data) {
      console.log('No media data found')
      return
    }

    // Insert posts into database
    for (const post of mediaData.data) {
      await supabaseClient
        .from('instagram_posts')
        .upsert({
          user_id: userId,
          instagram_post_id: post.id,
          caption: post.caption || null,
          media_type: post.media_type,
          media_url: post.media_url,
          permalink: post.permalink,
          timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'instagram_post_id'
        })
    }
    
    console.log(`✅ Stored ${mediaData.data.length} Instagram posts`)
    
  } catch (error) {
    console.error('❌ Error fetching Instagram posts:', error)
    throw error
  }
}

async function fetchInstagramInsights(supabaseClient: any, userId: string, accessToken: string) {
  try {
    console.log('📊 Fetching Instagram post insights...')
    
    // Get posts from database to fetch insights for
    const { data: posts } = await supabaseClient
      .from('instagram_posts')
      .select('instagram_post_id')
      .eq('user_id', userId)
      .limit(50) // Limit to recent posts to avoid rate limits
    
    if (!posts || posts.length === 0) {
      console.log('No posts found to fetch insights for')
      return
    }

    // Fetch insights for each post
    for (const post of posts) {
      try {
        // Note: Instagram Basic Display API doesn't provide insights
        // For insights, you need Instagram Graph API with business account
        // This is a placeholder for the structure - actual implementation would need Graph API
        
        const insightsResponse = await fetch(
          `https://graph.instagram.com/${post.instagram_post_id}/insights?metric=impressions,reach,likes,comments,saves,shares&access_token=${accessToken}`
        )
        
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json()
          
          if (insightsData.data) {
            for (const insight of insightsData.data) {
              await supabaseClient
                .from('instagram_insights')
                .upsert({
                  user_id: userId,
                  instagram_post_id: post.instagram_post_id,
                  metric_name: insight.name,
                  metric_value: insight.values[0]?.value || 0,
                  period: insight.period || 'lifetime'
                }, {
                  onConflict: 'instagram_post_id,metric_name,period'
                })
            }
          }
        }
      } catch (postError) {
        console.log(`⚠️ Could not fetch insights for post ${post.instagram_post_id}:`, postError.message)
      }
    }
    
    console.log('✅ Instagram post insights processing completed')
    
  } catch (error) {
    console.error('❌ Error fetching Instagram insights:', error)
    // Don't throw - this is optional data
  }
}

async function fetchAccountInsights(supabaseClient: any, userId: string, instagramUserId: string, accessToken: string) {
  try {
    console.log('📈 Fetching Instagram account insights...')
    
    // Fetch account insights (requires Instagram Graph API and business account)
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const since = thirtyDaysAgo.toISOString().split('T')[0]
    const until = today.toISOString().split('T')[0]
    
    const metricsToFetch = ['impressions', 'reach', 'profile_views', 'website_clicks']
    
    for (const metric of metricsToFetch) {
      try {
        const insightsResponse = await fetch(
          `https://graph.instagram.com/${instagramUserId}/insights?metric=${metric}&period=days_28&since=${since}&until=${until}&access_token=${accessToken}`
        )
        
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json()
          
          if (insightsData.data && insightsData.data[0]) {
            const insight = insightsData.data[0]
            
            await supabaseClient
              .from('instagram_account_insights')
              .upsert({
                user_id: userId,
                metric_name: insight.name,
                metric_value: insight.values[0]?.value || 0,
                period: insight.period,
                date_range_start: since,
                date_range_end: until
              }, {
                onConflict: 'user_id,metric_name,period,date_range_start'
              })
          }
        }
      } catch (metricError) {
        console.log(`⚠️ Could not fetch ${metric} insights:`, metricError.message)
      }
    }
    
    console.log('✅ Account insights processing completed')
    
  } catch (error) {
    console.error('❌ Error fetching account insights:', error)
    // Don't throw - this is optional data
  }
}

async function fetchAudienceData(supabaseClient: any, userId: string, instagramUserId: string, accessToken: string) {
  try {
    console.log('👥 Fetching Instagram audience data...')
    
    // Fetch basic account info
    const accountResponse = await fetch(
      `https://graph.instagram.com/me?fields=account_type,media_count&access_token=${accessToken}`
    )
    
    if (accountResponse.ok) {
      const accountData = await accountResponse.json()
      
      // Store media count as audience metric
      if (accountData.media_count !== undefined) {
        await supabaseClient
          .from('instagram_audience')
          .upsert({
            user_id: userId,
            metric_name: 'media_count',
            metric_value: accountData.media_count,
            recorded_date: new Date().toISOString().split('T')[0]
          }, {
            onConflict: 'user_id,metric_name,recorded_date'
          })
      }
    }
    
    // Note: Follower count and demographics require Instagram Graph API with business account
    // This would be implemented similarly but needs proper API access
    
    console.log('✅ Audience data processing completed')
    
  } catch (error) {
    console.error('❌ Error fetching audience data:', error)
    // Don't throw - this is optional data
  }
}
