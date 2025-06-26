
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Settings } from 'lucide-react';
import PropertySetup from './PropertySetup';

interface ConnectionStatusProps {
  status: string | null;
  onConfigurationSaved: () => void;
}

const ConnectionStatus = ({ status, onConfigurationSaved }: ConnectionStatusProps) => {
  // Add debug logging to see what status we're getting
  console.log('ConnectionStatus received status:', status);

  if (status === 'not_connected') {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Google Analytics Not Connected
          </CardTitle>
          <CardDescription className="text-amber-700">
            Connect your Google Analytics account to view your website data here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/data-integration'}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Go to Data Integration
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'expired') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Connection Expired
          </CardTitle>
          <CardDescription className="text-red-700">
            Your Google Analytics connection has expired and needs to be renewed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/data-integration'}
            className="bg-red-600 hover:bg-red-700"
          >
            Reconnect Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle all other non-connected states that need property configuration
  // This includes: 'no_property', 'no_token', 'error', and any other state that isn't 'connected'
  if (status !== 'connected') {
    return (
      <div className="space-y-6">
        <Card className="border-periwinkle-200 bg-periwinkle-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-periwinkle-800">
              <Settings className="h-5 w-5" />
              Property Configuration Required
            </CardTitle>
            <CardDescription className="text-periwinkle-700">
              Your Google Analytics needs property configuration. Configure it below to start viewing your analytics.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <PropertySetup onConfigurationSaved={onConfigurationSaved} />
      </div>
    );
  }

  // If status is 'connected', don't show anything (let the main dashboard show)
  return null;
};

export default ConnectionStatus;
