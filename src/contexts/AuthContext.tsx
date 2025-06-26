
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useWelcomeEmail } from '@/hooks/useWelcomeEmail';

interface SubscriptionStatus {
  subscribed: boolean;
  is_trial_active: boolean;
  trial_end: string | null;
  subscription_tier: string | null;
  subscription_end: string | null;
  legacy_pricing: boolean;
  price_amount: number;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const { toast } = useToast();
  const { sendWelcomeEmail } = useWelcomeEmail();

  // Get cached subscription data from database first
  const getCachedSubscriptionData = async () => {
    if (!user?.id) return null;
    
    try {
      const { data } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        return {
          subscribed: data.subscribed,
          is_trial_active: data.is_trial_active,
          trial_end: data.trial_end,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end,
          legacy_pricing: data.legacy_pricing || true,
          price_amount: data.price_amount || 1299,
          currency: data.currency || 'gbp'
        };
      }
    } catch (error) {
      console.error('Error fetching cached subscription:', error);
    }
    return null;
  };

  const checkSubscription = async () => {
    console.log('checkSubscription called', { 
      sessionReady, 
      hasSession: !!session, 
      hasAccessToken: !!session?.access_token,
      subscriptionLoading
    });

    // Prevent multiple simultaneous calls
    if (subscriptionLoading) {
      console.log('checkSubscription: already loading, skipping');
      return;
    }

    // Early return if no session
    if (!sessionReady || !session?.access_token) {
      console.log('checkSubscription: no session ready or access token');
      setSubscriptionLoading(false);
      setSubscriptionError(null);
      return;
    }

    setSubscriptionLoading(true);
    setSubscriptionError(null);
    
    // Show cached data immediately
    const cachedData = await getCachedSubscriptionData();
    if (cachedData && !subscriptionStatus) {
      console.log('Using cached subscription data:', cachedData);
      setSubscriptionStatus(cachedData);
    }

    // Extended timeout to 30 seconds
    const timeoutId = setTimeout(() => {
      console.log('checkSubscription: timeout reached, using cached data');
      setSubscriptionLoading(false);
      if (cachedData) {
        setSubscriptionStatus(cachedData);
        setSubscriptionError('Using cached data - sync in progress');
      } else {
        setSubscriptionError('Unable to load subscription status');
      }
    }, 30000);

    try {
      console.log('checkSubscription: calling edge function');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('checkSubscription: edge function error', error);
        throw error;
      }

      // Handle fallback response for errors
      if (data.error && data.fallback) {
        console.log('checkSubscription: using fallback data', data.fallback);
        setSubscriptionStatus({
          ...data.fallback,
          currency: data.fallback.currency || 'gbp'
        });
        setSubscriptionError('Status may be outdated');
        return;
      }

      console.log('checkSubscription: success', data);
      setSubscriptionStatus({
        ...data,
        currency: data.currency || 'gbp'
      });
      setSubscriptionError(null);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error checking subscription:', error);
      
      // Use cached data as fallback
      if (cachedData) {
        setSubscriptionStatus(cachedData);
        setSubscriptionError('Using cached data - please refresh later');
      } else {
        setSubscriptionError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      console.log('checkSubscription: setting loading to false');
      setSubscriptionLoading(false);
    }
  };

  const checkAndSendWelcomeEmail = async (userId: string, userEmail: string, userMetadata: any) => {
    try {
      // Check if welcome email has already been sent
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('welcome_email_sent')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        return;
      }

      // If welcome email hasn't been sent, send it now
      if (!profile?.welcome_email_sent) {
        console.log('Sending welcome email for new user:', userId);
        
        const firstName = userMetadata?.first_name || '';
        const lastName = userMetadata?.last_name || '';
        
        await sendWelcomeEmail(userId, userEmail, firstName, lastName);
        
        // Mark welcome email as sent
        await supabase
          .from('profiles')
          .update({ welcome_email_sent: true })
          .eq('id', userId);
        
        toast({
          title: "Welcome to AI Marketing Bestie! 🎉",
          description: "Check your email for your welcome message and getting started guide.",
        });
      }
    } catch (error) {
      console.error('Error in welcome email flow:', error);
      // Don't show error to user as it's not critical to their experience
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset error state on new session
        setSubscriptionError(null);
        
        // Mark session as ready after a small delay to ensure it's fully loaded
        setTimeout(() => {
          setSessionReady(true);
          console.log('Session marked as ready');
        }, 100);
        
        // Handle different auth events
        if (session?.user) {
          // Check and send welcome email for any authenticated user
          await checkAndSendWelcomeEmail(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata
          );
        } else {
          // Clear subscription status when user logs out
          setSubscriptionStatus(null);
          setSessionReady(false);
          setSubscriptionError(null);
          console.log('User signed out, clearing all state');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        setTimeout(() => {
          setSessionReady(true);
          console.log('Initial session marked as ready');
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription when session becomes ready
  useEffect(() => {
    if (sessionReady && session?.user) {
      console.log('Session ready, checking subscription');
      checkSubscription();
    }
  }, [sessionReady, session?.user]);

  // Reduced auto-refresh frequency to 15 minutes to reduce load
  useEffect(() => {
    if (!sessionReady || !user) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('Auto-refresh: checking subscription');
        checkSubscription();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [sessionReady, user]);

  const createCheckout = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error creating checkout",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error opening customer portal",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    console.log('Starting sign out process');
    try {
      // Clear all local state first
      setSubscriptionStatus(null);
      setSubscriptionError(null);
      setSubscriptionLoading(false);
      
      // Sign out from Supabase - let auth state change handle navigation
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      console.log('Sign out successful');
      
      // Show success message
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out error",
        description: error.message || "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    subscriptionStatus,
    subscriptionLoading,
    subscriptionError,
    signOut,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
