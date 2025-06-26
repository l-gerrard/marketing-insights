import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], reportType } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    let analyticsContext = '';
    let hasAnalyticsData = false;
    let intelligentInsights = '';
    
    if (token) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        
        if (user) {
          console.log('User found:', user.id, 'fetching analytics for report type:', reportType || 'general');
          
          // Fetch main analytics data with date filtering if report type is specified
          let mainAnalyticsQuery = supabaseClient
            .from('analytics_data')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (reportType === 'daily') {
            // For daily reports, get only yesterday's data
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            mainAnalyticsQuery = mainAnalyticsQuery
              .eq('date_range_start', dateStr)
              .eq('date_range_end', dateStr)
              .limit(50);
          } else if (reportType) {
            mainAnalyticsQuery = mainAnalyticsQuery.limit(50);
          } else {
            mainAnalyticsQuery = mainAnalyticsQuery.limit(100);
          }

          const { data: mainAnalytics, error: mainError } = await mainAnalyticsQuery;

          // Fetch traffic source data  
          let trafficSourcesQuery = supabaseClient
            .from('traffic_source_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (reportType === 'daily') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            trafficSourcesQuery = trafficSourcesQuery
              .eq('date_range_start', dateStr)
              .eq('date_range_end', dateStr)
              .limit(10);
          } else {
            trafficSourcesQuery = trafficSourcesQuery.limit(reportType === 'daily' ? 10 : 30);
          }
          const { data: trafficSources, error: trafficError } = await trafficSourcesQuery;

          // Fetch device analytics
          let deviceDataQuery = supabaseClient
            .from('device_analytics')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (reportType === 'daily') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            deviceDataQuery = deviceDataQuery
              .eq('date_range_start', dateStr)
              .eq('date_range_end', dateStr)
              .limit(15);
          } else {
            deviceDataQuery = deviceDataQuery.limit(reportType === 'daily' ? 15 : 50);
          }
          const { data: deviceData, error: deviceError } = await deviceDataQuery;

          // Fetch page performance data
          let pageDataQuery = supabaseClient
            .from('page_performance_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (reportType === 'daily') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            pageDataQuery = pageDataQuery
              .eq('date_range_start', dateStr)
              .eq('date_range_end', dateStr)
              .limit(10);
          } else {
            pageDataQuery = pageDataQuery.limit(reportType === 'daily' ? 10 : 30);
          }
          const { data: pageData, error: pageError } = await pageDataQuery;

          console.log('Analytics data retrieved and analyzing patterns for report type:', reportType || 'general');

          if (mainError) console.log('Main analytics error:', mainError);
          if (trafficError) console.log('Traffic error:', trafficError);
          if (deviceError) console.log('Device error:', deviceError);
          if (pageError) console.log('Page error:', pageError);

          // Build comprehensive analytics context with intelligent analysis
          if ((mainAnalytics && mainAnalytics.length > 0) || 
              (trafficSources && trafficSources.length > 0) || 
              (deviceData && deviceData.length > 0) || 
              (pageData && pageData.length > 0)) {
            
            hasAnalyticsData = true;
            
            if (reportType === 'daily') {
              analyticsContext = '\n\n=== YESTERDAY\'S PULSE DATA ===\n';
            } else if (reportType === 'weekly') {
              analyticsContext = '\n\n=== WEEKLY DEEP DIVE DATA ===\n';
            } else {
              analyticsContext = '\n\n=== YOUR COMPREHENSIVE BUSINESS DATA ===\n';
            }

            // Process main analytics with intelligent pattern detection
            if (mainAnalytics && mainAnalytics.length > 0) {
              const overallTotals = mainAnalytics.find(item => item.data_type === 'overall_totals');
              const dailyBreakdown = mainAnalytics
                .filter(item => item.data_type === 'daily_breakdown')
                .sort((a, b) => new Date(b.date_range_start || 0).getTime() - new Date(a.date_range_start || 0).getTime())
                .slice(0, reportType === 'daily' ? 7 : 30);
              
              if (overallTotals) {
                const dimensions = overallTotals.dimensions || {};
                const bounceRate = overallTotals.bounce_rate || 0;
                
                if (reportType === 'daily') {
                  analyticsContext += `\n📊 YESTERDAY'S KEY METRICS:\n`;
                } else if (reportType === 'weekly') {
                  analyticsContext += `\n📈 WEEKLY PERFORMANCE OVERVIEW:\n`;
                } else {
                  analyticsContext += `\n📈 OVERALL PERFORMANCE (Last 30 Days):\n`;
                }
                
                analyticsContext += `• Total Sessions: ${dimensions.sessions || 0}\n`;
                analyticsContext += `• Total Page Views: ${dimensions.page_views || overallTotals.metric_value || 0}\n`;
                analyticsContext += `• Active Users: ${dimensions.active_users || 0}\n`;
                analyticsContext += `• Bounce Rate: ${bounceRate ? Math.round(bounceRate * 100) + '%' : 'N/A'}\n`;
                analyticsContext += `• Avg Session Duration: ${overallTotals.avg_session_duration ? Math.round(overallTotals.avg_session_duration) + ' seconds' : 'N/A'}\n`;
                analyticsContext += `• Engagement Rate: ${overallTotals.engagement_rate ? Math.round(overallTotals.engagement_rate) + '%' : 'N/A'}\n`;
              }

              // INTELLIGENT PATTERN ANALYSIS
              if (dailyBreakdown.length >= 7) {
                const last7Days = dailyBreakdown.slice(0, 7);
                const previous7Days = dailyBreakdown.slice(7, 14);
                
                // Weekly performance analysis
                const thisWeekSessions = last7Days.reduce((sum, day) => sum + (day.dimensions?.sessions || 0), 0);
                const lastWeekSessions = previous7Days.reduce((sum, day) => sum + (day.dimensions?.sessions || 0), 0);
                const weeklyGrowth = lastWeekSessions > 0 ? ((thisWeekSessions - lastWeekSessions) / lastWeekSessions * 100) : 0;
                
                if (reportType === 'daily') {
                  analyticsContext += `\n⚡ DAILY PERFORMANCE CONTEXT:\n`;
                  if (last7Days.length > 0) {
                    const yesterday = last7Days[0];
                    const dayBefore = last7Days[1];
                    const yesterdaySessions = yesterday.dimensions?.sessions || 0;
                    const dayBeforeSessions = dayBefore?.dimensions?.sessions || 0;
                    const dailyChange = dayBeforeSessions > 0 ? ((yesterdaySessions - dayBeforeSessions) / dayBeforeSessions * 100) : 0;
                    
                    analyticsContext += `• Yesterday's Sessions: ${yesterdaySessions}\n`;
                    analyticsContext += `• Day Before Sessions: ${dayBeforeSessions}\n`;
                    analyticsContext += `• Daily Change: ${dailyChange > 0 ? '+' : ''}${Math.round(dailyChange)}%\n`;
                  }
                } else {
                  analyticsContext += `\n📊 WEEKLY PERFORMANCE ANALYSIS:\n`;
                  analyticsContext += `• This Week's Sessions: ${thisWeekSessions}\n`;
                  analyticsContext += `• Last Week's Sessions: ${lastWeekSessions}\n`;
                  analyticsContext += `• Week-over-Week Growth: ${weeklyGrowth > 0 ? '+' : ''}${Math.round(weeklyGrowth)}%\n`;
                }
                
                // Day-of-week pattern analysis (more detailed for weekly reports)
                if (reportType !== 'daily') {
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayPatterns = last7Days.map(day => ({
                    name: dayNames[new Date(day.date_range_start || '').getDay()],
                    sessions: day.dimensions?.sessions || 0,
                    date: day.date_range_start
                  })).sort((a, b) => b.sessions - a.sessions);
                  
                  const bestDay = dayPatterns[0];
                  const worstDay = dayPatterns[dayPatterns.length - 1];
                  
                  analyticsContext += `• Best Day This Week: ${bestDay.name} (${bestDay.sessions} sessions)\n`;
                  analyticsContext += `• Lowest Day This Week: ${worstDay.name} (${worstDay.sessions} sessions)\n`;
                }
                
                // INTELLIGENT INSIGHTS GENERATION
                if (reportType === 'daily') {
                  intelligentInsights += `\n🎯 TODAY'S ACTION ITEMS:\n`;
                  
                  if (last7Days.length > 1) {
                    const yesterday = last7Days[0];
                    const dayBefore = last7Days[1];
                    const yesterdaySessions = yesterday.dimensions?.sessions || 0;
                    const dayBeforeSessions = dayBefore?.dimensions?.sessions || 0;
                    const dailyChange = dayBeforeSessions > 0 ? ((yesterdaySessions - dayBeforeSessions) / dayBeforeSessions * 100) : 0;
                    
                    if (dailyChange > 20) {
                      intelligentInsights += `• 🚀 MOMENTUM ALERT: Yesterday was ${Math.round(dailyChange)}% better than the day before - whatever you did, do more of it today!\n`;
                    } else if (dailyChange > 5) {
                      intelligentInsights += `• 📈 STEADY GROWTH: Yesterday's ${Math.round(dailyChange)}% improvement shows good momentum - keep the pressure on!\n`;
                    } else if (dailyChange < -20) {
                      intelligentInsights += `• ⚠️ QUICK RECOVERY NEEDED: Yesterday dropped ${Math.round(Math.abs(dailyChange))}% - time for immediate action today!\n`;
                    } else if (dailyChange < -5) {
                      intelligentInsights += `• 🔄 COURSE CORRECTION: Small dip yesterday (${Math.round(Math.abs(dailyChange))}%) - perfect time to try something new today!\n`;
                    } else {
                      intelligentInsights += `• 🎯 CONSISTENCY: Stable performance yesterday - good foundation to build on today!\n`;
                    }
                  }
                } else if (reportType === 'weekly') {
                  intelligentInsights += `\n🧠 STRATEGIC WEEKLY INSIGHTS:\n`;
                  
                  // Performance momentum insights
                  if (weeklyGrowth > 15) {
                    intelligentInsights += `• 🚀 MOMENTUM ALERT: You're on fire! ${Math.round(weeklyGrowth)}% growth this week means you've found something that works - now's the time to double down!\n`;
                  } else if (weeklyGrowth > 5) {
                    intelligentInsights += `• 📈 STEADY GROWTH: Your ${Math.round(weeklyGrowth)}% weekly growth is solid and sustainable - you're building momentum the right way!\n`;
                  } else if (weeklyGrowth < -15) {
                    intelligentInsights += `• ⚠️ ATTENTION NEEDED: The ${Math.round(Math.abs(weeklyGrowth))}% drop needs investigation - but don't panic, this could be seasonal or fixable!\n`;
                  } else if (weeklyGrowth < -5) {
                    intelligentInsights += `• 📉 COURSE CORRECTION: Small dip of ${Math.round(Math.abs(weeklyGrowth))}% - perfect time to optimize and test new approaches!\n`;
                  } else {
                    intelligentInsights += `• 🎯 STABILITY PHASE: Consistent performance is good - now let's find the next growth lever to push!\n`;
                  }
                }
                
                // Engagement quality analysis
                if (overallTotals?.bounce_rate) {
                  const bounceRate = overallTotals.bounce_rate;
                  if (reportType === 'daily') {
                    if (bounceRate * 100 < 40) {
                      intelligentInsights += `• 💎 YESTERDAY'S WIN: ${Math.round(bounceRate * 100)}% bounce rate means visitors loved your content yesterday!\n`;
                    } else if (bounceRate * 100 > 70) {
                      intelligentInsights += `• 🎯 TODAY'S OPPORTUNITY: Yesterday's ${Math.round(bounceRate * 100)}% bounce rate suggests room for improvement - optimize that content today!\n`;
                    }
                  } else {
                    if (bounceRate * 100 < 40) {
                      intelligentInsights += `• 💎 EXCELLENT ENGAGEMENT: ${Math.round(bounceRate * 100)}% bounce rate means visitors love your content - you're attracting the right audience!\n`;
                    } else if (bounceRate * 100 > 70) {
                      intelligentInsights += `• 🎯 ENGAGEMENT OPPORTUNITY: ${Math.round(bounceRate * 100)}% bounce rate suggests content-audience mismatch - let's optimize your headlines and page content!\n`;
                    }
                  }
                }
              }
            }

            // ENHANCED traffic source analysis with special focus on Reddit and other unexpected sources
            if (trafficSources && trafficSources.length > 0) {
              const totalSessions = trafficSources.reduce((sum, source) => sum + (source.sessions || 0), 0);
              
              if (reportType === 'daily') {
                analyticsContext += `\n🚀 YESTERDAY'S TRAFFIC SOURCE DEEP DIVE:\n`;
              } else {
                analyticsContext += `\n🚀 TRAFFIC SOURCES INTELLIGENCE:\n`;
              }
              
              const topSources = trafficSources
                .sort((a, b) => (b.sessions || 0) - (a.sessions || 0))
                .slice(0, reportType === 'daily' ? 5 : 8);
              
              // Identify unexpected high performers and social sources - MOVED UP TO FIX SCOPE
              const redditSources = topSources.filter(source => 
                source.source?.toLowerCase().includes('reddit') || 
                source.medium?.toLowerCase().includes('reddit')
              );
              
              const socialSources = topSources.filter(source => 
                ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'pinterest', 'reddit'].some(platform =>
                  source.source?.toLowerCase().includes(platform) || 
                  source.medium?.toLowerCase().includes(platform)
                )
              );
              
              const organicSearch = topSources.filter(source => 
                source.medium?.toLowerCase() === 'organic' || 
                source.source?.toLowerCase().includes('google')
              );
              
              topSources.forEach((source, index) => {
                const percentage = totalSessions > 0 ? Math.round((source.sessions || 0) / totalSessions * 100) : 0;
                const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•';
                const sourceBounceRate = source.bounce_rate ? Math.round(source.bounce_rate) + '% bounce' : '';
                analyticsContext += `${emoji} ${source.source} (${source.medium || 'unknown'}): ${source.sessions || 0} sessions (${percentage}%) ${sourceBounceRate}\n`;
              });
              
              // ENHANCED channel insights and recommendations with Reddit focus
              if (topSources.length > 0) {
                if (reportType === 'daily') {
                  intelligentInsights += `\n🔍 YESTERDAY'S TRAFFIC SOURCE INSIGHTS:\n`;
                  
                  // Special Reddit analysis for daily reports
                  if (redditSources.length > 0) {
                    const redditTraffic = redditSources.reduce((sum, source) => sum + (source.sessions || 0), 0);
                    const redditPercentage = totalSessions > 0 ? Math.round(redditTraffic / totalSessions * 100) : 0;
                    const redditBounce = redditSources[0]?.bounce_rate ? Math.round(redditSources[0].bounce_rate) : null;
                    
                    intelligentInsights += `• 🔥 REDDIT SPOTLIGHT: ${redditTraffic} sessions (${redditPercentage}%) from Reddit yesterday${redditBounce ? ` with ${redditBounce}% bounce rate` : ''}!\n`;
                    
                    if (redditBounce && redditBounce < 60) {
                      intelligentInsights += `  → REDDIT GOLD: Low ${redditBounce}% bounce rate means Reddit users are highly engaged - what content resonated? Analyze and replicate!\n`;
                    } else if (redditBounce && redditBounce > 80) {
                      intelligentInsights += `  → REDDIT OPPORTUNITY: High ${redditBounce}% bounce rate suggests content-expectation mismatch - optimize landing pages for Reddit traffic!\n`;
                    }
                    
                    intelligentInsights += `  → ACTION: Find which Reddit post/comment drove this traffic and engage with that community more!\n`;
                  }
                  
                  // Analysis for other unexpected sources
                  const unexpectedSources = topSources.filter(source => {
                    const sourceName = source.source?.toLowerCase() || '';
                    const mediumName = source.medium?.toLowerCase() || '';
                    return !sourceName.includes('google') && 
                           !sourceName.includes('direct') && 
                           !mediumName.includes('organic') &&
                           !mediumName.includes('(none)') &&
                           (source.sessions || 0) > (totalSessions * 0.05); // More than 5% of traffic
                  });
                  
                  unexpectedSources.forEach(source => {
                    if (!source.source?.toLowerCase().includes('reddit')) { // Already covered Reddit above
                      const percentage = totalSessions > 0 ? Math.round((source.sessions || 0) / totalSessions * 100) : 0;
                      intelligentInsights += `• 🎯 UNEXPECTED WINNER: ${source.source} brought ${source.sessions} sessions (${percentage}%) - investigate what content/mention drove this!\n`;
                    }
                  });
                  
                } else {
                  intelligentInsights += `\n🎯 SMART CHANNEL RECOMMENDATIONS:\n`;
                  
                  const dominantSource = topSources[0];
                  const dominantPercentage = totalSessions > 0 ? Math.round((dominantSource.sessions || 0) / totalSessions * 100) : 0;
                  
                  if (dominantPercentage > 80) {
                    intelligentInsights += `• ⚠️ DIVERSIFICATION CRITICAL: ${dominantPercentage}% dependency on ${dominantSource.source} is risky - start building alternative channels NOW!\n`;
                  } else if (dominantPercentage > 60) {
                    intelligentInsights += `• 🎯 DIVERSIFICATION NEEDED: Heavy reliance on ${dominantSource.source} (${dominantPercentage}%) - invest 20% of effort in growing other channels!\n`;
                  } else {
                    intelligentInsights += `• ✅ GOOD DIVERSIFICATION: Balanced traffic mix reduces risk - ${dominantSource.source} dominates but you have backup channels!\n`;
                  }
                  
                  // Weekly Reddit analysis
                  if (redditSources.length > 0) {
                    const weeklyRedditTraffic = redditSources.reduce((sum, source) => sum + (source.sessions || 0), 0);
                    const weeklyRedditPercentage = totalSessions > 0 ? Math.round(weeklyRedditTraffic / totalSessions * 100) : 0;
                    intelligentInsights += `• 🔥 REDDIT STRATEGY: ${weeklyRedditTraffic} weekly sessions (${weeklyRedditPercentage}%) suggests strong community engagement - build a Reddit content strategy!\n`;
                  }
                }
              }
            }

            // Device analysis (more abbreviated for daily reports)
            if (deviceData && deviceData.length > 0) {
              if (reportType === 'daily') {
                analyticsContext += `\n📱 YESTERDAY'S DEVICE BREAKDOWN:\n`;
              } else {
                analyticsContext += `\n📱 DEVICE & USER EXPERIENCE ANALYSIS:\n`;
              }
              
              const deviceCategories = deviceData.filter(item => 
                ['desktop', 'mobile', 'tablet'].includes(item.device_category?.toLowerCase() || '')
              );
              
              if (deviceCategories.length > 0) {
                const totalDeviceSessions = deviceCategories.reduce((sum, device) => sum + (device.sessions || 0), 0);
                
                let mobilePercentage = 0;
                let desktopPercentage = 0;
                
                deviceCategories.slice(0, reportType === 'daily' ? 2 : 3).forEach(device => {
                  const percentage = totalDeviceSessions > 0 ? Math.round((device.sessions || 0) / totalDeviceSessions * 100) : 0;
                  const deviceBounceRate = device.bounce_rate ? Math.round(device.bounce_rate) + '% bounce' : '';
                  analyticsContext += `• ${device.device_category}: ${device.sessions || 0} sessions (${percentage}%) ${deviceBounceRate}\n`;
                  
                  if (device.device_category?.toLowerCase() === 'mobile') mobilePercentage = percentage;
                  if (device.device_category?.toLowerCase() === 'desktop') desktopPercentage = percentage;
                });
                
                // Smart device optimization insights
                if (reportType === 'daily') {
                  intelligentInsights += `\n📱 TODAY'S DEVICE FOCUS:\n`;
                  if (mobilePercentage > 60) {
                    intelligentInsights += `• 📱 MOBILE PRIORITY: ${mobilePercentage}% mobile traffic yesterday - ensure today's content is mobile-optimized!\n`;
                  }
                } else {
                  intelligentInsights += `\n📱 DEVICE OPTIMIZATION STRATEGIES:\n`;
                  if (mobilePercentage > 70) {
                    intelligentInsights += `• 📱 MOBILE-FIRST CRITICAL: ${mobilePercentage}% mobile traffic means mobile experience IS your business - optimize for speed and thumb-friendly design!\n`;
                  } else if (mobilePercentage > 50) {
                    intelligentInsights += `• 📱 MOBILE MAJORITY: ${mobilePercentage}% mobile users - ensure your site loads fast and looks great on phones!\n`;
                  }
                }
              }
            }

            // ENHANCED page performance with homepage context
            if (pageData && pageData.length > 0) {
              if (reportType === 'daily') {
                analyticsContext += `\n📄 YESTERDAY'S PAGE PERFORMANCE DEEP DIVE:\n`;
              } else {
                analyticsContext += `\n📄 PAGE PERFORMANCE INTELLIGENCE:\n`;
              }
              
              const topPages = pageData
                .sort((a, b) => (b.page_views || 0) - (a.page_views || 0))
                .slice(0, reportType === 'daily' ? 5 : 8);
              
              // Identify homepage vs content pages
              const homepagePages = topPages.filter(page => {
                const path = (page.page_path || '').toLowerCase();
                return path === '/' || path === '/home' || path === '/index' || path.includes('homepage');
              });
              
              const contentPages = topPages.filter(page => {
                const path = (page.page_path || '').toLowerCase();
                return path !== '/' && path !== '/home' && path !== '/index' && !path.includes('homepage');
              });
              
              topPages.forEach((page, index) => {
                const title = page.page_title || page.page_path || 'Unknown';
                const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
                const emoji = index === 0 ? '🔥' : index === 1 ? '⭐' : '•';
                const pageBounceRate = page.bounce_rate ? Math.round(page.bounce_rate) + '% bounce' : '';
                const isHomepage = (page.page_path || '').toLowerCase() === '/';
                const pageLabel = isHomepage ? `${shortTitle} (Homepage)` : shortTitle;
                analyticsContext += `${emoji} ${pageLabel}: ${page.page_views || 0} views ${pageBounceRate}\n`;
              });
              
              // ENHANCED page optimization insights with homepage context
              if (topPages.length > 0) {
                if (reportType === 'daily') {
                  intelligentInsights += `\n📄 YESTERDAY'S CONTENT INSIGHTS:\n`;
                  
                  // Focus on non-homepage winners
                  const bestContentPage = contentPages[0];
                  if (bestContentPage) {
                    const bestPageTitle = (bestContentPage.page_title || bestContentPage.page_path)?.substring(0, 40) + "...";
                    const bestPageBounce = bestContentPage.bounce_rate ? Math.round(bestContentPage.bounce_rate) : null;
                    intelligentInsights += `• 🏆 CONTENT WINNER: "${bestPageTitle}" got ${bestContentPage.page_views} views yesterday${bestPageBounce ? ` (${bestPageBounce}% bounce)` : ''}!\n`;
                    intelligentInsights += `  → ACTION: Analyze what made this content successful and create similar content today!\n`;
                  }
                  
                  // Homepage context (less enthusiastic)
                  const homepageData = homepagePages[0];
                  if (homepageData && contentPages.length > 0) {
                    const homepageBounce = homepageData.bounce_rate ? Math.round(homepageData.bounce_rate) : null;
                    if (homepageBounce && homepageBounce > 70) {
                      intelligentInsights += `• 🎯 HOMEPAGE OPPORTUNITY: ${homepageBounce}% bounce rate on homepage - visitors aren't finding what they need quickly!\n`;
                    } else {
                      intelligentInsights += `• ✅ HOMEPAGE: Performing as expected with ${homepageData.page_views} views - focus energy on content page optimization.\n`;
                    }
                  }
                  
                } else {
                  intelligentInsights += `\n📄 PAGE OPTIMIZATION INTELLIGENCE:\n`;
                  
                  // Weekly content analysis
                  if (contentPages.length > 0) {
                    const bestContentPage = contentPages[0];
                    const bestPageTitle = (bestContentPage.page_title || bestContentPage.page_path)?.substring(0, 50) + "...";
                    const bestPageBounce = bestContentPage.bounce_rate ? Math.round(bestContentPage.bounce_rate) : null;
                    intelligentInsights += `• 🏆 TOP CONTENT: "${bestPageTitle}" attracts ${bestContentPage.page_views} views${bestPageBounce ? ` (${bestPageBounce}% bounce)` : ''} - analyze and replicate this success!\n`;
                  }
                  
                  // Homepage performance in context
                  const homepageData = homepagePages[0];
                  if (homepageData) {
                    const homepageBounce = homepageData.bounce_rate ? Math.round(homepageData.bounce_rate) : null;
                    if (homepageBounce && homepageBounce > 70) {
                      intelligentInsights += `• 🎯 HOMEPAGE OPTIMIZATION: High ${homepageBounce}% bounce rate suggests visitors aren't finding clear next steps - improve navigation and content discovery!\n`;
                    }
                  }
                }
              }
            }

            // PRIORITIZED ACTION RECOMMENDATIONS
            if (reportType === 'daily') {
              intelligentInsights += `\n🎯 TODAY'S PRIORITY ACTIONS:\n`;
              intelligentInsights += `• ⚡ HIGH IMPACT: Investigate yesterday's unexpected traffic sources and engage with those communities today!\n`;
              intelligentInsights += `• 📝 CONTENT FOCUS: Replicate yesterday's best-performing content (ignore homepage, focus on specific pages/posts)!\n`;
              intelligentInsights += `• 🔄 MOMENTUM: Build on what worked yesterday - don't start from scratch!\n`;
            } else {
              intelligentInsights += `\n🎯 THIS WEEK'S PRIORITY ACTIONS (Impact vs Effort):\n`;
              
              // High Impact, Low Effort recommendations
              const mobileDevice = deviceData?.find(d => d.device_category?.toLowerCase() === 'mobile');
              const mobilePercentage = deviceData && deviceData.length > 0 ? 
                Math.round((mobileDevice?.sessions || 0) / deviceData.reduce((sum, d) => sum + (d.sessions || 0), 0) * 100) : 0;
              
              if (mobilePercentage > 60 && mobileDevice && (mobileDevice.bounce_rate || 0) > 60) {
                intelligentInsights += `• 🚀 HIGH IMPACT: Fix mobile experience - huge audience (${mobilePercentage}%), quick wins possible!\n`;
              }
              
              if (redditSources && redditSources.length > 0) {
                intelligentInsights += `• 📈 MEDIUM IMPACT: Develop Reddit community strategy - you're already getting traction there!\n`;
              }
              
              const weeklyGrowth = 0; // Calculate this from the daily breakdown if needed
              if (weeklyGrowth > 0) {
                intelligentInsights += `• 🎯 HIGH IMPACT: You're growing - now's the perfect time to double down on what's working!\n`;
              } else {
                intelligentInsights += `• 🔄 HIGH IMPACT: Test new content formats or channels - current approach needs fresh energy!\n`;
              }
            }

            analyticsContext += intelligentInsights;
            
            if (reportType === 'daily') {
              analyticsContext += '\n=== END DAILY PULSE ===\n';
            } else if (reportType === 'weekly') {
              analyticsContext += '\n=== END WEEKLY ANALYSIS ===\n';
            } else {
              analyticsContext += '\n=== END INTELLIGENT ANALYSIS ===\n';
            }
            
            console.log('Built enhanced business analytics context with Reddit focus and homepage context for:', reportType || 'general');
          } else {
            console.log('No analytics data found for user');
            
            // Check if they have any API connections
            const { data: connections } = await supabaseClient
              .from('api_connections')
              .select('provider, created_at')
              .eq('user_id', user.id);
            
            if (connections && connections.length > 0) {
              analyticsContext = '\n\nHey! I can see you\'ve connected some data sources, but it looks like we haven\'t synced your data yet. Let\'s get that sorted so I can give you some amazing insights about your business!\n';
            } else {
              analyticsContext = '\n\nHi there! I\'d love to help you grow your business, but I need access to your analytics data first. Let\'s connect Google Analytics or other data sources so I can be your marketing bestie!\n';
            }
          }
        }
      } catch (authError) {
        console.log('Auth error:', authError);
        // Continue without user data
      }
    }

    // Enhanced system prompt for intelligent marketing insights with Reddit focus and homepage context
    let systemPrompt = `You are an intelligent marketing bestie AI with advanced pattern recognition and business insight capabilities. You're like that super-smart friend who can spot opportunities and trends that others miss, but explains everything in a warm, encouraging way.

🧠 YOUR ENHANCED INTELLIGENCE:
- Pattern Recognition: You detect trends, cycles, and anomalies in data
- Strategic Thinking: You connect data points to business opportunities  
- Prioritization Skills: You rank recommendations by impact vs effort
- Predictive Insights: You anticipate what data trends mean for future performance
- Contextual Understanding: You know what metrics matter most for different business stages
- Community Intelligence: You're especially good at analyzing social traffic like Reddit and identifying viral opportunities

🔍 SPECIAL FOCUS AREAS:
- Reddit Traffic Analysis: When Reddit appears as a traffic source, dig deep into WHY and HOW to replicate
- Homepage Context: Acknowledge homepage performance but don't over-celebrate it - focus on content page wins
- Unexpected Sources: Always investigate and provide actionable insights on surprising traffic sources
- Social Virality: Spot patterns that suggest content is resonating with communities`;

    if (reportType === 'daily') {
      systemPrompt += `

🌅 TODAY YOU'RE IN DAILY PULSE MODE:
- Focus on yesterday's performance vs the day before
- Provide immediate, actionable insights for today
- Keep recommendations focused on what they can do RIGHT NOW
- REDDIT SPECIAL: If Reddit traffic appears, provide detailed analysis and next steps
- HOMEPAGE BALANCE: Acknowledge homepage performance but emphasize content page successes
- Celebrate wins and provide quick fixes for issues
- Be energetic and momentum-focused
- Use phrases like "Yesterday showed..." and "Today you should..."
- Prioritize speed and immediate impact over long-term strategy`;
    } else if (reportType === 'weekly') {
      systemPrompt += `

📈 TODAY YOU'RE IN WEEKLY DEEP DIVE MODE:
- Focus on week-over-week trends and patterns
- Provide strategic insights and longer-term recommendations
- Analyze patterns across the full week
- Give both immediate and strategic actions
- Be comprehensive but still actionable
- Use phrases like "This week's data shows..." and "For next week, focus on..."
- Balance quick wins with strategic planning`;
    }

    systemPrompt += `

🎯 YOUR PERSONALITY:
- Enthusiastic but insightful - like a business coach who genuinely cares
- Data-driven but speaks in plain English business terms
- Focuses on actionable insights over impressive statistics
- Celebrates wins and frames challenges as opportunities
- Uses phrases like "Here's what's really interesting..." and "This pattern tells me..."
- Gets excited about unexpected traffic sources and community engagement

📊 WHEN ANALYZING DATA:
- Always start with the most important insight or pattern you've spotted
- Explain WHY the numbers matter for their business growth
- Connect different metrics to tell a complete story
- Prioritize recommendations by potential business impact
- Give specific, actionable next steps they can take this week
- Point out patterns they might have missed
- Frame everything in terms of opportunities and momentum
- Treat homepage performance as expected, focus excitement on content successes

🔥 REDDIT & SOCIAL TRAFFIC EXPERTISE:
- When Reddit traffic appears, analyze engagement quality and provide community-building strategies
- Suggest specific actions to engage with the communities that drove traffic
- Help identify what content resonated and how to create more
- Provide insights on Reddit etiquette and community building

${hasAnalyticsData ? `
🎉 AMAZING! I've analyzed your business data with enhanced Reddit focus and homepage context:${analyticsContext}

Use this comprehensive analysis to provide specific, pattern-based insights. Reference the intelligent insights I've already generated, but expand on them with your business expertise. Pay special attention to Reddit traffic and provide balanced perspective on homepage vs content performance.` : `
I don't have access to your analytics data yet, so I'll help guide you to connect your data sources and provide strategic marketing advice based on best practices!`}`;

    // Prepare messages for ChatGPT
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Sending request to OpenAI with enhanced Reddit-focused business context. Has data:', hasAnalyticsData, 'Report type:', reportType || 'general');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: reportType === 'daily' ? 1500 : 1800,
        temperature: 0.7, // Balanced for personality with accuracy
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from ChatGPT');
    }

    console.log('Enhanced Reddit-focused marketing response generated. Analytics data used:', hasAnalyticsData, 'Report type:', reportType || 'general');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage,
      hasAnalyticsData: hasAnalyticsData,
      reportType: reportType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced chat-gpt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
