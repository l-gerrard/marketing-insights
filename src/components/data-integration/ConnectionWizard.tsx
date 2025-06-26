
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader, AlertCircle, BarChart3, ArrowRight, Play, Shield, Lock, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ConnectionWizardProps {
  onConnect: () => Promise<void>;
  onSyncData: () => Promise<void>;
  loading: { [key: string]: boolean };
  isConnected: boolean;
  connectionStatus?: string;
  configurations: { [key: string]: any };
}

const ConnectionWizard = ({
  onConnect,
  onSyncData,
  loading,
  isConnected,
  connectionStatus,
  configurations
}: ConnectionWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: 1, title: 'Connect Account', description: 'Link your Google Analytics account' },
    { id: 2, title: 'Auto-Configure', description: 'We\'ll find your website data automatically' },
    { id: 3, title: 'Import Data', description: 'Sync your analytics data' },
    { id: 4, title: 'View Dashboard', description: 'See your insights' }
  ];

  const isStepComplete = (stepId: number) => {
    if (stepId === 1) return isConnected;
    if (stepId === 2) return isConnected && configurations.google_analytics?.property_id;
    if (stepId === 3) return connectionStatus === 'Connected and configured';
    return false;
  };

  const isStepActive = (stepId: number) => {
    if (!isConnected && stepId === 1) return true;
    if (isConnected && !configurations.google_analytics?.property_id && stepId === 2) return true;
    if (isConnected && configurations.google_analytics?.property_id && stepId === 3) return true;
    return false;
  };

  const handleOneClickSetup = async () => {
    setIsConnecting(true);
    setCurrentStep(1);
    
    // Show trust-building pre-authorization message
    toast({
      title: '🔐 Secure Authentication Starting',
      description: 'You\'ll be redirected to Google\'s secure servers to authorize access. This is completely safe and standard practice.',
    });
    
    try {
      // Step 1: Connect
      if (!isConnected) {
        toast({
          title: '🔄 Connecting to Google Analytics...',
          description: 'You may see "oaeslntqvgbcxhbajmpy.supabase.co" during authentication - this is our secure backend service and is completely safe.',
        });
        await onConnect();
        setCurrentStep(2);
      }

      // Wait a moment for the connection to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Sync data (property discovery happens automatically in the backend)
      if (configurations.google_analytics?.property_id) {
        setCurrentStep(3);
        toast({
          title: '📊 Syncing your data...',
          description: 'Securely importing your analytics data through our encrypted connection',
        });
        await onSyncData();
        setCurrentStep(4);
        
        toast({
          title: '✅ Setup Complete! 🎉',
          description: 'Your Google Analytics is now securely connected and data is synced',
        });
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: 'Setup Error',
        description: 'Something went wrong during setup. Please try the manual steps below.',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const needsReconnection = connectionStatus?.includes('expired') || connectionStatus?.includes('insufficient');

  return (
    <Card className="border-2 border-vivid-sky-blue-200 bg-gradient-to-br from-white to-vivid-sky-blue-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-vivid-sky-blue-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-vivid-sky-blue-600" />
        </div>
        <CardTitle className="text-2xl text-maya-blue-800">
          Connect Your Google Analytics
        </CardTitle>
        <CardDescription className="text-lg">
          Get AI-powered insights from your website data in just a few clicks
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
                <li>• You may briefly see "oaeslntqvgbcxhbajmpy.supabase.co" - this is our secure backend service</li>
                <li>• This is completely normal and safe - it's how we securely connect to your analytics</li>
                <li>• You'll be brought back here automatically once connected</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced One-Click Setup Button */}
        <div className="text-center">
          <Button
            onClick={handleOneClickSetup}
            disabled={isConnecting || loading.google_analytics}
            size="lg"
            className="bg-vivid-sky-blue-500 hover:bg-vivid-sky-blue-600 text-white px-8 py-3 text-lg"
          >
            {isConnecting || loading.google_analytics ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-3" />
                <span>Securely Connecting...</span>
              </>
            ) : needsReconnection ? (
              <>
                <Shield className="h-5 w-5 mr-3" />
                Securely Reconnect & Fix Issues
              </>
            ) : isConnected && configurations.google_analytics?.property_id ? (
              <>
                <ArrowRight className="h-5 w-5 mr-3" />
                Sync Latest Data
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-3" />
                Secure One-Click Setup
              </>
            )}
          </Button>
          <div className="text-sm text-maya-blue-500 mt-2 space-y-1">
            <p>🔐 Powered by Google OAuth - Industry Standard Security</p>
            <p>Automatically connects, finds your website, and imports data</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          <h3 className="font-semibold text-maya-blue-700 text-center">Setup Progress</h3>
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isStepComplete(step.id)
                    ? 'bg-green-50 border border-green-200'
                    : isStepActive(step.id)
                    ? 'bg-vivid-sky-blue-50 border border-vivid-sky-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isStepComplete(step.id)
                    ? 'bg-green-500 text-white'
                    : isStepActive(step.id)
                    ? 'bg-vivid-sky-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isStepComplete(step.id) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : isStepActive(step.id) && (isConnecting || loading.google_analytics) ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-maya-blue-800">{step.title}</div>
                  <div className="text-sm text-maya-blue-600">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success State */}
        {isStepComplete(3) && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">🎉 All Set! Your Data is Secure</h3>
            <p className="text-green-700 mb-4">
              Your Google Analytics is securely connected and your data is ready to explore.
            </p>
            <Button
              onClick={() => window.location.href = '/analytics'}
              className="bg-green-600 hover:bg-green-700"
            >
              View Your Analytics Dashboard
            </Button>
          </div>
        )}

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

        {/* What You'll Get Preview */}
        <div className="bg-periwinkle-50 border border-periwinkle-200 rounded-lg p-4">
          <h3 className="font-semibold text-periwinkle-800 mb-3">✨ What you'll see in your dashboard:</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-vivid-sky-blue-500 rounded-full"></div>
              <span>Website traffic trends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-vivid-sky-blue-500 rounded-full"></div>
              <span>Top performing pages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-vivid-sky-blue-500 rounded-full"></div>
              <span>Traffic sources breakdown</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-vivid-sky-blue-500 rounded-full"></div>
              <span>AI-powered insights</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionWizard;
