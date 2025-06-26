import React, { createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGAProperty } from '@/hooks/useGAProperty';

interface AnalyticsContextType {
  propertyId: string | null;
  loading: boolean;
  error: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType>({ propertyId: null, loading: false, error: null });

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { propertyId, loading, error } = useGAProperty(user?.id);

  return (
    <AnalyticsContext.Provider value={{ propertyId, loading, error }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext); 