
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Settings, Loader, AlertTriangle, ExternalLink } from 'lucide-react';

interface PropertyConfigurationProps {
  provider: 'google_analytics' | 'instagram';
  isConnected: boolean;
  onConfigurationSaved: () => void;
}

interface Configuration {
  property_id?: string;
}

const PropertyConfiguration = ({ provider, isConnected, onConfigurationSaved }: PropertyConfigurationProps) => {
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [currentConfig, setCurrentConfig] = useState<Configuration | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const validatePropertyId = (id: string, provider: string) => {
    if (provider === 'google_analytics') {
      // GA4 property IDs are typically 9-12 digit numbers
      const cleanId = id.replace(/^properties\//, '').trim();
      return /^\d{9,12}$/.test(cleanId);
    }
    if (provider === 'instagram') {
      // Instagram business account IDs are typically 15-17 digit numbers
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
    if (!user) return;

    if (!propertyId.trim()) {
      toast({
        title: 'Property ID Required',
        description: 'Please enter a property ID.',
        variant: 'destructive'
      });
      return;
    }

    // Validate property ID format
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

    // Clean the property ID (remove properties/ prefix if present for GA4)
    const cleanPropertyId = provider === 'google_analytics' 
      ? propertyId.replace(/^properties\//, '').trim()
      : propertyId.trim();

    setLoading(true);
    try {
      // Update API connection configuration
      const { error: connectionError } = await supabase
        .from('api_connections')
        .update({
          configuration: { property_id: cleanPropertyId }
        })
        .eq('user_id', user.id)
        .eq('provider', provider);

      if (connectionError) throw connectionError;

      // Clear and insert the property record
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
        description: `${provider === 'google_analytics' ? 'Google Analytics' : 'Instagram'} property has been configured successfully. You can now sync your data!`,
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadCurrentConfiguration();
    }
  }, [isConnected, provider]);

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="border-iced-coffee-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-iced-coffee-800">
          <Settings className="h-5 w-5" />
          Configure {provider === 'google_analytics' ? 'Google Analytics' : 'Instagram'} Property
          {currentConfig?.property_id && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
        <CardDescription>
          {provider === 'google_analytics' ? (
            'Enter your GA4 Property ID to connect your website analytics'
          ) : (
            'Enter your Instagram Business Account ID to connect your Instagram analytics'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentConfig?.property_id && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">✅ Currently Configured</span>
            </div>
            <p className="text-sm text-green-700">
              Property ID: <code className="bg-green-100 px-2 py-1 rounded font-mono">{currentConfig.property_id}</code>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Your {provider === 'google_analytics' ? 'Google Analytics' : 'Instagram'} is ready to sync data!
            </p>
          </div>
        )}

        {provider === 'google_analytics' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">📍 How to find your GA4 Property ID:</h4>
                <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Google Analytics <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Click the <strong>Admin</strong> gear icon in the bottom left</li>
                  <li>In the <strong>Property</strong> column, click <strong>"Property Settings"</strong></li>
                  <li>Your Property ID is at the top (9-12 digits, like <code className="bg-blue-100 px-1 rounded">123456789</code>)</li>
                  <li>Make sure you have <strong>"Viewer"</strong> permissions or higher for this property</li>
                </ol>
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                  <strong>Note:</strong> Only enter the numbers (e.g., 123456789), not "properties/123456789"
                </div>
              </div>
            </div>
          </div>
        )}

        {provider === 'instagram' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-purple-800 mb-2">📍 How to find your Instagram Business Account ID:</h4>
                <ol className="text-sm text-purple-700 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Meta Business Suite <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Select your Instagram Business Account</li>
                  <li>Go to Settings → Account Settings</li>
                  <li>Find your Business Account ID (15-17 digits)</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="property-id" className="text-base font-medium">
            {provider === 'google_analytics' ? 'GA4 Property ID' : 'Instagram Business Account ID'}
          </Label>
          <div className="space-y-3">
            <Input
              id="property-id"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder={
                provider === 'google_analytics' 
                  ? "Enter your GA4 Property ID (e.g., 123456789)" 
                  : "Enter your Instagram Business Account ID"
              }
              className="border-iced-coffee-300 text-base py-3"
            />
            
            {propertyId && !validatePropertyId(propertyId, provider) && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Invalid format. {provider === 'google_analytics' 
                  ? 'GA4 Property ID should be 9-12 digits only.' 
                  : 'Instagram Business Account ID should be 15-17 digits.'}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={saveConfiguration}
          disabled={loading || !propertyId.trim() || !validatePropertyId(propertyId, provider)}
          size="lg"
          className="w-full bg-iced-matcha-500 hover:bg-iced-matcha-600 text-white py-3 text-base"
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin mr-2" />
              Saving Configuration...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Save & Configure {provider === 'google_analytics' ? 'Google Analytics' : 'Instagram'}
            </>
          )}
        </Button>

        {currentConfig?.property_id && (
          <div className="text-center">
            <p className="text-sm text-iced-coffee-600 mb-2">
              Configuration saved! You can now sync your data from the main page.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyConfiguration;
