import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DateRange, addDateRangeFilter } from '@/lib/analytics-utils';
import { useLastSync } from '@/contexts/LastSyncContext';

interface DeviceAnalyticsChartProps {
  loading: boolean;
  dateRange?: DateRange;
}

// Helper function to aggregate device data by category
const aggregateDeviceData = (data: any[]) => {
  const aggregated = new Map();
  
  data.forEach(item => {
    const key = item.device_category;
    if (aggregated.has(key)) {
      const existing = aggregated.get(key);
      existing.sessions += item.sessions;
      existing.users += item.users;
      existing.bounceRateSum += item.bounce_rate * item.sessions; // Weight by sessions for proper average
      existing.totalSessions += item.sessions;
      existing.recordCount += 1;
    } else {
      aggregated.set(key, {
        name: item.device_category,
        value: item.sessions,
        users: item.users,
        sessions: item.sessions,
        bounceRate: item.bounce_rate || 0,
        bounceRateSum: (item.bounce_rate || 0) * item.sessions,
        totalSessions: item.sessions,
        recordCount: 1
      });
    }
  });
  
  // Calculate weighted average bounce rates and finalize data
  return Array.from(aggregated.values()).map(item => ({
    name: item.name,
    value: item.sessions,
    users: item.users,
    bounceRate: item.totalSessions > 0 ? item.bounceRateSum / item.totalSessions : 0
  }));
};

// Helper function to aggregate browser data
const aggregateBrowserData = (data: any[]) => {
  const aggregated = new Map();
  
  data.forEach(item => {
    const key = item.browser;
    if (aggregated.has(key)) {
      const existing = aggregated.get(key);
      existing.sessions += item.sessions;
      existing.users += item.users;
      existing.bounceRateSum += item.bounce_rate * item.sessions; // Weight by sessions for proper average
      existing.totalSessions += item.sessions;
      existing.recordCount += 1;
    } else {
      aggregated.set(key, {
        name: item.browser,
        sessions: item.sessions,
        users: item.users,
        bounceRate: item.bounce_rate || 0,
        bounceRateSum: (item.bounce_rate || 0) * item.sessions,
        totalSessions: item.sessions,
        recordCount: 1
      });
    }
  });
  
  // Calculate weighted average bounce rates and sort by sessions
  return Array.from(aggregated.values())
    .map(item => ({
      name: item.name,
      sessions: item.sessions,
      users: item.users,
      bounceRate: item.totalSessions > 0 ? item.bounceRateSum / item.totalSessions : 0
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);
};

const DeviceAnalyticsChart = ({ loading, dateRange }: DeviceAnalyticsChartProps) => {
  const { user } = useAuth();
  const { lastSync } = useLastSync();
  const [deviceData, setDeviceData] = useState([]);
  const [browserData, setBrowserData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    if (user) {
      fetchDeviceData();
    }
  }, [user, dateRange, lastSync]);

  const fetchDeviceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching device analytics data for user:', user.id);
      console.log('Date range:', dateRange);

      // Build query with optional date filtering using shared utility
      let query = supabase
        .from('device_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply date range filter using shared utility
      query = addDateRangeFilter(query, dateRange);

      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Raw device analytics data retrieved:', data?.length || 0, 'records');
      console.log('Sample data:', data?.slice(0, 3));

      if (!data || data.length === 0) {
        console.warn('No device analytics data found');
        setDeviceData([]);
        setBrowserData([]);
        return;
      }

      // Check for duplicates before processing
      const deviceCategoryCounts = new Map();
      const browserCounts = new Map();
      
      data.forEach(item => {
        if (item.device_category !== 'Browser Data') {
          const key = item.device_category;
          deviceCategoryCounts.set(key, (deviceCategoryCounts.get(key) || 0) + 1);
        } else if (item.browser !== 'All') {
          const key = item.browser;
          browserCounts.set(key, (browserCounts.get(key) || 0) + 1);
        }
      });

      // Log duplicates found
      const deviceDuplicates = Array.from(deviceCategoryCounts.entries()).filter(([_, count]) => count > 1);
      const browserDuplicates = Array.from(browserCounts.entries()).filter(([_, count]) => count > 1);
      
      if (deviceDuplicates.length > 0) {
        console.warn('⚠️ Device category duplicates found:', deviceDuplicates);
      }
      
      if (browserDuplicates.length > 0) {
        console.warn('⚠️ Browser duplicates found:', browserDuplicates);
      }

      // Filter and aggregate device categories (desktop, mobile, tablet)
      const rawDeviceCategories = data.filter(item => {
        const isDeviceCategory = item.device_category !== 'Browser Data' && 
                               item.browser === 'All' && 
                               item.operating_system === 'All' &&
                               ['desktop', 'mobile', 'tablet'].includes(item.device_category?.toLowerCase());
        return isDeviceCategory;
      });

      // Aggregate device data to handle duplicates
      const aggregatedDeviceData = aggregateDeviceData(rawDeviceCategories);
      console.log('Aggregated device categories:', aggregatedDeviceData);

      // Filter and aggregate browser data
      const rawBrowserData = data.filter(item => {
        const isBrowserData = item.device_category === 'Browser Data' && 
                            item.browser !== 'Unknown' && 
                            item.browser !== 'All' &&
                            item.sessions > 0;
        return isBrowserData;
      });

      // Aggregate browser data to handle duplicates
      const aggregatedBrowserData = aggregateBrowserData(rawBrowserData);
      console.log('Aggregated browsers:', aggregatedBrowserData);

      setDeviceData(aggregatedDeviceData);
      setBrowserData(aggregatedBrowserData);
      
    } catch (error) {
      console.error('Error fetching device data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Categories</CardTitle>
            <CardDescription>Sessions by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Browsers</CardTitle>
            <CardDescription>Most popular browsers</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Device Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchDeviceData}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Browser Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
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
            <Monitor className="h-5 w-5 text-iced-matcha-600" />
            Device Categories
          </CardTitle>
          <CardDescription>
            Sessions by device type • {deviceData.length} categories found
            {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deviceData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {deviceData.map((device, index) => (
                  <div key={`${device.name}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.name)}
                      <span className="font-medium">{device.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{device.value.toLocaleString()} sessions</div>
                      <div className="text-sm text-gray-500">{device.users} users</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-iced-coffee-500 flex-col">
              <p>No device data available</p>
              <button 
                onClick={fetchDeviceData}
                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Data
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-iced-coffee-800">
            <Monitor className="h-5 w-5 text-iced-matcha-600" />
            Top Browsers
          </CardTitle>
          <CardDescription>
            Most popular browsers • {browserData.length} browsers found
            {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {browserData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={browserData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
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
                <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-iced-coffee-500 flex-col">
              <p>No browser data available</p>
              <button 
                onClick={fetchDeviceData}
                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Data
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceAnalyticsChart;
