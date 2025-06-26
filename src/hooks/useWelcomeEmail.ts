
import { supabase } from '@/integrations/supabase/client';

export const useWelcomeEmail = () => {
  const sendWelcomeEmail = async (userId: string, email: string, firstName?: string, lastName?: string) => {
    try {
      console.log('Sending welcome email for user:', userId, email);
      
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          userId,
          email,
          firstName,
          lastName,
        },
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        throw error;
      }

      console.log('Welcome email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  };

  return { sendWelcomeEmail };
};
