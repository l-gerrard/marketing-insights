
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle, AlertCircle, RefreshCcw, Loader, AlertTriangle, Shield } from 'lucide-react';

interface GoogleAnalyticsCardProps {
  isConnected: boolean;
  connectionStatus?: string;
  loading: { [key: string]: boolean };
  configurations: { [key: string]: any };
  onConnect: () => void;
  onReconnect: () => void;
  onRefreshProperties: () => void;
  onSyncData: () => void;
}

const GoogleAnalyticsCard = ({
  isConnected,
  connectionStatus,
  loading,
  configurations,
  onConnect,
  onReconnect,
  onRefreshProperties,
  onSyncData
}: GoogleAnalyticsCardProps) => {
  const isExpired = connectionStatus?.includes('expired');
  const hasPermissionIssues = connectionStatus?.includes('insufficient') || connectionStatus?.includes('Connection Issue');
  const needsReconnection = !isConnected || isExpired || hasPermissionIssues;

  const getConnectionStatusDisplay = () => {
    if (connectionStatus?.includes('Connection Issue')) {
      return 'Connection requires updated permissions';
    }
    if (connectionStatus?.includes('expired')) {
      return 'Connection expired - please reconnect';
    }
    if (connectionStatus?.includes('insufficient')) {
      return 'Insufficient permissions - please reconnect';
    }
    return connectionStatus;
  };

  return (
    <Card className="border-maya-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-maya-blue-800">
          <div className="p-2 bg-maya-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-maya-blue-700" />
          </div>
          Google Analytics
          {isConnected && !needsReconnection && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {needsReconnection && (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
        </CardTitle>
        <CardDescription>
          Securely connect your Google Analytics account to analyze website traffic, user behavior, and conversion data with bank-level encryption.
          {connectionStatus && (
            <div className="mt-2 text-sm">
              <span className={`inline-flex items-center gap-1 ${
                connectionStatus === 'Connected and configured' 
                  ? 'text-green-600' 
                  : connectionStatus.includes('expired') || connectionStatus.includes('insufficient') || connectionStatus.includes('Connection Issue')
                  ? 'text-red-600'
                  : 'text-amber-600'
              }`}>
                {(connectionStatus.includes('expired') || connectionStatus.includes('insufficient') || connectionStatus.includes('Connection Issue')) && <AlertCircle className="h-3 w-3" />}
                {connectionStatus === 'Connected and configured' && <CheckCircle className="h-3 w-3" />}
                {getConnectionStatusDisplay()}
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsReconnection && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Connection Issue Detected</span>
            </div>
            <p className="text-sm text-red-700">
              {hasPermissionIssues 
                ? "Your Google Analytics connection doesn't have the required permissions to access the GA4 Data API. Please reconnect securely to grant the necessary analytics access permissions."
                : "Your Google Analytics connection has expired and needs to be renewed with fresh authentication."
              }
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {needsReconnection ? (
            <Button
              onClick={onReconnect}
              disabled={loading.google_analytics}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading.google_analytics ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Securely Reconnecting...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Securely Reconnect & Fix Issues
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={onRefreshProperties}
                disabled={loading.google_analytics_refresh}
                variant="outline"
                className="border-maya-blue-300 text-maya-blue-700 hover:bg-maya-blue-50"
              >
                {loading.google_analytics_refresh ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh Properties
                  </>
                )}
              </Button>
              
              <Button
                onClick={onReconnect}
                variant="ghost"
                size="sm"
                className="text-maya-blue-500"
              >
                <Shield className="h-4 w-4 mr-1" />
                Reconnect
              </Button>
            </div>
          )}
          
          {isConnected && configurations.google_analytics?.property_id && !needsReconnection && (
            <Button
              onClick={onSyncData}
              disabled={loading.google_analytics}
              variant="outline"
              className="border-maya-blue-300 text-maya-blue-700 hover:bg-maya-blue-50"
            >
              {loading.google_analytics ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Securely Syncing Data...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sync Analytics Data Securely
                </>
              )}
            </Button>
          )}
        </div>

        {/* Trust indicators */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">🔒 Security Promise</span>
          </div>
          <div className="text-xs text-green-700 space-y-1">
            <p>• Your data is encrypted in transit and at rest</p>
            <p>• We only request read-only access to your analytics</p>
            <p>• Authentication is handled by Google's secure OAuth system</p>
            <p>• Fresh permissions ensure optimal performance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleAnalyticsCard;
