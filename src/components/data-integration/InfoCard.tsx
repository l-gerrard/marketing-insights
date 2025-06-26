
import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';

const InfoCard = () => {
  return (
    <Card className="border-iced-matcha-200 bg-iced-matcha-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-iced-matcha-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-iced-matcha-800 mb-2">Secure & Private</h4>
            <p className="text-sm text-iced-matcha-700">
              Your data is securely stored and only used to provide you with personalized insights. 
              You can disconnect any service at any time from your account settings.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
