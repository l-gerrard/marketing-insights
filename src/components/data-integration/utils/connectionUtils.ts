
import { supabase } from '@/integrations/supabase/client';
import { ConnectionConfiguration } from '../types';

export const checkUserConnections = async (userId: string, autoRefresh = true) => {
  console.log('Checking existing connections for user:', userId);
  const { data: apiConnections, error } = await supabase
    .from('api_connections')
    .select('provider, configuration, access_token, expires_at, refresh_token')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching connections:', error);
    return null;
  }

  console.log('Found connections:', apiConnections);

  const connectionStatus: { [key: string]: boolean } = {};
  const configData: { [key: string]: any } = {};
  const statusMessages: { [key: string]: string } = {};

  for (const conn of apiConnections || []) {
    const isExpired = conn.expires_at && new Date(conn.expires_at) < new Date();
    const hasToken = !!conn.access_token;
    const hasRefreshToken = !!conn.refresh_token;
    
    const config = (conn.configuration as ConnectionConfiguration) || {};
    
    // Attempt automatic token refresh if expired and refresh token exists
    if (isExpired && hasRefreshToken && autoRefresh && conn.provider === 'google_analytics') {
      console.log(`Token expired for ${conn.provider}, attempting automatic refresh...`);
      
      try {
        const { data, error } = await supabase.functions.invoke('google-analytics-auth', {
          body: { 
            action: 'refresh_token',
            refresh_token: conn.refresh_token
          }
        });

        if (data?.success) {
          console.log(`✅ Token refreshed successfully for ${conn.provider}`);
          // Update the connection data for this iteration
          connectionStatus[conn.provider] = true;
          configData[conn.provider] = config;
          statusMessages[conn.provider] = config.property_id ? 'Connected and configured' : 'Connected - discovering properties...';
          continue;
        } else {
          console.log(`❌ Token refresh failed for ${conn.provider}:`, error || data);
        }
      } catch (refreshError) {
        console.error(`Token refresh error for ${conn.provider}:`, refreshError);
      }
    }
    
    connectionStatus[conn.provider] = hasToken && !isExpired;
    configData[conn.provider] = config;
    
    if (!hasToken) {
      statusMessages[conn.provider] = 'No access token';
    } else if (isExpired) {
      statusMessages[conn.provider] = hasRefreshToken 
        ? 'Token expired - automatic refresh failed, please reconnect'
        : 'Token expired - please reconnect';
    } else if (!config.property_id) {
      statusMessages[conn.provider] = 'Connected - discovering properties...';
    } else {
      statusMessages[conn.provider] = 'Connected and configured';
    }
  }

  return {
    connectionStatus,
    configData,
    statusMessages
  };
};

export const discoverAndConfigureProperties = async (provider: string, userId: string) => {
  const { data, error } = await supabase.functions.invoke('discover-analytics-properties', {
    body: { provider }
  });

  if (error) throw error;

  // Automatically configure with the first property if available
  if (data?.properties?.length > 0) {
    const firstProperty = data.properties[0];
    
    const { error: configError } = await supabase
      .from('api_connections')
      .update({ 
        configuration: { property_id: firstProperty.id }
      })
      .eq('user_id', userId)
      .eq('provider', provider);

    if (!configError) {
      return {
        success: true,
        propertyName: firstProperty.name,
        propertyId: firstProperty.id,
        totalProperties: data.properties.length
      };
    }
  }

  return {
    success: false,
    totalProperties: data?.properties?.length || 0
  };
};
