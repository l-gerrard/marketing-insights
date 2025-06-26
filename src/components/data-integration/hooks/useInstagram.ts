
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { openOAuthPopup } from '@/utils/oauthPopup';

export const useInstagram = () => {
  const { toast } = useToast();

  const connectInstagram = async (userId: string) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect your Instagram account.',
        variant: 'destructive'
      });
      return;
    }

    console.log('=== STARTING INSTAGRAM CONNECTION ===');
    console.log('User ID:', userId);
    console.log('Current origin:', window.location.origin);
    
    const { data, error } = await supabase.functions.invoke('instagram-auth', {
      body: { action: 'get_auth_url', origin: window.location.origin }
    });

    console.log('Instagram auth URL response:', { data, error });

    if (error) {
      console.error('Error getting Instagram auth URL:', error);
      throw new Error(error.message || 'Failed to get authentication URL');
    }

    if (!data.auth_url) {
      console.error('No Instagram auth URL received');
      throw new Error('No authentication URL received from server');
    }

    console.log('Opening Instagram OAuth popup with URL:', data.auth_url);
    
    const result = await openOAuthPopup(data.auth_url, 'instagram');
    
    console.log('Instagram OAuth popup result:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Authentication failed');
    }

    console.log('Instagram OAuth successful, processing...');

    const { error: exchangeError } = await supabase.functions.invoke('instagram-auth', {
      body: { 
        code: result.code, 
        origin: window.location.origin 
      }
    });

    console.log('Instagram token exchange result:', { exchangeError });

    if (exchangeError) {
      console.error('Error processing Instagram auth:', exchangeError);
      throw new Error(exchangeError.message || 'Failed to complete authentication');
    }

    toast({
      title: 'Connected Successfully',
      description: 'Your Instagram account has been connected.',
    });

    console.log('=== INSTAGRAM CONNECTION COMPLETED ===');
  };

  return {
    connectInstagram
  };
};
