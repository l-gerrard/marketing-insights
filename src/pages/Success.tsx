
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const { checkSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check subscription status when landing on success page
    const timer = setTimeout(() => {
      checkSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkSubscription]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Welcome to Premium!
          </CardTitle>
          <CardDescription>
            Your subscription has been successfully activated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-700 font-medium text-sm">
              🎉 You now have full access to all premium features!
            </div>
            <div className="text-blue-600 text-xs mt-1">
              Your billing cycle has started and you can manage your subscription anytime.
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              size="lg"
            >
              Get Started
            </Button>
            
            <Button 
              onClick={() => navigate('/analytics')} 
              variant="outline" 
              className="w-full"
            >
              View Analytics Dashboard
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            You can manage your subscription anytime from your account settings.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
