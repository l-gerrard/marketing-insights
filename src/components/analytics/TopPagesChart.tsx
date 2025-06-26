import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DateRange, addDateRangeFilter } from '@/lib/analytics-utils';
import { useLastSync } from '@/contexts/LastSyncContext';

interface TopPagesChartProps {
  loading: boolean;
  dateRange?: DateRange;
}

const TopPagesChart = ({ loading: parentLoading, dateRange }: TopPagesChartProps) => {
  const { user } = useAuth();
  const { lastSync } = useLastSync();
  const [pageData, setPageData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPageData();
    }
  }, [user, dateRange, lastSync]);

  const fetchPageData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching page performance data for user:', user.id);
      console.log('Date range:', dateRange);

      // Build query with optional date filtering using shared utility
      let query = supabase
        .from('page_performance_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('page_views', { ascending: false });

      // Apply date range filter using shared utility
      query = addDateRangeFilter(query, dateRange);

      const { data, error } = await query.limit(10);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Raw page performance data retrieved:', data?.length || 0, 'records');
      console.log('Sample data:', data?.slice(0, 3));

      if (!data || data.length === 0) {
        console.warn('No page performance data found');
        setPageData([]);
        return;
      }

      // Process and aggregate the data by page_path
      const aggregatedPages = aggregatePageData(data);
      console.log('Aggregated page data:', aggregatedPages);

      setPageData(aggregatedPages);
      
    } catch (error) {
      console.error('Error fetching page data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const aggregatePageData = (data) => {
    const pageMap = new Map();
    
    data.forEach(item => {
      const pagePath = item.page_path || 'Unknown';
      
      if (pageMap.has(pagePath)) {
        const existing = pageMap.get(pagePath);
        existing.page_views += item.page_views || 0;
        existing.unique_page_views += item.unique_page_views || 0;
        existing.entrances += item.entrances || 0;
        // Use the page title from the most recent record if available
        if (item.page_title && !existing.page_title) {
          existing.page_title = item.page_title;
        }
      } else {
        pageMap.set(pagePath, {
          page_path: pagePath,
          page_title: item.page_title || pagePath,
          page_views: item.page_views || 0,
          unique_page_views: item.unique_page_views || 0,
          entrances: item.entrances || 0,
          avg_time_on_page: item.avg_time_on_page || 0,
          bounce_rate: item.bounce_rate || 0
        });
      }
    });

    return Array.from(pageMap.values())
      .sort((a, b) => b.page_views - a.page_views)
      .slice(0, 10);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (parentLoading || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Top Pages
          </CardTitle>
          <CardDescription>Most visited pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <FileText className="h-5 w-5" />
            Error Loading Page Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchPageData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-iced-coffee-800">
          <FileText className="h-5 w-5 text-iced-matcha-600" />
          Top Pages
        </CardTitle>
        <CardDescription>
          Most visited pages by page views • {pageData.length} pages found
          {dateRange && ` • ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pageData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Page</TableHead>
                <TableHead className="text-right w-24">Views</TableHead>
                <TableHead className="text-right w-24">Unique</TableHead>
                <TableHead className="text-right w-24">Avg Time</TableHead>
                <TableHead className="text-right w-24">Bounce %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((page, index) => (
                <TableRow key={`page-${page.page_path}-${index}`}>
                  <TableCell className="font-medium text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-mono text-sm text-blue-600">
                        {page.page_path}
                      </div>
                      {page.page_title && page.page_title !== page.page_path && (
                        <div className="text-xs text-gray-500 mt-1">
                          {page.page_title}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {page.page_views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {page.unique_page_views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTime(page.avg_time_on_page)}
                  </TableCell>
                  <TableCell className="text-right">
                    {page.bounce_rate ? `${(page.bounce_rate * 100).toFixed(1)}%` : '0%'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-iced-coffee-500 flex-col">
            <p>No page data available</p>
            <button 
              onClick={fetchPageData}
              className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Data
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const aggregatePageData = (data) => {
  const pageMap = new Map();
  
  data.forEach(item => {
    const pagePath = item.page_path || 'Unknown';
    
    if (pageMap.has(pagePath)) {
      const existing = pageMap.get(pagePath);
      existing.page_views += item.page_views || 0;
      existing.unique_page_views += item.unique_page_views || 0;
      existing.entrances += item.entrances || 0;
      // Use the page title from the most recent record if available
      if (item.page_title && !existing.page_title) {
        existing.page_title = item.page_title;
      }
    } else {
      pageMap.set(pagePath, {
        page_path: pagePath,
        page_title: item.page_title || pagePath,
        page_views: item.page_views || 0,
        unique_page_views: item.unique_page_views || 0,
        entrances: item.entrances || 0,
        avg_time_on_page: item.avg_time_on_page || 0,
        bounce_rate: item.bounce_rate || 0
      });
    }
  });

  return Array.from(pageMap.values())
    .sort((a, b) => b.page_views - a.page_views)
    .slice(0, 10);
};

const formatTime = (seconds) => {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export default TopPagesChart;
