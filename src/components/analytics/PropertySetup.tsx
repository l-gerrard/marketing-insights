
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, CheckCircle, Loader, AlertTriangle, ExternalLink } from 'lucide-react';

interface PropertySetupProps {
  onConfigurationSaved: () => void;
}

const PropertySetup = ({ onConfigurationSaved }: PropertySetupProps) => {
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const validatePropertyId = (id: string) => {
    const cleanId = id.replace(/^properties\//, '').trim();
    return /^\d{9,12}$/.test(cleanId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!propertyId.trim()) {
      toast({
        title: 'Property ID Required',
        description: 'Please enter your GA4 Property ID.',
        variant: 'destructive'
      });
      return;
    }

    if (!validatePropertyId(propertyId)) {
      toast({
        title: 'Invalid Property ID Format',
        description: 'GA4 Property ID should be 9-12 digits (e.g., 123456789)',
        variant: 'destructive'
      });
      return;
    }

    const cleanPropertyId = propertyId.replace(/^properties\//, '').trim();

    setLoading(true);
    try {
      // Update API connection configuration
      const { error: connectionError } = await supabase
        .from('api_connections')
        .update({
          configuration: { property_id: cleanPropertyId }
        })
        .eq('user_id', user.id)
        .eq('provider', 'google_analytics');

      if (connectionError) throw connectionError;

      // Clear and insert the property record
      await supabase
        .from('user_analytics_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'google_analytics');

      await supabase
        .from('user_analytics_properties')
        .insert({
          user_id: user.id,
          provider: 'google_analytics',
          property_id: cleanPropertyId,
          property_name: 'Manual Entry',
          account_id: '',
          account_name: '',
          is_selected: true
        });

      toast({
        title: 'Property Configured! 🎉',
        description: 'Your Google Analytics property has been configured successfully.',
      });

      onConfigurationSaved();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Configuration Failed',
        description: 'Failed to save property configuration. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-iced-coffee-200 bg-gradient-to-br from-white to-iced-coffee-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-iced-coffee-800 text-xl">
          <Settings className="h-5 w-5" />
          Configure Your Google Analytics Property
        </CardTitle>
        <CardDescription>
          Enter your GA4 Property ID to start viewing your analytics data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📍 How to find your GA4 Property ID:</h4>
              <ol className="text-blue-700 space-y-2 list-decimal list-inside text-sm">
                <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Google Analytics <ExternalLink className="h-3 w-3" /></a></li>
                <li>Click the <strong>Admin</strong> gear icon in the bottom left</li>
                <li>In the <strong>Property</strong> column, click <strong>"Property Settings"</strong></li>
                <li>Your Property ID is at the top (9-12 digits, like <code className="bg-blue-100 px-1 rounded">123456789</code>)</li>
              </ol>
              <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                <strong>Note:</strong> Only enter the numbers (e.g., 123456789), not "properties/123456789"
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property-id" className="text-base font-medium">
              GA4 Property ID
            </Label>
            <Input
              id="property-id"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="Enter your GA4 Property ID (e.g., 123456789)"
              className="border-iced-coffee-300 text-base py-3"
              required
            />
            
            {propertyId && !validatePropertyId(propertyId) && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Invalid format. GA4 Property ID should be 9-12 digits only.
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !propertyId.trim() || !validatePropertyId(propertyId)}
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
                Save Property Configuration
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertySetup;
