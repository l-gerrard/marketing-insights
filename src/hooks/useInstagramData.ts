
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useInstagramData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const fetchInstagramData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting Instagram data fetch...');
      
      const { data, error } = await supabase.functions.invoke('fetch-instagram-data');
      
      if (error) {
        console.error('❌ Instagram data fetch error:', error);
        throw error;
      }
      
      console.log('✅ Instagram data fetch response:', data);
      
      setLastSyncTime(new Date().toISOString());
      toast.success('Instagram data synced successfully!');
      
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching Instagram data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync Instagram data';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getInstagramPosts = async (limit = 20) => {
    try {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select(`
          *,
          instagram_insights(*)
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching Instagram posts:', error);
      toast.error('Failed to load Instagram posts');
      return [];
    }
  };

  const getInstagramInsights = async (postId?: string) => {
    try {
      let query = supabase
        .from('instagram_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (postId) {
        query = query.eq('instagram_post_id', postId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching Instagram insights:', error);
      toast.error('Failed to load Instagram insights');
      return [];
    }
  };

  const getAudienceData = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_audience')
        .select('*')
        .order('recorded_date', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching audience data:', error);
      toast.error('Failed to load audience data');
      return [];
    }
  };

  const getAccountInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_account_insights')
        .select('*')
        .order('date_range_start', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching account insights:', error);
      toast.error('Failed to load account insights');
      return [];
    }
  };

  return {
    isLoading,
    lastSyncTime,
    fetchInstagramData,
    getInstagramPosts,
    getInstagramInsights,
    getAudienceData,
    getAccountInsights
  };
};
