
export interface ConnectionConfiguration {
  property_id?: string;
  [key: string]: any;
}

export interface ConnectionState {
  loading: { [key: string]: boolean };
  connections: { [key: string]: boolean };
  configurations: { [key: string]: any };
  connectionStatus: { [key: string]: string };
}

export interface UseDataIntegrationReturn extends ConnectionState {
  checkConnections: () => Promise<void>;
  handleGoogleAnalyticsConnect: () => Promise<void>;
  handleGoogleAnalyticsReconnect: () => Promise<void>;
  refreshProperties: (provider: string) => Promise<void>;
  handleInstagramConnect: () => Promise<void>;
  fetchAnalyticsData: (provider: string) => Promise<void>;
  testBasicGoogleAuth: () => Promise<void>;
  handleConfigurationSaved: () => void;
}
