import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCcw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import DateRangePicker from './DateRangePicker';
import PageViewsChart from './PageViewsChart';
import TopPagesChart from './TopPagesChart';
import TrafficSourcesChart from './TrafficSourcesChart';
import EnhancedMetricsCards from './EnhancedMetricsCards';
import DeviceAnalyticsChart from './DeviceAnalyticsChart';
import GeographicAnalyticsChart from './GeographicAnalyticsChart';
import TimeAnalyticsChart from './TimeAnalyticsChart';
import ConnectionStatus from './ConnectionStatus';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshGoogleAnalyticsToken, refreshing } = useTokenRefresh();
  const [loading, setLoading] = useState(false);
  const [currentAnalyticsData, setCurrentAnalyticsData] = useState([]);
  const [comparisonAnalyticsData, setComparisonAnalyticsData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });

  const checkConnectionStatus = async () => {
    if (!user) {
      console.log('No user found, cannot check connection');
      setConnectionStatus('not_connected');
      setCheckingConnection(false);
      return;
    }

    console.log('=== CHECKING CONNECTION STATUS ===');
    console.log('User ID:', user.id);
    setCheckingConnection(true);

    try {
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection check timeout')), 10000)
      );

      // Check for API connection with timeout
      const connectionPromise = supabase
        .from('api_connections')
        .select('configuration, expires_at, access_token, refresh_token')
        .eq('user_id', user.id)
        .eq('provider', 'google_analytics')
        .maybeSingle();

      const { data: connection, error: connectionError } = await Promise.race([
        connectionPromise,
        timeoutPromise
      ]) as any;

      console.log('Connection query result:', { connection, connectionError });

      if (connectionError) {
        console.log('Connection error:', connectionError);
        if (connectionError.code === 'PGRST116' || connectionError.message?.includes('No rows')) {
          console.log('No connection found - setting status to not_connected');
          setConnectionStatus('not_connected');
          setCheckingConnection(false);
          return;
        }
        console.error('Database error:', connectionError);
        setConnectionStatus('error');
        setCheckingConnection(false);
        return;
      }

      if (!connection) {
        console.log('No connection data - setting status to not_connected');
        setConnectionStatus('not_connected');
        setCheckingConnection(false);
        return;
      }

      // Check token validity
      const hasToken = !!connection.access_token;
      const isExpired = connection.expires_at && new Date(connection.expires_at) < new Date();
      const hasPropertyId = !!(connection.configuration as any)?.property_id;

      console.log('Connection analysis:', {
        hasToken,
        isExpired,
        hasPropertyId,
        expiresAt: connection.expires_at,
        configuration: connection.configuration
      });

      // Handle expired token with automatic refresh
      if (hasToken && isExpired && connection.refresh_token) {
        console.log('Token expired, attempting automatic refresh...');
        const refreshSuccess = await refreshGoogleAnalyticsToken(user.id);
        
        if (refreshSuccess) {
          // Re-check connection after successful refresh
          console.log('Token refreshed, re-checking connection...');
          await checkConnectionStatus();
          return;
        } else {
          console.log('Auto-refresh failed - setting status to expired');
          setConnectionStatus('expired');
          setCheckingConnection(false);
          return;
        }
      }

      // Determine status based on connection state
      if (!hasToken) {
        console.log('No access token - setting status to no_token');
        setConnectionStatus('no_token');
      } else if (isExpired) {
        console.log('Token expired and no refresh token - setting status to expired');
        setConnectionStatus('expired');
      } else if (!hasPropertyId) {
        console.log('No property ID configured - setting status to no_property');
        setConnectionStatus('no_property');
      } else {
        console.log('Connection appears valid - setting status to connected');
        setConnectionStatus('connected');
      }

    } catch (error) {
      console.error('Error checking connection status:', error);
      
      // Handle timeout specifically
      if (error.message === 'Connection check timeout') {
        console.error('Connection check timed out - likely database issue');
        setConnectionStatus('error');
        toast({
          title: 'Connection Check Timeout',
          description: 'Unable to verify connection status. Please refresh the page.',
          variant: 'destructive'
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Connection Check Failed',
          description: 'Unable to verify Google Analytics connection status. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setCheckingConnection(false);
    }
  };

  const clearConnectionAndRedirect = async () => {
    if (!user) return;

    console.log('=== CLEARING EXPIRED CONNECTION ===');
    
    try {
      // Clear the broken connection
      await supabase
        .from('api_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'google_analytics');

      // Clear stored properties
      await supabase
        .from('user_analytics_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'google_analytics');

      toast({
        title: 'Connection Cleared',
        description: 'Please go to Data Integration to reconnect your Google Analytics account.',
      });

      // Update status to reflect cleared state
      setConnectionStatus('not_connected');
      
    } catch (error) {
      console.error('Error clearing connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear connection. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const fetchAnalyticsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch current period data
      const { data: currentData, error: currentError } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', 'current')
        .gte('date_range_start', dateRange.startDate.toISOString().split('T')[0])
        .lte('date_range_end', dateRange.endDate.toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (currentError) throw currentError;

      // Fetch comparison period data
      const { data: comparisonData, error: comparisonError } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', 'comparison')
        .order('created_at', { ascending: false });

      if (comparisonError) throw comparisonError;

      console.log('Current data count:', currentData?.length || 0);
      console.log('Comparison data count:', comparisonData?.length || 0);

      setCurrentAnalyticsData(currentData || []);
      setComparisonAnalyticsData(comparisonData || []);
      setSyncError(null);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const syncData = async (retryCount = 0) => {
    setLoading(true);
    setSyncError(null);
    
    try {
      console.log('Starting data sync...');
      
      const { data, error } = await supabase.functions.invoke('fetch-analytics-data', {
        body: { provider: 'google_analytics' }
      });

      console.log('Sync response:', { data, error });

      if (error) {
        console.error('Sync error:', error);
        
        // Check if it's an authentication error and we haven't retried yet
        if ((error.message?.includes('insufficient authentication scopes') || 
             error.message?.includes('Token refresh failed') ||
             error.message?.includes('expired') ||
             error.message?.includes('authentication')) && 
             retryCount === 0) {
          
          console.log('Authentication error detected, attempting token refresh...');
          const refreshSuccess = await refreshGoogleAnalyticsToken(user.id);
          
          if (refreshSuccess) {
            console.log('Token refreshed, retrying sync...');
            return await syncData(1); // Retry once after refresh
          }
        }
        
        setSyncError(error.message || 'Unknown sync error');
        
        if (error.message?.includes('insufficient authentication scopes') || 
            error.message?.includes('Token refresh failed') ||
            error.message?.includes('expired')) {
          
          setConnectionStatus('expired');
          toast({
            title: 'Connection Expired',
            description: 'Your Google Analytics connection has expired. The system attempted to refresh it automatically but failed. Please reconnect your account.',
            variant: 'destructive'
          });
        } else if (error.message?.includes('API limit') || error.message?.includes('metrics')) {
          toast({
            title: 'API Limit Error',
            description: 'Google Analytics API request limit exceeded. The system will automatically retry with fewer metrics.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Sync Failed',
            description: `Failed to sync data: ${error.message}`,
            variant: 'destructive'
          });
        }
        return;
      }

      if (data?.success) {
        toast({
          title: 'Enhanced Data Synced',
          description: `Successfully synced ${data?.records_processed || 0} records with comparison data and enhanced analytics`,
        });

        // Refresh the data after successful sync
        await fetchAnalyticsData();
      } else {
        setSyncError('Sync completed but no data was returned');
        toast({
          title: 'Sync Warning',
          description: 'Sync completed but no data was returned. Please check your Google Analytics configuration.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncError(error.message || 'Unknown error occurred during sync');
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync enhanced data from Google Analytics. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurationSaved = () => {
    console.log('Configuration saved, rechecking connection status');
    checkConnectionStatus();
    fetchAnalyticsData();
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
      fetchAnalyticsData();
    }
  }, [user, dateRange]);

  console.log('Render state:', { connectionStatus, checkingConnection, loading, refreshing });

  // Show loading while checking connection or refreshing token
  if (checkingConnection || refreshing) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-maya-blue-800">Enhanced Analytics Dashboard</h1>
          <p className="text-maya-blue-600 mt-2">
            Monitor your website performance with comprehensive insights and comparisons
          </p>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maya-blue-500"></div>
          <span className="ml-3 text-maya-blue-600">
            {refreshing 
              ? 'Refreshing connection...' 
              : 'Checking connection status...'
            }
          </span>
        </div>
      </div>
    );
  }

  // Show connection issues if not connected
  if (connectionStatus && connectionStatus !== 'connected') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-maya-blue-800">Enhanced Analytics Dashboard</h1>
          <p className="text-maya-blue-600 mt-2">
            Monitor your website performance with comprehensive insights and comparisons
          </p>
        </div>

        {/* Show clear connection issue */}
        {(connectionStatus === 'expired' || connectionStatus === 'error') && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                Connection Issue Detected
              </CardTitle>
              <CardDescription className="text-red-700">
                Your Google Analytics connection has expired or encountered an error. 
                {connectionStatus === 'expired' && ' The automatic token refresh failed and manual reconnection is required.'}
                {connectionStatus === 'error' && ' There was an error checking your connection status.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={clearConnectionAndRedirect}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear Connection & Go to Data Integration
              </Button>
              <p className="text-sm text-red-600">
                This will clear your current connection and redirect you to set up a fresh connection.
              </p>
            </CardContent>
          </Card>
        )}
        
        <ConnectionStatus 
          status={connectionStatus} 
          onConfigurationSaved={handleConfigurationSaved}
        />
      </div>
    );
  }

  // Main dashboard content for connected state
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-maya-blue-800">Enhanced Analytics Dashboard</h1>
          <p className="text-maya-blue-600 mt-2">
            Monitor your website performance with comprehensive insights, device analytics, geographic data, and period comparisons
          </p>
        </div>
        <div className="mb-4">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        <div>
          <Button
            onClick={() => syncData()}
            disabled={loading}
            size="sm"
            className="bg-vivid-sky-blue-500 hover:bg-vivid-sky-blue-600"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync Enhanced Data
          </Button>
        </div>
      </div>

      {syncError && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Sync Error
            </CardTitle>
            <CardDescription className="text-red-700">
              {syncError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                onClick={() => syncData()}
                disabled={loading}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {loading ? 'Retrying...' : 'Retry Sync'}
              </Button>
              {(syncError.includes('expired') || syncError.includes('authentication')) && (
                <Button 
                  onClick={clearConnectionAndRedirect}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reconnect Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <EnhancedMetricsCards 
        currentData={currentAnalyticsData} 
        comparisonData={comparisonAnalyticsData}
        loading={loading}
        dateRange={dateRange}
        onRefresh={handleRefresh}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageViewsChart data={currentAnalyticsData} loading={loading} dateRange={dateRange} />
        <TrafficSourcesChart data={currentAnalyticsData} loading={loading} dateRange={dateRange} />
      </div>

      <TopPagesChart 
        loading={loading} 
        dateRange={dateRange}
      />

      <DeviceAnalyticsChart loading={loading} dateRange={dateRange} />

      <GeographicAnalyticsChart loading={loading} dateRange={dateRange} />

      <TimeAnalyticsChart loading={loading} dateRange={dateRange} />

      {currentAnalyticsData.length === 0 && !loading && connectionStatus === 'connected' && !syncError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Calendar className="h-5 w-5" />
              No Data Available
            </CardTitle>
            <CardDescription className="text-amber-700">
              No analytics data found for the selected date range. Try syncing enhanced data from Google Analytics or check your property configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                onClick={() => syncData()}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {loading ? 'Syncing Enhanced Data...' : 'Sync Enhanced Analytics Data'}
              </Button>
              <Button 
                onClick={() => window.location.href = '/data-integration'}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Check Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
