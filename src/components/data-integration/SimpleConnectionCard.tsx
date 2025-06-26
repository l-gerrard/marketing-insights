
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader, AlertCircle, BarChart3, Shield, Lock, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SimpleConnectionCardProps {
  onConnect: () => Promise<void>;
  loading: { [key: string]: boolean };
  isConnected: boolean;
  connectionStatus?: string;
}

const SimpleConnectionCard = ({
  onConnect,
  loading,
  isConnected,
  connectionStatus
}: SimpleConnectionCardProps) => {
  const { toast } = useToast();

  const needsReconnection = connectionStatus?.includes('expired') || connectionStatus?.includes('insufficient');

  const handleConnect = async () => {
    toast({
      title: '🔐 Secure Authentication Starting',
      description: 'You\'ll be redirected to Google\'s secure servers to authorize access. This is completely safe.',
    });
    await onConnect();
  };

  return (
    <Card className="border-2 border-vivid-sky-blue-200 bg-gradient-to-br from-white to-vivid-sky-blue-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-vivid-sky-blue-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-vivid-sky-blue-600" />
        </div>
        <CardTitle className="text-2xl text-maya-blue-800 flex items-center justify-center gap-2">
          Step 1: Connect Google Analytics
          {isConnected && !needsReconnection && (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
        </CardTitle>
        <CardDescription className="text-lg">
          Securely link your Google Analytics account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Security & Trust Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">🔒 Your Data is Secure</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              <span>Bank-level encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Google OAuth certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Read-only access only</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              <span>No data stored permanently</span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">What to expect during authentication:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You'll be redirected to Google's secure login</li>
                <li>• You may briefly see "oaeslntqvgbcxhbajmpy.supabase.co" - this is our secure backend</li>
                <li>• This is completely normal and safe</li>
                <li>• You'll be brought back here automatically once connected</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Connection Button */}
        <div className="text-center">
          <Button
            onClick={handleConnect}
            disabled={loading.google_analytics}
            size="lg"
            className="bg-vivid-sky-blue-500 hover:bg-vivid-sky-blue-600 text-white px-8 py-3 text-lg"
          >
            {loading.google_analytics ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-3" />
                <span>Securely Connecting...</span>
              </>
            ) : needsReconnection ? (
              <>
                <Shield className="h-5 w-5 mr-3" />
                Securely Reconnect & Fix Issues
              </>
            ) : isConnected ? (
              <>
                <CheckCircle className="h-5 w-5 mr-3" />
                ✅ Connected to Google Analytics
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-3" />
                Connect Securely via Google OAuth
              </>
            )}
          </Button>
          <div className="text-sm text-maya-blue-500 mt-2 space-y-1">
            <p>🔐 Powered by Google OAuth - Industry Standard Security</p>
            {!isConnected && <p>After connecting, you'll configure your website property</p>}
          </div>
        </div>

        {/* Error State */}
        {needsReconnection && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Connection Issue</span>
            </div>
            <p className="text-red-700 text-sm mb-3">
              Your connection needs to be updated with the latest permissions. Click "Securely Reconnect & Fix Issues" above to resolve this safely.
            </p>
          </div>
        )}

        {/* Success State */}
        {isConnected && !needsReconnection && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 mb-1">✅ Successfully Connected!</h3>
            <p className="text-green-700 text-sm">
              Now proceed to Step 2 below to configure your website property.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleConnectionCard;
