
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { checkUserConnections } from '../utils/connectionUtils';
import { useGoogleAnalytics } from './useGoogleAnalytics';
import { useInstagram } from './useInstagram';
import { useDataFetching } from './useDataFetching';
import { UseDataIntegrationReturn } from '../types';

export const useDataIntegration = (): UseDataIntegrationReturn => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [connections, setConnections] = useState<{ [key: string]: boolean }>({});
  const [configurations, setConfigurations] = useState<{ [key: string]: any }>({});
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshGoogleAnalyticsToken, refreshing } = useTokenRefresh();

  const { connectGoogleAnalytics, reconnectGoogleAnalytics, testBasicGoogleAuth } = useGoogleAnalytics();
  const { connectInstagram } = useInstagram();
  const { refreshProperties: refreshPropertiesUtil, fetchAnalyticsData: fetchAnalyticsDataUtil } = useDataFetching();

  const checkConnections = async () => {
    if (!user) return;

    try {
      const result = await checkUserConnections(user.id, true); // Enable auto-refresh
      if (result) {
        setConnections(result.connectionStatus);
        setConfigurations(result.configData);
        setConnectionStatus(result.statusMessages);

        console.log('Connection status updated:', result.connectionStatus);
        console.log('Configuration data updated:', result.configData);
        console.log('Status messages:', result.statusMessages);
      }
    } catch (error) {
      console.error('Error checking connections:', error);
    }
  };

  const handleGoogleAnalyticsConnect = async () => {
    setLoading(prev => ({ ...prev, google_analytics: true }));

    try {
      await connectGoogleAnalytics(user?.id || '');
    } catch (error) {
      console.error('=== GOOGLE OAUTH FAILED ===');
      console.error('Error details:', error);
      
      let errorMessage = 'Failed to initiate Google authentication.';
      
      if (error?.message?.includes('refused to connect')) {
        errorMessage = 'Google refused to connect. Please check your OAuth configuration in Google Cloud Console.';
      } else if (error?.message?.includes('redirect_uri_mismatch')) {
        errorMessage = 'Redirect URI mismatch. Please check your Google Cloud Console redirect URLs.';
      } else if (error?.message?.includes('unauthorized_client')) {
        errorMessage = 'Unauthorized client. Please check your Google Cloud Console configuration.';
      } else if (error?.message?.includes('insufficient_scope')) {
        errorMessage = 'Insufficient permissions. Please reconnect to grant proper analytics access.';
      }
      
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, google_analytics: false }));
    }
  };

  const handleGoogleAnalyticsReconnect = async () => {
    if (user) {
      await reconnectGoogleAnalytics(user.id);
    }
  };

  const refreshProperties = async (provider: string) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, [`${provider}_refresh`]: true }));
    
    try {
      await refreshPropertiesUtil(provider, user.id, configurations, setConfigurations, setConnectionStatus);
      await checkConnections();
    } catch (error) {
      // Error handling is done in the utility function
    } finally {
      setLoading(prev => ({ ...prev, [`${provider}_refresh`]: false }));
    }
  };

  const handleInstagramConnect = async () => {
    setLoading(prev => ({ ...prev, instagram: true }));

    try {
      await connectInstagram(user?.id || '');
      await checkConnections();
    } catch (error) {
      console.error('=== INSTAGRAM CONNECTION FAILED ===');
      console.error('Error details:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to Instagram. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

  const fetchAnalyticsData = async (provider: string) => {
    if (!configurations[provider]?.property_id) {
      // Try to discover properties first
      toast({
        title: 'Auto-discovering properties...',
        description: `Looking for your ${provider} properties...`,
      });
      
      await refreshProperties(provider);
      
      // Wait a moment for the state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again if we now have a property_id
      if (!configurations[provider]?.property_id) {
        return;
      }
    }

    setLoading(prev => ({ ...prev, [provider]: true }));

    try {
      await fetchAnalyticsDataUtil(provider, configurations);
    } catch (error) {
      if (error.message === 'insufficient_permissions') {
        // Update connection status to show the issue
        setConnectionStatus(prev => ({
          ...prev,
          [provider]: 'Token expired - insufficient permissions'
        }));
        return;
      }

      // Check if it's a token expiration error and attempt refresh
      if (error.message?.includes('expired') || error.message?.includes('authentication')) {
        console.log('Token expired during data fetch, attempting refresh...');
        
        if (user && provider === 'google_analytics') {
          const refreshSuccess = await refreshGoogleAnalyticsToken(user.id);
          
          if (refreshSuccess) {
            // Retry the data fetch after successful refresh
            try {
              await fetchAnalyticsDataUtil(provider, configurations);
              toast({
                title: 'Success',
                description: 'Data synced successfully after refreshing connection.',
              });
            } catch (retryError) {
              console.error(`Retry failed after token refresh:`, retryError);
              toast({
                title: 'Sync Failed',
                description: `Failed to sync ${provider} data even after token refresh. Please reconnect your account.`,
                variant: 'destructive'
              });
            }
          } else {
            setConnectionStatus(prev => ({
              ...prev,
              [provider]: 'Token expired - automatic refresh failed, please reconnect'
            }));
          }
        }
        return;
      }

      console.error(`Error fetching ${provider} data:`, error);
      toast({
        title: 'Sync Failed',
        description: `Failed to sync ${provider} data: ${error.message || 'Unknown error'}. Please try reconnecting your account.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleConfigurationSaved = () => {
    checkConnections();
  };

  useEffect(() => {
    if (user) {
      checkConnections();
    }
  }, [user]);

  return {
    loading: { ...loading, google_analytics: loading.google_analytics || refreshing },
    connections,
    configurations,
    connectionStatus,
    checkConnections,
    handleGoogleAnalyticsConnect,
    handleGoogleAnalyticsReconnect,
    refreshProperties,
    handleInstagramConnect,
    fetchAnalyticsData,
    testBasicGoogleAuth,
    handleConfigurationSaved
  };
};
