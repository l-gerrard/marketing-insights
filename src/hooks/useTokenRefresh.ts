
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useTokenRefresh = () => {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const refreshGoogleAnalyticsToken = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    
    console.log('=== ATTEMPTING AUTOMATIC TOKEN REFRESH ===');
    setRefreshing(true);
    
    try {
      // Get the current connection to check for refresh token
      const { data: connection } = await supabase
        .from('api_connections')
        .select('refresh_token')
        .eq('user_id', userId)
        .eq('provider', 'google_analytics')
        .single();

      if (!connection?.refresh_token) {
        console.log('No refresh token available');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('google-analytics-auth', {
        body: { 
          action: 'refresh_token',
          refresh_token: connection.refresh_token
        }
      });

      if (error || !data?.success) {
        console.error('Token refresh failed:', error || data);
        return false;
      }

      console.log('✅ Token refreshed successfully');
      toast({
        title: 'Connection Refreshed',
        description: 'Your Google Analytics connection has been automatically renewed.',
      });
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    } finally {
      setRefreshing(false);
    }
  };

  return {
    refreshGoogleAnalyticsToken,
    refreshing
  };
};
