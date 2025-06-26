import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useGoogleAnalytics = () => {
  const { toast } = useToast();

  const connectGoogleAnalytics = async (userId: string) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect your Google Analytics account.',
        variant: 'destructive'
      });
      return;
    }

    console.log('=== STARTING GOOGLE ANALYTICS CONNECTION ===');
    console.log('Current URL:', window.location.href);
    console.log('Origin:', window.location.origin);
    console.log('User ID:', userId);
    
    // Show pre-authorization guidance
    toast({
      title: '🔐 Initiating Secure Connection',
      description: 'You\'ll be redirected to Google\'s secure authentication. This may take a moment to complete.',
    });
    
    const redirectTo = 'http://localhost:8080/auth/google/callback';
    console.log('Redirect URL:', redirectTo);
    
    // Updated scopes with proper Google Analytics Data API access
    const scopes = [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics.edit',
      'https://www.googleapis.com/auth/analytics.manage.users.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid'
    ].join(' ');
    
    console.log('Using expanded scopes for property discovery:', scopes);
    
    const oauthOptions = {
      provider: 'google' as const,
      options: {
        scopes,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent', // Force consent to ensure we get refresh token and updated permissions
        },
        redirectTo
      }
    };
    
    console.log('OAuth options:', oauthOptions);
    
    const { data, error } = await supabase.auth.signInWithOAuth(oauthOptions);

    console.log('OAuth response:', { data, error });

    if (error) {
      console.error('OAuth initiation error:', error);
      toast({
        title: '🚫 Connection Failed',
        description: `Unable to initiate secure connection to Google: ${error.message}`,
        variant: 'destructive'
      });
      throw error;
    }

    console.log('OAuth redirect initiated successfully');
  };

  const reconnectGoogleAnalytics = async (userId: string) => {
    console.log('=== RECONNECTING GOOGLE ANALYTICS ===');
    
    // Show trust message for reconnection
    toast({
      title: '🔄 Refreshing Secure Connection',
      description: 'Clearing existing connection and requesting updated permissions from Google.',
    });
    
    // Clear the existing connection to force a fresh OAuth flow
    console.log('Clearing existing connection to start fresh...');
    await supabase
      .from('api_connections')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google_analytics');
    
    // Also clear any stored properties for this user
    await supabase
      .from('user_analytics_properties')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google_analytics');
    
    toast({
      title: '🔄 Starting Fresh Connection',
      description: 'Previous connection cleared. Starting secure authentication with updated permissions.',
    });
    
    // Start fresh OAuth flow with consent prompt to get updated permissions
    await connectGoogleAnalytics(userId);
  };

  const testBasicGoogleAuth = async () => {
    console.log('=== TESTING BASIC GOOGLE AUTH ===');
    
    toast({
      title: '🧪 Testing Basic Authentication',
      description: 'Running a basic test of Google OAuth connection...',
    });
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'email profile',
          redirectTo: 'http://localhost:8080/auth/google/callback'
        }
      });
      
      console.log('Basic auth test result:', { data, error });
      
      if (error) {
        toast({
          title: '❌ Basic Auth Test Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: '✅ Basic Auth Test Successful',
          description: 'Basic Google OAuth connection is working properly',
        });
      }
    } catch (error) {
      console.error('Basic auth test error:', error);
      toast({
        title: '❌ Basic Auth Test Failed',
        description: error?.message || 'Unknown error occurred during testing',
        variant: 'destructive'
      });
    }
  };

  return {
    connectGoogleAnalytics,
    reconnectGoogleAnalytics,
    testBasicGoogleAuth
  };
};
