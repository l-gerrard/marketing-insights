import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DateRange, addDateRangeFilter } from '@/lib/analytics-utils';
import { useLastSync } from '@/contexts/LastSyncContext';

interface TimeAnalyticsChartProps {
  loading: boolean;
  dateRange?: DateRange;
}

const TimeAnalyticsChart = ({ loading, dateRange }: TimeAnalyticsChartProps) => {
  const { user } = useAuth();
  const { lastSync } = useLastSync();
  const [hourlyData, setHourlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    if (user) {
      fetchTimeData();
    }
  }, [user, dateRange, lastSync]);

  const fetchTimeData = async () => {
    try {
      let query = supabase
        .from('time_analytics')
        .select('*')
        .eq('user_id', user.id);

      // Apply date range filter
      query = addDateRangeFilter(query, dateRange);

      const { data, error } = await query;

      if (error) throw error;

      // Process hourly data
      const hourlyStats = Array.from({ length: 24 }, (_, i) => ({ hour: i, sessions: 0, users: 0 }));
      data.forEach(item => {
        if (item.hour_of_day !== null && item.hour_of_day >= 0 && item.hour_of_day <= 23) {
          hourlyStats[item.hour_of_day].sessions += item.sessions;
          hourlyStats[item.hour_of_day].users += item.users;
        }
      });

      // Process weekly data (0 = Sunday, 1 = Monday, etc.)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weeklyStats = Array.from({ length: 7 }, (_, i) => ({ 
        day: dayNames[i], 
        dayNum: i,
        sessions: 0, 
        users: 0 
      }));
      
      data.forEach(item => {
        if (item.day_of_week !== null && item.day_of_week >= 0 && item.day_of_week <= 6) {
          weeklyStats[item.day_of_week].sessions += item.sessions;
          weeklyStats[item.day_of_week].users += item.users;
        }
      });

      setHourlyData(hourlyStats);
      setWeeklyData(weeklyStats);
    } catch (error) {
      console.error('Error fetching time data:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Traffic</CardTitle>
            <CardDescription>Sessions by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Traffic</CardTitle>
            <CardDescription>Sessions by day of week</CardDescription>
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
            <Clock className="h-5 w-5 text-iced-matcha-600" />
            Hourly Traffic
          </CardTitle>
          <CardDescription>
            Sessions by hour of day (24-hour format)
            {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(hour) => `${hour}:00`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-iced-coffee-500">
              No hourly data available for the selected date range
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-iced-coffee-800">
            <Clock className="h-5 w-5 text-iced-matcha-600" />
            Daily Traffic
          </CardTitle>
          <CardDescription>
            Sessions by day of week
            {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="sessions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-iced-coffee-500">
              No daily data available for the selected date range
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeAnalyticsChart;
