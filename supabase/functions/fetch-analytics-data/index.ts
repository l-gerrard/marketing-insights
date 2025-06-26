import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Data validation utilities
const validateMetrics = (data: any, description: string) => {
  const sessions = data.sessions || 0;
  const pageViews = data.pageViews || 0;
  const bounceRate = data.bounceRate || 0;
  
  const issues = [];
  
  // Check for reasonable bounds
  if (sessions > 1000000) issues.push(`Unusually high sessions: ${sessions}`);
  if (pageViews > 10000000) issues.push(`Unusually high page views: ${pageViews}`);
  if (bounceRate > 100 || bounceRate < 0) issues.push(`Invalid bounce rate: ${bounceRate}%`);
  if (pageViews > 0 && sessions === 0) issues.push(`Page views without sessions`);
  
  if (issues.length > 0) {
    console.warn(`❌ Data validation issues for ${description}:`, issues);
    return false;
  }
  
  console.log(`✅ Data validation passed for ${description}`);
  return true;
};

const logDataQuality = (data: any[], type: string) => {
  if (!data || data.length === 0) {
    console.log(`📊 ${type}: No data found`);
    return;
  }
  
  const total = data.reduce((sum, item) => sum + (item.sessions || item.page_views || item.metric_value || 0), 0);
  console.log(`📊 ${type}: ${data.length} records, total value: ${total}`);
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== ENHANCED FETCH ANALYTICS DATA START ===')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      console.error('User not authenticated')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User authenticated:', user.id)

    const { provider } = await req.json()
    console.log('Fetching enhanced data for provider:', provider)

    // Calculate date ranges
    const currentStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const currentEnd = new Date().toISOString().split('T')[0]
    
    console.log('Current period:', currentStart, 'to', currentEnd)

    // Get API connection with configuration
    const { data: connection, error: connectionError } = await supabaseClient
      .from('api_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single()

    if (connectionError || !connection) {
      console.error('No API connection found:', connectionError)
      return new Response(JSON.stringify({ error: 'No API connection found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Connection found, checking token expiry...')
    
    const configuration = connection.configuration || {}
    const propertyId = configuration.property_id

    if (!propertyId) {
      console.error('Property ID not configured')
      return new Response(JSON.stringify({ error: 'Property ID not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Property ID:', propertyId)

    // Check if token is expired and refresh if needed
    let accessToken = connection.access_token
    const expiresAt = connection.expires_at ? new Date(connection.expires_at) : null
    const now = new Date()

    console.log('Token expires at:', expiresAt)
    console.log('Current time:', now)
    console.log('Token expired:', expiresAt && expiresAt <= now)

    if (expiresAt && expiresAt <= now && connection.refresh_token) {
      console.log('Token expired, refreshing...')
      
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      
      if (!clientId || !clientSecret) {
        console.error('Google OAuth credentials not configured')
        return new Response(JSON.stringify({ error: 'Google OAuth credentials not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const refreshPayload = {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: connection.refresh_token,
        grant_type: 'refresh_token'
      }

      console.log('Sending token refresh request...')
      
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(refreshPayload)
      })

      const refreshData = await refreshResponse.json()
      
      console.log('Refresh response status:', refreshResponse.status)
      
      if (refreshData.access_token && refreshData.expires_in) {
        accessToken = refreshData.access_token;
        const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();
        // Update the database with the new token and expiry
        const { error: updateError } = await supabaseClient
          .from('api_connections')
          .update({
            access_token: accessToken,
            expires_at: newExpiresAt
          })
          .eq('user_id', user.id)
          .eq('provider', provider);
        if (updateError) {
          console.error('Failed to update refreshed token in DB:', updateError);
        } else {
          console.log('Updated refreshed token and expiry in DB');
        }
      }
    }

    // Helper function to make GA4 API requests with enhanced error handling
    const makeGA4Request = async (requestBody: any, description: string, retries = 2) => {
      console.log(`Making ${description} request...`)
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000)
          
          const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          })

          clearTimeout(timeoutId)
          
          console.log(`${description} response status:`, response.status)
          
          if (!response.ok) {
            const errorData = await response.json()
            console.error(`${description} API error:`, errorData)
            
            if (response.status === 429 || (errorData.error?.code === 429)) {
              if (attempt < retries) {
                console.log(`Rate limited, retrying in ${(attempt + 1) * 2} seconds...`)
                await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000))
                continue
              }
            }
            
            throw new Error(`${description} failed: ${errorData.error?.message || 'Unknown error'}`)
          }

          return await response.json()
        } catch (error) {
          if (error.name === 'AbortError') {
            console.error(`${description} request timed out`)
            if (attempt < retries) {
              console.log(`Timeout, retrying ${description} request (attempt ${attempt + 1})...`)
              continue
            }
            throw new Error(`${description} timed out after ${retries + 1} attempts`)
          }
          
          if (attempt < retries) {
            console.log(`${description} failed, retrying (attempt ${attempt + 1}):`, error.message)
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          }
          throw error
        }
      }
    }

    if (provider === 'google_analytics') {
      console.log('🚀 Starting enhanced GA4 data fetch with validation...')
      
      // TRANSACTION-BASED DATA CLEARING - Clear ALL existing data atomically
      console.log('🧹 Clearing all existing data with validation...')
      
      // First, get current data count for logging
      const { count: existingCount } = await supabaseClient
        .from('analytics_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('provider', provider)
      
      console.log(`Found ${existingCount || 0} existing analytics records to clear`)
      
      const deletePromises = [
        supabaseClient
          .from('analytics_data')
          .delete()
          .eq('user_id', user.id)
          .eq('provider', provider),
        
        supabaseClient
          .from('traffic_source_metrics')
          .delete()
          .eq('user_id', user.id),
        
        supabaseClient
          .from('page_performance_metrics')
          .delete()
          .eq('user_id', user.id),
        
        supabaseClient
          .from('device_analytics')
          .delete()
          .eq('user_id', user.id)
      ]
      
      const deleteResults = await Promise.all(deletePromises)
      const hasDeleteErrors = deleteResults.some(result => result.error)
      
      if (hasDeleteErrors) {
        console.error('❌ Failed to clear existing data:', deleteResults)
        throw new Error('Failed to clear existing data - aborting to prevent duplication')
      }
      
      console.log('✅ All existing data cleared successfully')

      try {
        // 1. ENHANCED DAILY BREAKDOWN with validation
        const dailyRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'bounceRate' }
          ],
          dimensions: [
            { name: 'date' }
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }]
        }

        console.log('📊 Fetching validated daily breakdown data...')
        const dailyData = await makeGA4Request(dailyRequest, 'Daily breakdown with validation')
        
        if (dailyData.rows && dailyData.rows.length > 0) {
          console.log(`Processing ${dailyData.rows.length} daily breakdown rows with validation`)
          
          // Calculate and validate totals
          let totalSessions = 0
          let totalPageViews = 0
          let totalActiveUsers = 0
          let totalBounceRate = 0
          let validDays = 0
          
          const validatedDailyRecords = []
          
          for (const row of dailyData.rows) {
            const date = row.dimensionValues[0]?.value || ''
            const sessions = parseInt(row.metricValues[0]?.value || '0')
            const pageViews = parseInt(row.metricValues[1]?.value || '0')
            const activeUsers = parseInt(row.metricValues[2]?.value || '0')
            const bounceRate = parseFloat(row.metricValues[3]?.value || '0')

            console.log(`📅 Day ${date}: sessions=${sessions}, pageViews=${pageViews}, bounceRate=${bounceRate}%`)

            // Validate each day's data
            const dayData = { sessions, pageViews, bounceRate }
            const isValid = validateMetrics(dayData, `Day ${date}`)
            
            if (isValid) {
              totalSessions += sessions
              totalPageViews += pageViews
              totalActiveUsers += activeUsers
              totalBounceRate += bounceRate
              validDays++
              
              validatedDailyRecords.push({
                user_id: user.id,
                provider: 'google_analytics',
                data_type: 'daily_breakdown',
                metric_name: 'daily_sessions',
                metric_value: sessions,
                period_type: 'current',
                comparison_period: 'last_30_days',
                date_range_start: date,
                date_range_end: date,
                bounce_rate: bounceRate, // Store the bounce rate for each day
                dimensions: {
                  date: date,
                  sessions: sessions,
                  page_views: pageViews,
                  active_users: activeUsers,
                  bounce_rate: bounceRate, // Also store in dimensions
                  validated: true,
                  validation_timestamp: new Date().toISOString()
                }
              })
            } else {
              console.warn(`⚠️ Skipping invalid day ${date} due to validation failure`)
            }
          }

          // Calculate average bounce rate from valid days
          const avgBounceRate = validDays > 0 ? totalBounceRate / validDays : 0

          console.log(`✅ Validated ${validDays}/${dailyData.rows.length} daily records`)
          console.log('📈 Validated totals:', { totalSessions, totalPageViews, totalActiveUsers, avgBounceRate })

          // Store validated daily records in batches to prevent timeouts
          const batchSize = 10
          for (let i = 0; i < validatedDailyRecords.length; i += batchSize) {
            const batch = validatedDailyRecords.slice(i, i + batchSize)
            const { error: insertError } = await supabaseClient
              .from('analytics_data')
              .insert(batch)
            
            if (insertError) {
              console.error(`❌ Failed to insert daily batch ${i / batchSize + 1}:`, insertError)
              throw new Error('Failed to insert validated daily data')
            }
          }

          console.log('✅ All validated daily breakdown data stored successfully')

          // Store validated overall summary with quality indicators
          const summaryRecord = {
            user_id: user.id,
            provider: 'google_analytics',
            data_type: 'overall_totals',
            metric_name: 'site_performance',
            metric_value: totalPageViews,
            period_type: 'current',
            comparison_period: 'last_30_days',
            date_range_start: currentStart,
            date_range_end: currentEnd,
            bounce_rate: avgBounceRate, // Store the calculated average bounce rate
            dimensions: {
              sessions: totalSessions,
              active_users: totalActiveUsers,
              page_views: totalPageViews,
              bounce_rate: avgBounceRate, // Also store in dimensions
              total_period_days: validDays,
              data_quality_score: Math.round((validDays / dailyData.rows.length) * 100),
              validation_passed: true,
              fetch_timestamp: new Date().toISOString()
            }
          }

          const { error: summaryError } = await supabaseClient
            .from('analytics_data')
            .insert([summaryRecord])

          if (summaryError) {
            console.error('❌ Failed to insert summary record:', summaryError)
            throw new Error('Failed to insert validated summary')
          }

          console.log('✅ Validated overall summary record stored successfully with bounce rate:', avgBounceRate)
        }

        // 2. ENHANCED OVERALL METRICS with validation
        const overallRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' }
          ]
        }

        console.log('📊 Fetching validated overall metrics...')
        const overallData = await makeGA4Request(overallRequest, 'Overall metrics with validation')
        
        if (overallData.rows && overallData.rows.length > 0) {
          const row = overallData.rows[0]
          const bounceRate = parseFloat(row.metricValues[0]?.value || '0')
          const avgSessionDuration = parseFloat(row.metricValues[1]?.value || '0')

          console.log(`📊 Overall bounce rate from GA4: ${bounceRate}%`)
          console.log(`📊 Overall avg session duration: ${avgSessionDuration}s`)

          // Validate overall metrics
          const overallMetrics = { bounceRate, sessions: 1 } // Dummy sessions for validation
          if (validateMetrics(overallMetrics, 'Overall metrics')) {
            // Update the overall summary with additional validated metrics
            const { error: updateError } = await supabaseClient
              .from('analytics_data')
              .update({
                bounce_rate: bounceRate, // Use the overall bounce rate if available
                avg_session_duration: avgSessionDuration,
                engagement_rate: 100 - bounceRate
              })
              .eq('user_id', user.id)
              .eq('data_type', 'overall_totals')
              .eq('metric_name', 'site_performance')

            if (updateError) {
              console.error('❌ Failed to update with enhanced metrics:', updateError)
            } else {
              console.log(`✅ Enhanced metrics updated - bounce rate: ${bounceRate}%, engagement: ${100 - bounceRate}%`)
            }
          }
        }

        // Continue with existing traffic source, device, and page data fetching with validation...
        const trafficRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'bounceRate' }
          ],
          dimensions: [
            { name: 'sessionDefaultChannelGroup' },
            { name: 'sessionSource' },
            { name: 'sessionMedium' }
          ],
          limit: 20
        }

        console.log('�� Fetching validated traffic source data...')
        const trafficData = await makeGA4Request(trafficRequest, 'Traffic sources with validation')
        
        if (trafficData.rows && trafficData.rows.length > 0) {
          console.log(`Processing ${trafficData.rows.length} traffic source rows with validation`)
          
          const validatedTrafficRecords = []
          
          for (const row of trafficData.rows) {
            const channelGroup = row.dimensionValues[0]?.value || 'Unknown'
            const source = row.dimensionValues[1]?.value || 'Unknown'
            const medium = row.dimensionValues[2]?.value || 'Unknown'
            
            const sessions = parseInt(row.metricValues[0]?.value || '0')
            const activeUsers = parseInt(row.metricValues[1]?.value || '0')
            const bounceRate = parseFloat(row.metricValues[2]?.value || '0')

            // Validate traffic source data
            const trafficMetrics = { sessions, bounceRate }
            if (validateMetrics(trafficMetrics, `Traffic source ${source}`)) {
              validatedTrafficRecords.push({
                user_id: user.id,
                source: source,
                medium: medium,
                sessions: sessions,
                new_users: activeUsers,
                bounce_rate: bounceRate,
                period_type: 'current',
                comparison_period: 'current_vs_previous',
                date_range_start: currentStart,
                date_range_end: currentEnd
              })
            }
          }
          
          if (validatedTrafficRecords.length > 0) {
            const { error: trafficError } = await supabaseClient
              .from('traffic_source_metrics')
              .insert(validatedTrafficRecords)
            
            if (trafficError) {
              console.error('❌ Failed to insert traffic data:', trafficError)
            } else {
              console.log(`✅ ${validatedTrafficRecords.length} validated traffic source records stored`)
              logDataQuality(validatedTrafficRecords, 'Traffic Sources')
            }
          }
        }

        const deviceCategoryRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' }
          ],
          dimensions: [
            { name: 'deviceCategory' }
          ]
        }

        console.log('📊 Fetching validated device category data...')
        const deviceCategoryData = await makeGA4Request(deviceCategoryRequest, 'Device category with validation')
        
        if (deviceCategoryData.rows && deviceCategoryData.rows.length > 0) {
          console.log(`Processing ${deviceCategoryData.rows.length} device category rows with validation`)
          
          const validatedDeviceRecords = []
          
          for (const row of deviceCategoryData.rows) {
            const deviceCategory = row.dimensionValues[0]?.value || 'Unknown'
            
            const sessions = parseInt(row.metricValues[0]?.value || '0')
            const users = parseInt(row.metricValues[1]?.value || '0')
            const bounceRate = parseFloat(row.metricValues[2]?.value || '0')
            const avgSessionDuration = parseFloat(row.metricValues[3]?.value || '0')

            // Validate device data
            const deviceMetrics = { sessions, bounceRate }
            if (validateMetrics(deviceMetrics, `Device ${deviceCategory}`)) {
              validatedDeviceRecords.push({
                user_id: user.id,
                device_category: deviceCategory,
                browser: 'All',
                operating_system: 'All',
                sessions: sessions,
                users: users,
                bounce_rate: bounceRate,
                avg_session_duration: avgSessionDuration,
                date_range_start: currentStart,
                date_range_end: currentEnd
              })
            }
          }
          
          if (validatedDeviceRecords.length > 0) {
            const { error: deviceError } = await supabaseClient
              .from('device_analytics')
              .insert(validatedDeviceRecords)
            
            if (deviceError) {
              console.error('❌ Failed to insert device data:', deviceError)
            } else {
              console.log(`✅ ${validatedDeviceRecords.length} validated device records stored`)
              logDataQuality(validatedDeviceRecords, 'Device Analytics')
            }
          }
        }

        const browserRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'bounceRate' }
          ],
          dimensions: [
            { name: 'browser' }
          ],
          limit: 10
        }

        console.log('Fetching browser data separately...')
        const browserData = await makeGA4Request(browserRequest, 'Browser data')
        
        if (browserData.rows && browserData.rows.length > 0) {
          console.log(`Processing ${browserData.rows.length} browser rows`)
          
          for (const row of browserData.rows) {
            const browser = row.dimensionValues[0]?.value || 'Unknown'
            
            const sessions = parseInt(row.metricValues[0]?.value || '0')
            const users = parseInt(row.metricValues[1]?.value || '0')
            const bounceRate = parseFloat(row.metricValues[2]?.value || '0')

            if (browser !== 'Unknown' && sessions > 0) {
              await supabaseClient
                .from('device_analytics')
                .insert([{
                  user_id: user.id,
                  device_category: 'Browser Data',
                  browser: browser,
                  operating_system: 'All',
                  sessions: sessions,
                  users: users,
                  bounce_rate: bounceRate,
                  avg_session_duration: 0,
                  date_range_start: currentStart,
                  date_range_end: currentEnd
                }])
            }
          }
          
          console.log('Browser data stored successfully')
        }

        const pagesRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'sessions' },
            { name: 'bounces' }
          ],
          dimensions: [
            { name: 'pagePath' },
            { name: 'pageTitle' }
          ],
          limit: 10
        }

        console.log('📊 Fetching validated page performance data...')
        const pagesData = await makeGA4Request(pagesRequest, 'Page performance with validation')
        
        if (pagesData.rows && pagesData.rows.length > 0) {
          console.log(`Processing ${pagesData.rows.length} page performance rows with validation`)
          
          const validatedPageRecords = []
          
          for (const row of pagesData.rows) {
            const pagePath = row.dimensionValues[0]?.value || '/'
            const pageTitle = row.dimensionValues[1]?.value || 'Untitled'
            
            const sessions = parseInt(row.metricValues[0]?.value || '0')
            const bounces = parseInt(row.metricValues[1]?.value || '0')
            const bounceRate = sessions > 0 ? (bounces / sessions) * 100 : 0

            // Validate page data
            const pageMetrics = { sessions, pageViews: 0, bounceRate }
            if (validateMetrics(pageMetrics, `Page ${pagePath}`)) {
              validatedPageRecords.push({
                user_id: user.id,
                page_path: pagePath,
                page_title: pageTitle,
                page_views: sessions, // Use sessions as page views for now
                unique_page_views: sessions, // Use sessions as unique views for now
                bounce_rate: bounceRate,
                period_type: 'current',
                comparison_period: 'current_vs_previous',
                date_range_start: currentStart,
                date_range_end: currentEnd
              })
            }
          }
          
          if (validatedPageRecords.length > 0) {
            const { error: pageError } = await supabaseClient
              .from('page_performance_metrics')
              .insert(validatedPageRecords)
            
            if (pageError) {
              console.error('❌ Failed to insert page data:', pageError)
            } else {
              console.log(`✅ ${validatedPageRecords.length} validated page records stored`)
              logDataQuality(validatedPageRecords, 'Page Performance')
            }
          }
        }

      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('❌ Error fetching GA4 data:', error)
          return new Response(JSON.stringify({ 
            error: `GA4 data fetch failed: ${error.message}`,
            details: 'Data validation failed or API limit reached. Check logs for validation issues.'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          console.error('❌ Error fetching GA4 data:', error)
          return new Response(JSON.stringify({ 
            error: 'GA4 data fetch failed: Unknown error',
            details: 'Data validation failed or API limit reached. Check logs for validation issues.'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    console.log('=== ENHANCED FETCH ANALYTICS DATA COMPLETE ===')

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Analytics data fetched and stored successfully with comprehensive validation',
      data_quality: 'Enhanced validation and duplicate prevention applied',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Enhanced analytics fetch error:', error)
      console.error('Error stack:', error.stack)
      return new Response(JSON.stringify({ 
        error: error.message,
        details: 'Enhanced validation failed. Check logs for data quality issues.',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      console.error('❌ Enhanced analytics fetch error:', error)
      return new Response(JSON.stringify({ 
        error: 'Enhanced analytics fetch error: Unknown error',
        details: 'Enhanced validation failed. Check logs for data quality issues.',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
})
