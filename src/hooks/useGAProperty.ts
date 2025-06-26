import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGAProperty = (userId: string | undefined) => {
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('api_connections')
        .select('configuration')
        .eq('user_id', userId)
        .eq('provider', 'google_analytics')
        .single();
      if (error) {
        setError(error.message);
        setPropertyId(null);
      } else {
        let configObj: any = data?.configuration;
        if (typeof configObj === 'string') {
          try {
            configObj = JSON.parse(configObj);
          } catch (e) {
            configObj = null;
          }
        }
        if (configObj?.property_id) {
          setPropertyId(configObj.property_id);
        } else {
          setPropertyId(null);
        }
      }
      setLoading(false);
    };
    fetchProperty();
  }, [userId]);

  return { propertyId, loading, error };
}; 