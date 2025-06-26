
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Settings, Loader, AlertTriangle, ExternalLink, ArrowRight, Play } from 'lucide-react';

interface EnhancedPropertyConfigurationProps {
  provider: 'google_analytics' | 'instagram';
  isConnected: boolean;
  onConfigurationSaved: () => void;
  onSyncData: () => void;
  loading: { [key: string]: boolean };
}

interface Configuration {
  property_id?: string;
}

const EnhancedPropertyConfiguration = ({ 
  provider, 
  isConnected, 
  onConfigurationSaved, 
  onSyncData,
  loading 
}: EnhancedPropertyConfigurationProps) => {
  const [configLoading, setConfigLoading] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [currentConfig, setCurrentConfig] = useState<Configuration | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Add debug logging
  console.log('EnhancedPropertyConfiguration render:', {
    isConnected,
    propertyId,
    currentConfig,
    configLoading
  });

  const validatePropertyId = (id: string, provider: string) => {
    if (provider === 'google_analytics') {
      const cleanId = id.replace(/^properties\//, '').trim();
      return /^\d{9,12}$/.test(cleanId);
    }
    if (provider === 'instagram') {
      return /^\d{15,17}$/.test(id.trim());
    }
    return true;
  };

  const loadCurrentConfiguration = async () => {
    if (!user || !isConnected) return;

    try {
      const { data, error } = await supabase
        .from('api_connections')
        .select('configuration')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single();

      if (error) {
        console.error('Error loading configuration:', error);
        return;
      }

      if (data?.configuration && typeof data.configuration === 'object' && data.configuration !== null) {
        const config = data.configuration as Configuration;
        if (config.property_id) {
          setCurrentConfig(config);
          setPropertyId(config.property_id);
        }
      }
    } catch (error) {
      console.error('Error loading current configuration:', error);
    }
  };

  const saveConfiguration = async () => {
    console.log('Save configuration called with propertyId:', propertyId);
    
    if (!user) {
      console.log('No user found');
      return;
    }

    if (!propertyId.trim()) {
      toast({
        title: 'Property ID Required',
        description: 'Please enter a property ID.',
        variant: 'destructive'
      });
      return;
    }

    if (!validatePropertyId(propertyId, provider)) {
      toast({
        title: 'Invalid Property ID Format',
        description: provider === 'google_analytics' 
          ? 'GA4 Property ID should be 9-12 digits (e.g., 123456789)'
          : 'Instagram Business Account ID should be 15-17 digits',
        variant: 'destructive'
      });
      return;
    }

    const cleanPropertyId = provider === 'google_analytics' 
      ? propertyId.replace(/^properties\//, '').trim()
      : propertyId.trim();

    setConfigLoading(true);
    try {
      const { error: connectionError } = await supabase
        .from('api_connections')
        .update({
          configuration: { property_id: cleanPropertyId }
        })
        .eq('user_id', user.id)
        .eq('provider', provider);

      if (connectionError) throw connectionError;

      await supabase
        .from('user_analytics_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', provider);

      await supabase
        .from('user_analytics_properties')
        .insert({
          user_id: user.id,
          provider,
          property_id: cleanPropertyId,
          property_name: 'Manual Entry',
          account_id: '',
          account_name: '',
          is_selected: true
        });

      toast({
        title: 'Configuration Saved! 🎉',
        description: `${provider === 'google_analytics' ? 'Google Analytics' : 'Instagram'} property configured successfully!`,
      });

      setCurrentConfig({ property_id: cleanPropertyId });
      onConfigurationSaved();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save configuration. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadCurrentConfiguration();
    }
  }, [isConnected, provider]);

  if (!isConnected) {
    return (
      <Card className="border-2 border-gray-200 bg-gray-50 opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Settings className="h-5 w-5" />
            Step 2: Configure Your Website Property
          </CardTitle>
          <CardDescription>
            Complete Step 1 first to configure your {provider === 'google_analytics' ? 'Google Analytics' : 'Instagram'} property
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-iced-coffee-200 bg-gradient-to-br from-white to-iced-coffee-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-iced-coffee-800 text-2xl">
          <Settings className="h-6 w-6" />
          Step 2: Configure Your Website Property
          {currentConfig?.property_id && (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
        </CardTitle>
        <CardDescription className="text-lg">
          {currentConfig?.property_id ? 
            'Your property is configured! You can now sync your data or update the property ID below.' :
            'Enter your GA4 Property ID to connect your website analytics data'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentConfig?.property_id && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium text-lg">✅ Property Configured</span>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Property ID: <code className="bg-green-100 px-2 py-1 rounded font-mono text-lg">{currentConfig.property_id}</code>
            </p>
            <Button
              onClick={onSyncData}
              disabled={loading.google_analytics}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading.google_analytics ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Syncing Data...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Sync My Analytics Data
                </>
              )}
            </Button>
          </div>
        )}

        {provider === 'google_analytics' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-3 text-lg">📍 How to find your GA4 Property ID:</h4>
                <ol className="text-blue-700 space-y-3 list-decimal list-inside">
                  <li className="font-medium">Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Google Analytics <ExternalLink className="h-4 w-4" /></a></li>
                  <li>Click the <strong>Admin</strong> gear icon in the bottom left</li>
                  <li>In the <strong>Property</strong> column, click <strong>"Property Settings"</strong></li>
                  <li>Your Property ID is at the top (9-12 digits, like <code className="bg-blue-100 px-2 py-1 rounded">123456789</code>)</li>
                  <li>Make sure you have <strong>"Viewer"</strong> permissions or higher for this property</li>
                </ol>
                <div className="mt-4 p-3 bg-blue-100 rounded text-blue-800">
                  <strong>Important:</strong> Only enter the numbers (e.g., 123456789), not "properties/123456789"
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label htmlFor="property-id" className="text-lg font-semibold">
            {provider === 'google_analytics' ? 'GA4 Property ID' : 'Instagram Business Account ID'}
          </Label>
          <div className="space-y-4">
            <Input
              id="property-id"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder={
                provider === 'google_analytics' 
                  ? "Enter your GA4 Property ID (e.g., 123456789)" 
                  : "Enter your Instagram Business Account ID"
              }
              className="border-iced-coffee-300 text-lg py-4 px-4"
            />
            
            {propertyId && !validatePropertyId(propertyId, provider) && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Invalid format. {provider === 'google_analytics' 
                  ? 'GA4 Property ID should be 9-12 digits only.' 
                  : 'Instagram Business Account ID should be 15-17 digits.'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Always show the submit button when connected - make it blue and prominent */}
        <div className="mt-6">
          <Button
            onClick={saveConfiguration}
            disabled={configLoading || !propertyId.trim() || !validatePropertyId(propertyId, provider)}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold shadow-lg"
          >
            {configLoading ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Saving Configuration...
              </>
            ) : (
              <>
                <ArrowRight className="h-5 w-5 mr-2" />
                Save & Configure {provider === 'google_analytics' ? 'Google Analytics' : 'Instagram'}
              </>
            )}
          </Button>
        </div>

        {currentConfig?.property_id && (
          <div className="text-center p-4 bg-periwinkle-50 border border-periwinkle-200 rounded-lg">
            <h3 className="font-semibold text-periwinkle-800 mb-2">🎉 Ready to Go!</h3>
            <p className="text-sm text-periwinkle-700 mb-3">
              Your analytics are configured and ready to sync. Click "Sync My Analytics Data" above to import your latest data.
            </p>
            <Button
              onClick={() => window.location.href = '/analytics'}
              variant="outline"
              className="border-periwinkle-300 text-periwinkle-700 hover:bg-periwinkle-50"
            >
              View Analytics Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPropertyConfiguration;
