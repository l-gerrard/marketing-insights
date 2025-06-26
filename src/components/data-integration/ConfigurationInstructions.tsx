
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const ConfigurationInstructions = () => {
  return (
    <Card className="border-maya-blue-200 bg-maya-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-maya-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-maya-blue-800 mb-2">Google OAuth Configuration Required</h4>
            <div className="text-sm text-maya-blue-700 space-y-2">
              <p><strong>If you see "refused to connect" errors:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to Google Cloud Console → API Credentials</li>
                <li>Edit your OAuth Client ID</li>
                <li>Add <code className="bg-maya-blue-100 px-1 rounded">{window.location.origin}</code> to "Authorized JavaScript origins"</li>
                <li>Add <code className="bg-maya-blue-100 px-1 rounded">{window.location.origin}/auth/google/callback</code> to "Authorized redirect URIs"</li>
                <li>Enable Google Analytics Reporting API and Google Analytics Admin API</li>
                <li>Save and wait 5-10 minutes for changes to propagate</li>
              </ol>
              <p className="mt-3"><strong>In Supabase:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Enable Google OAuth provider</li>
                <li>Add your Google Client ID and Secret</li>
                <li>Set Site URL to: <code className="bg-maya-blue-100 px-1 rounded">{window.location.origin}</code></li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationInstructions;
