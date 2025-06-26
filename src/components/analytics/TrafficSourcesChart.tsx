import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { addDateRangeFilter, DateRange, deduplicateByKey } from '@/lib/analytics-utils';
import { useLastSync } from '@/contexts/LastSyncContext';

interface TrafficSourcesChartProps {
  data: any[];
  loading: boolean;
  dateRange?: DateRange;
}

const TrafficSourcesChart = ({ data, loading, dateRange }: TrafficSourcesChartProps) => {
  const { user } = useAuth();
  const { lastSync } = useLastSync();
  const [trafficData, setTrafficData] = useState([]);
  const [campaignData, setCampaignData] = useState([]);
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    if (user) {
      fetchTrafficSourceData();
    }
  }, [user, data, dateRange, lastSync]);

  const fetchTrafficSourceData = async () => {
    try {
      console.log('Fetching traffic source data with date range:', dateRange);
      
      // Fetch from the traffic_source_metrics table for accurate data
      let query = supabase
        .from('traffic_source_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', 'current')
        .order('sessions', { ascending: false });

      // Apply date range filter
      query = addDateRangeFilter(query, dateRange);

      const { data: trafficSources, error } = await query;

      if (error) throw error;

      console.log('Traffic source data from DB:', trafficSources);

      // Deduplicate and process traffic sources by medium/channel
      const sourcesByMedium = deduplicateByKey(
        trafficSources || [],
        item => item.medium,
        (existing, newItem) => ({
          ...existing,
          sessions: existing.sessions + newItem.sessions,
          new_users: existing.new_users + newItem.new_users,
          bounce_rate: ((existing.bounce_rate * existing.sessions) + (newItem.bounce_rate * newItem.sessions)) / (existing.sessions + newItem.sessions),
          goal_completions: existing.goal_completions + newItem.goal_completions
        })
      ).map(item => {
        let channelName = item.medium;
        
        // Clean up channel names for better display
        if (channelName === '(none)' || channelName === 'none') {
          channelName = 'Direct';
        } else if (channelName === 'organic') {
          channelName = 'Organic Search';
        } else if (channelName === 'referral') {
          channelName = 'Referral';
        } else if (channelName === 'social') {
          channelName = 'Social';
        } else if (channelName === 'email') {
          channelName = 'Email';
        } else if (channelName === 'paid') {
          channelName = 'Paid Search';
        }

        return {
          name: channelName,
          value: item.sessions,
          users: item.new_users,
          bounceRate: item.bounce_rate,
          conversions: item.goal_completions || 0
        };
      });

      console.log('Processed traffic data:', sourcesByMedium);

      // Process campaign data (if we have campaign info)
      const campaigns = deduplicateByKey(
        trafficSources?.filter(item => item.campaign && item.campaign !== '(organic)' && item.campaign !== '(direct)') || [],
        item => item.campaign,
        (existing, newItem) => ({
          ...existing,
          sessions: existing.sessions + newItem.sessions,
          new_users: existing.new_users + newItem.new_users,
          goal_completions: existing.goal_completions + newItem.goal_completions,
          conversion_rate: ((existing.conversion_rate * existing.sessions) + (newItem.conversion_rate * newItem.sessions)) / (existing.sessions + newItem.sessions)
        })
      ).map(item => ({
        name: item.campaign,
        sessions: item.sessions,
        users: item.new_users,
        conversions: item.goal_completions || 0,
        conversionRate: item.conversion_rate || 0
      })).slice(0, 10);

      setTrafficData(sourcesByMedium);
      setCampaignData(campaigns);
    } catch (error) {
      console.error('Error fetching traffic source data:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Campaigns</CardTitle>
            <CardDescription>Best performing campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-iced-coffee-800">
            <Globe className="h-5 w-5 text-iced-matcha-600" />
            Traffic Sources
          </CardTitle>
          <CardDescription>
            Sessions by traffic medium
            {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trafficData.length > 0 ? (
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value.toLocaleString(), name]}
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {trafficData.map((source, index) => (
                  <div key={source.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-sm">{source.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{source.value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{source.users} new users</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-iced-coffee-500">
              No traffic source data available for the selected date range
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-iced-coffee-800">
            <Globe className="h-5 w-5 text-iced-matcha-600" />
            Top Campaigns
          </CardTitle>
          <CardDescription>
            Best performing campaigns
            {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaignData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="sessions" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-iced-coffee-500">
              No campaign data available for the selected date range
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficSourcesChart;
