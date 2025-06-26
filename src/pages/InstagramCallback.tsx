
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const InstagramCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: 'Authentication Failed',
          description: 'Instagram authentication was cancelled or failed.',
          variant: 'destructive'
        });
        navigate('/data-integration');
        return;
      }

      if (code) {
        try {
          const { error } = await supabase.functions.invoke('instagram-auth', {
            body: { 
              code, 
              origin: window.location.origin.replace('/auth/instagram/callback', '')
            }
          });

          if (error) throw error;

          toast({
            title: 'Connected Successfully',
            description: 'Your Instagram account has been connected.',
          });
        } catch (error) {
          console.error('Error during Instagram callback:', error);
          toast({
            title: 'Connection Failed',
            description: 'Failed to complete Instagram connection.',
            variant: 'destructive'
          });
        }
      }

      navigate('/data-integration');
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-iced-coffee-600 mx-auto"></div>
        <p className="mt-4 text-iced-coffee-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default InstagramCallback;
