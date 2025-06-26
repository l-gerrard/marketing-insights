import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('=== GOOGLE OAUTH CALLBACK (SUPABASE NATIVE) ===');
      console.log('Current URL:', window.location.href);
      console.log('URL hash:', window.location.hash);
      console.log('URL search:', window.location.search);

      let authListener: any = null;
      let timeoutId: NodeJS.Timeout | null = null;
      let retryCount = 0;
      const maxRetries = 5;
      const retryDelay = 1000; // 1 second

      try {
        // Set up auth state listener to wait for session establishment
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change event:', event);
            console.log('Session data:', session ? 'Present' : 'Missing');
            
            if (event === 'SIGNED_IN' && session && session.provider_token) {
              console.log('User signed in, processing tokens...');
              console.log('Provider token:', session.provider_token ? 'Present' : 'Missing');
              console.log('Provider refresh token:', session.provider_refresh_token ? 'Present' : 'Missing');
              
              // Clear the timeout since we got our session
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              
              // Clean up the listener
              subscription.unsubscribe();
              
              await processGoogleAnalyticsConnection(session);
            }
          }
        );

        authListener = subscription;

        // Set a timeout fallback in case auth state doesn't change
        const tryGetSessionWithProviderTokens = async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Session error during timeout fallback:', error);
            throw error;
          }
          if (session && session.provider_token) {
            await processGoogleAnalyticsConnection(session);
          } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Provider tokens not present yet, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(tryGetSessionWithProviderTokens, retryDelay);
          } else {
            throw new Error('No session with provider tokens found after retries');
          }
        };

        timeoutId = setTimeout(tryGetSessionWithProviderTokens, 2000); // Start fallback after 2 seconds

      } catch (error) {
        console.error('Error during Google OAuth callback:', error);
        
        // Clean up
        if (authListener) {
          authListener.unsubscribe();
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        toast({
          title: 'Connection Failed',
          description: 'Failed to complete Google Analytics connection.',
          variant: 'destructive'
        });
        
        setIsProcessing(false);
        navigate('/data-integration');
      }
    };

    const processGoogleAnalyticsConnection = async (session: any) => {
      try {
        const providerToken = session.provider_token;
        const providerRefreshToken = session.provider_refresh_token;
        
        if (!providerToken) {
          throw new Error('No provider token received from Google');
        }

        console.log('Storing Google Analytics connection...');
        
        // Calculate proper expiration time (Google tokens typically expire in 1 hour)
        const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
        
        // Store the Google Analytics connection
        const { error: storeError } = await supabase
          .from('api_connections')
          .upsert({
            user_id: session.user.id,
            provider: 'google_analytics',
            access_token: providerToken,
            refresh_token: providerRefreshToken,
            expires_at: expiresAt
          });

        if (storeError) {
          console.error('Error storing connection:', storeError);
          throw storeError;
        }

        console.log('✅ Google Analytics connection stored successfully');

        // Automatically trigger property discovery ONLY if no property is set
        console.log('Checking for existing Google Analytics property...');
        const { data: existingConfig, error: configError } = await supabase
          .from('user_analytics_properties')
          .select('property_id')
          .eq('user_id', session.user.id)
          .eq('provider', 'google_analytics')
          .single();

        if (!existingConfig?.property_id) {
          // Only auto-discover if not set
          console.log('No property set, discovering Google Analytics properties...');
          try {
            const { data: discoverData, error: discoverError } = await supabase.functions.invoke('discover-analytics-properties', {
              body: { provider: 'google_analytics' }
            });

            if (discoverError) {
              console.error('Property discovery failed:', discoverError);
              if (discoverError.message?.includes('insufficient_permissions')) {
                toast({
                  title: '⚠️ Limited Access Detected',
                  description: 'Google Analytics connected, but Admin API access is needed for automatic property discovery. Please reconnect to grant full permissions.',
                  variant: 'destructive'
                });
              } else {
                toast({
                  title: '✅ Connected Successfully',
                  description: 'Google Analytics connected! Property discovery failed, but you can refresh properties on the data integration page.',
                });
              }
            } else {
              console.log('Properties discovered:', discoverData?.properties?.length || 0);
              toast({
                title: '🎉 Connected Successfully',
                description: `Google Analytics connected and ${discoverData?.properties?.length || 0} properties discovered automatically.`,
              });
            }
          } catch (discoveryError) {
            console.error('Property discovery error:', discoveryError);
            toast({
              title: '✅ Connected Successfully',
              description: 'Google Analytics connected! You can manually configure your property ID if needed.',
            });
          }
        } else {
          console.log('Existing property found, skipping auto-discovery.');
          toast({
            title: '🎉 Connected Successfully',
            description: 'Google Analytics connected! Your existing property configuration has been preserved.',
          });
        }

      } catch (error) {
        console.error('Error processing Google Analytics connection:', error);
        throw error;
      } finally {
        setIsProcessing(false);
        // Navigate back to data integration page
        console.log('Navigating back to data integration page');
        navigate('/data-integration');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-iced-coffee-600 mx-auto"></div>
        <p className="mt-4 text-iced-coffee-600">
          {isProcessing ? 'Completing Google Analytics connection...' : 'Processing...'}
        </p>
        <p className="mt-2 text-sm text-iced-coffee-500">
          {isProcessing ? 'Setting up your secure connection and discovering properties...' : 'Please wait...'}
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
