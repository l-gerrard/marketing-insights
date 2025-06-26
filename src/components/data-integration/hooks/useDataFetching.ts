
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { discoverAndConfigureProperties } from '../utils/connectionUtils';

export const useDataFetching = () => {
  const { toast } = useToast();

  const refreshProperties = async (provider: string, userId: string, configurations: any, setConfigurations: any, setConnectionStatus: any) => {
    try {
      const result = await discoverAndConfigureProperties(provider, userId);

      if (result.success) {
        toast({
          title: 'Auto-Configuration Complete',
          description: `Successfully configured with "${result.propertyName}". Ready to sync data!`,
        });
        
        // Update local state immediately
        setConfigurations((prev: any) => ({
          ...prev,
          [provider]: { property_id: result.propertyId }
        }));
        
        setConnectionStatus((prev: any) => ({
          ...prev,
          [provider]: 'Connected and configured'
        }));
      } else {
        if (result.totalProperties > 0) {
          toast({
            title: 'Properties Found',
            description: `Found ${result.totalProperties} properties. Please configure manually.`,
          });
        } else {
          toast({
            title: 'No Properties Found',
            description: `No ${provider} properties were discovered. Please check your account permissions.`,
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error(`Error refreshing ${provider} properties:`, error);
      toast({
        title: 'Discovery Failed',
        description: `Failed to discover ${provider} properties. Please check your permissions and try again.`,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const fetchAnalyticsData = async (provider: string, configurations: any) => {
    if (!configurations[provider]?.property_id) {
      toast({
        title: 'Configuration Required',
        description: `Please configure your ${provider} property ID first.`,
        variant: 'destructive'
      });
      return;
    }

    console.log(`=== FETCHING ${provider.toUpperCase()} DATA ===`);
    console.log('Property ID:', configurations[provider]?.property_id);
    
    const { data, error } = await supabase.functions.invoke('fetch-analytics-data', {
      body: { provider }
    });

    console.log('Fetch result:', { data, error });

    if (error) {
      console.error('Fetch error details:', error);
      
      // Enhanced error handling for common issues
      if (error.message?.includes('insufficient authentication scopes')) {
        toast({
          title: 'Permission Error',
          description: 'Your Google Analytics connection needs updated permissions. Please reconnect your account.',
          variant: 'destructive'
        });
        
        throw new Error('insufficient_permissions');
      } else if (error.message?.includes('Property ID not configured')) {
        toast({
          title: 'Configuration Error',
          description: 'Please configure your Google Analytics property ID first.',
          variant: 'destructive'
        });
        return;
      }
      
      throw error;
    }

    toast({
      title: 'Data Synced Successfully! 🎉',
      description: `Successfully synced ${data?.records_processed || 0} records from ${provider}. ${data?.token_refreshed ? 'Token was automatically refreshed.' : ''}`,
    });

    // Navigate to analytics dashboard after successful sync
    if (data?.records_processed > 0) {
      setTimeout(() => {
        window.location.href = '/analytics';
      }, 2000);
    } else {
      toast({
        title: 'No Data Found',
        description: 'No analytics data was found for the configured property. This might be normal for new websites.',
      });
    }
  };

  return {
    refreshProperties,
    fetchAnalyticsData
  };
};
