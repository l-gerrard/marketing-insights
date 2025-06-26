
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DateRange, addDateRangeFilter } from '@/lib/analytics-utils';

interface GeographicAnalyticsChartProps {
  loading: boolean;
  dateRange?: DateRange;
}

const GeographicAnalyticsChart = ({ loading, dateRange }: GeographicAnalyticsChartProps) => {
  const { user } = useAuth();
  const [countryData, setCountryData] = useState([]);

  useEffect(() => {
    if (user) {
      fetchGeographicData();
    }
  }, [user, dateRange]);

  const fetchGeographicData = async () => {
    try {
      let query = supabase
        .from('geographic_analytics')
        .select('*')
        .eq('user_id', user.id);

      // Apply date range filter
      query = addDateRangeFilter(query, dateRange);

      const { data, error } = await query.order('sessions', { ascending: false });

      if (error) throw error;

      console.log('Geographic data fetched:', data);

      // Process country data with proper aggregation
      const countryMap = new Map();
      data.forEach(item => {
        if (item.country && item.country !== 'Unknown') {
          const existing = countryMap.get(item.country);
          if (existing) {
            existing.sessions += item.sessions || 0;
            existing.users += item.users || 0;
            existing.pageViews += item.page_views || 0;
          } else {
            countryMap.set(item.country, {
              country: item.country,
              sessions: item.sessions || 0,
              users: item.users || 0,
              pageViews: item.page_views || 0,
              bounceRate: item.bounce_rate || 0
            });
          }
        }
      });

      // Convert to array and sort by sessions
      const countries = Array.from(countryMap.values())
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10)
        .map((item, index) => ({
          ...item,
          id: `country-${index}`, // Add unique ID for React keys
          name: item.country // Add name field for chart
        }));

      console.log('Processed countries:', countries);

      setCountryData(countries);
    } catch (error) {
      console.error('Error fetching geographic data:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
          <CardDescription>Sessions by country</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-iced-coffee-800">
          <Globe className="h-5 w-5 text-iced-matcha-600" />
          Top Countries
        </CardTitle>
        <CardDescription>
          Sessions by country
          {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {countryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
                formatter={(value, name) => [value, name === 'sessions' ? 'Sessions' : name]}
              />
              <Bar 
                dataKey="sessions" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="Sessions"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-iced-coffee-500">
            No country data available for the selected date range
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeographicAnalyticsChart;
