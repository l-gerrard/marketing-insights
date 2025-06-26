import { Button } from '@/components/ui/button';
import { Bug, Loader } from 'lucide-react';
interface DebugPanelProps {
  debugMode: boolean;
  setDebugMode: (mode: boolean) => void;
  onTestBasicGoogleAuth: () => void;
}
const DebugPanel = ({
  debugMode,
  setDebugMode,
  onTestBasicGoogleAuth
}: DebugPanelProps) => {
  return <>
      {/* Debug Panel */}
      {debugMode && <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Bug className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Debug Mode</span>
            <input type="checkbox" checked={debugMode} onChange={e => setDebugMode(e.target.checked)} className="ml-2" />
          </div>
          <div className="space-y-2 text-xs text-yellow-700">
            <p><strong>Current URL:</strong> {window.location.href}</p>
            <p><strong>Origin:</strong> {window.location.origin}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
          </div>
          <Button onClick={onTestBasicGoogleAuth} size="sm" variant="outline" className="mt-3 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100">
            Test Basic Google Auth (email/profile only)
          </Button>
        </div>}

      
    </>;
};
export default DebugPanel;