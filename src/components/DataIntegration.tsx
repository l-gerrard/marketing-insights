
import { useState } from 'react';
import SimpleConnectionCard from './data-integration/SimpleConnectionCard';
import EnhancedPropertyConfiguration from './data-integration/EnhancedPropertyConfiguration';
import DebugPanel from './data-integration/DebugPanel';
import HelpGuide from './data-integration/HelpGuide';
import InfoCard from './data-integration/InfoCard';
import { useDataIntegration } from './data-integration/hooks/useDataIntegration';

const DataIntegration = () => {
  const [debugMode, setDebugMode] = useState(false);
  
  const {
    loading,
    connections,
    configurations,
    connectionStatus,
    handleGoogleAnalyticsConnect,
    handleGoogleAnalyticsReconnect,
    refreshProperties,
    handleInstagramConnect,
    fetchAnalyticsData,
    testBasicGoogleAuth,
    handleConfigurationSaved
  } = useDataIntegration();

  const handleGoogleConnect = async () => {
    const needsReconnection = connectionStatus.google_analytics?.includes('expired') || 
                             connectionStatus.google_analytics?.includes('insufficient');
    
    if (needsReconnection) {
      await handleGoogleAnalyticsReconnect();
    } else {
      await handleGoogleAnalyticsConnect();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-maya-blue-900 mb-4">
          Connect Your Google Analytics
        </h2>
        <p className="text-xl text-maya-blue-600 max-w-2xl mx-auto mb-6">
          Connect your Google Analytics and get AI-powered insights to grow your business
        </p>
        <div className="bg-vivid-sky-blue-50 border border-vivid-sky-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <h3 className="font-semibold text-vivid-sky-blue-800 mb-2">Simple 2-Step Process:</h3>
          <div className="flex items-center justify-center gap-4 text-sm text-vivid-sky-blue-700">
            <span className="flex items-center gap-1">
              <span className="bg-vivid-sky-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
              Connect Google Account
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <span className="bg-vivid-sky-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
              Enter Property ID
            </span>
          </div>
        </div>
        
        <DebugPanel
          debugMode={debugMode}
          setDebugMode={setDebugMode}
          onTestBasicGoogleAuth={testBasicGoogleAuth}
        />
      </div>

      {/* Step 1: Google Analytics Connection */}
      <SimpleConnectionCard
        onConnect={handleGoogleConnect}
        loading={loading}
        isConnected={connections.google_analytics}
        connectionStatus={connectionStatus.google_analytics}
      />

      {/* Step 2: Property Configuration */}
      <EnhancedPropertyConfiguration
        provider="google_analytics"
        isConnected={connections.google_analytics}
        onConfigurationSaved={handleConfigurationSaved}
        onSyncData={() => fetchAnalyticsData('google_analytics')}
        loading={loading}
      />

      {/* Help and Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <HelpGuide />
        <InfoCard />
      </div>
    </div>
  );
};

export default DataIntegration;
