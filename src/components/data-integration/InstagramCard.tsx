
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, CheckCircle, AlertCircle, RefreshCcw, Loader, Download, Calendar } from 'lucide-react';
import { useInstagramData } from '@/hooks/useInstagramData';
import { Badge } from '@/components/ui/badge';

interface InstagramCardProps {
  isConnected: boolean;
  connectionStatus?: string;
  loading: { [key: string]: boolean };
  configurations: { [key: string]: any };
  onConnect: () => void;
  onRefreshProperties: () => void;
  onSyncData: () => void;
}

const InstagramCard = ({
  isConnected,
  connectionStatus,
  loading,
  configurations,
  onConnect,
  onRefreshProperties,
  onSyncData
}: InstagramCardProps) => {
  const { 
    isLoading: isDataLoading, 
    lastSyncTime, 
    fetchInstagramData 
  } = useInstagramData();

  const handleSyncInstagramData = async () => {
    try {
      await fetchInstagramData();
      // Call the parent's onSyncData to update any other state
      onSyncData();
    } catch (error) {
      console.error('Error syncing Instagram data:', error);
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="border-pink-lavender-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-pink-lavender-800">
          <div className="p-2 bg-pink-lavender-100 rounded-lg">
            <Instagram className="h-6 w-6 text-pink-lavender-700" />
          </div>
          Instagram Analytics
          {isConnected && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
        <CardDescription>
          Connect your Instagram Business account to track post performance, engagement, and audience insights.
          {connectionStatus && (
            <div className="mt-2 text-sm">
              <span className={`inline-flex items-center gap-1 ${
                connectionStatus === 'Connected and configured' 
                  ? 'text-green-600' 
                  : connectionStatus.includes('expired')
                  ? 'text-red-600'
                  : 'text-amber-600'
              }`}>
                {connectionStatus.includes('expired') && <AlertCircle className="h-3 w-3" />}
                {connectionStatus === 'Connected and configured' && <CheckCircle className="h-3 w-3" />}
                {connectionStatus}
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onConnect}
            disabled={loading.instagram}
            className="bg-gradient-to-r from-pink-lavender-500 to-puce-500 hover:from-pink-lavender-600 hover:to-puce-600 text-white"
          >
            {loading.instagram ? 'Connecting...' : (isConnected ? 'Reconnect Instagram' : 'Connect Instagram')}
          </Button>
          
          {isConnected && (
            <Button
              onClick={onRefreshProperties}
              disabled={loading.instagram_refresh}
              variant="outline"
              className="border-pink-lavender-300 text-pink-lavender-700 hover:bg-pink-lavender-50"
            >
              {loading.instagram_refresh ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh Connection
                </>
              )}
            </Button>
          )}
        </div>

        {/* Data Sync Section */}
        {isConnected && configurations.instagram?.property_id && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-medium text-pink-lavender-800 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data Synchronization
            </h4>
            
            {lastSyncTime && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>Last sync: {formatLastSync(lastSyncTime)}</span>
              </div>
            )}
            
            <Button
              onClick={handleSyncInstagramData}
              disabled={loading.instagram || isDataLoading}
              variant="outline"
              className="w-full border-pink-lavender-300 text-pink-lavender-700 hover:bg-pink-lavender-50"
            >
              {(loading.instagram || isDataLoading) ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Syncing Data...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Sync Instagram Data
                </>
              )}
            </Button>
            
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                Posts & Media
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Engagement Metrics
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Audience Insights
              </Badge>
            </div>
          </div>
        )}

        {/* Status Information */}
        {isConnected && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <p className="mb-1">✅ Ready to sync Instagram analytics data</p>
            <p>📊 Includes posts, engagement metrics, and audience insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstagramCard;
