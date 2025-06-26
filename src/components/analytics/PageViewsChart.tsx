
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { DateRange } from '@/lib/analytics-utils';

interface PageViewsChartProps {
  data: any[];
  loading: boolean;
  dateRange?: DateRange;
}

const PageViewsChart = ({ data, loading, dateRange }: PageViewsChartProps) => {
  const processChartData = () => {
    if (!data.length) return [];

    console.log('Processing page views data:', data);

    // Filter data by date range if provided
    let filteredData = data;
    if (dateRange?.startDate && dateRange?.endDate) {
      const startDate = dateRange.startDate.toISOString().split('T')[0];
      const endDate = dateRange.endDate.toISOString().split('T')[0];
      
      filteredData = data.filter(item => {
        const itemDate = item.date_range_start;
        return itemDate >= startDate && itemDate <= endDate;
      });
      
      console.log(`Filtered ${data.length} records to ${filteredData.length} within date range ${startDate} to ${endDate}`);
    }

    // Get real daily breakdown data
    const dailyBreakdownData = filteredData.filter(item => 
      item.data_type === 'daily_breakdown' && 
      item.metric_name === 'daily_sessions'
    ).sort((a, b) => new Date(a.date_range_start).getTime() - new Date(b.date_range_start).getTime());

    console.log('Daily breakdown records found:', dailyBreakdownData.length);

    if (!dailyBreakdownData.length) {
      console.warn('No daily breakdown data found');
      return [];
    }

    // Process real daily data
    const chartData = dailyBreakdownData.map(record => {
      const date = new Date(record.date_range_start);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      const dimensions = record.dimensions || {};
      const sessions = dimensions.sessions || record.metric_value || 0;
      
      return {
        date: formattedDate,
        views: sessions
      };
    });

    console.log('Generated chart data from real daily breakdown:', chartData.slice(0, 5), '... (showing first 5 days)');
    console.log('Total sessions from real data:', chartData.reduce((sum, day) => sum + day.views, 0));
    
    return chartData;
  };

  const chartData = processChartData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Page Views Over Time
          </CardTitle>
          <CardDescription>Daily page view trends</CardDescription>
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
          <TrendingUp className="h-5 w-5 text-iced-matcha-600" />
          Daily Sessions Over Time
        </CardTitle>
        <CardDescription>
          Real daily session data from Google Analytics
          {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
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
                formatter={(value: any) => [value.toLocaleString(), 'Sessions']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#059669', strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-iced-coffee-500">
            No daily session data available for the selected date range. Try syncing data from Google Analytics.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageViewsChart;
