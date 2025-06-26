import React, { createContext, useContext, useState } from 'react';

// Define the context type
type LastSyncContextType = {
  lastSync: number;
  updateLastSync: () => void;
};

// Create the context
const LastSyncContext = createContext<LastSyncContextType | undefined>(undefined);

// Provider component
export const LastSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastSync, setLastSync] = useState(Date.now());

  const updateLastSync = () => setLastSync(Date.now());

  return (
    <LastSyncContext.Provider value={{ lastSync, updateLastSync }}>
      {children}
    </LastSyncContext.Provider>
  );
};

// Hook to use the context
export const useLastSync = () => {
  const context = useContext(LastSyncContext);
  if (!context) {
    throw new Error('useLastSync must be used within a LastSyncProvider');
  }
  return context;
}; 