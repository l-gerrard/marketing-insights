
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, ExternalLink, MessageCircle, BookOpen } from 'lucide-react';

const HelpGuide = () => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <HelpCircle className="h-5 w-5" />
          Need Help?
        </CardTitle>
        <CardDescription className="text-blue-700">
          Having trouble connecting? Here are some quick resources to get you unstuck.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto p-4 border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => window.open('https://support.google.com/analytics/answer/9304153', '_blank')}
          >
            <BookOpen className="h-5 w-5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium">Google Analytics Setup Guide</div>
              <div className="text-sm opacity-80">Official Google documentation</div>
            </div>
            <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto p-4 border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => window.open('https://docs.lovable.dev/integrations/analytics', '_blank')}
          >
            <MessageCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium">Common Issues & Solutions</div>
              <div className="text-sm opacity-80">Troubleshooting guide</div>
            </div>
            <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
        </div>

        <div className="bg-white border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-2">Quick Troubleshooting:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Make sure you're the admin of your Google Analytics account</li>
            <li>• Check that your website has Google Analytics tracking installed</li>
            <li>• Ensure you're using GA4 (not Universal Analytics)</li>
            <li>• Try disconnecting and reconnecting if you see permission errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpGuide;
