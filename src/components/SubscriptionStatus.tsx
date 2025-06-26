
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Zap, RefreshCw, AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { useState } from 'react';

export const SubscriptionStatus = () => {
  const { 
    user, 
    subscriptionStatus, 
    subscriptionLoading, 
    subscriptionError, 
    createCheckout, 
    openCustomerPortal, 
    checkSubscription 
  } = useAuth();
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setManualRefreshing(true);
    try {
      await checkSubscription();
    } finally {
      setManualRefreshing(false);
    }
  };

  if (!user) return null;

  // EMERGENCY FIX: Show loading state with cached data if available
  if (subscriptionLoading && !subscriptionStatus) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vivid-sky-blue-500"></div>
            <span>Loading subscription...</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={manualRefreshing}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 ${manualRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state only if there's no subscription data at all
  if (subscriptionError && !subscriptionStatus) {
    return (
      <Card className="w-full max-w-md border-orange-200">
        <CardContent className="p-6 space-y-4">
          <Alert className="border-orange-200">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="text-orange-700">
              Unable to load subscription status. Please try refreshing.
            </AlertDescription>
          </Alert>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={manualRefreshing}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${manualRefreshing ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isTrialActive = subscriptionStatus?.is_trial_active;
  const isSubscribed = subscriptionStatus?.subscribed;
  const isLegacyPricing = subscriptionStatus?.legacy_pricing;
  const priceAmount = subscriptionStatus?.price_amount || 1299;

  // Format trial end date simply
  const getTrialEndDisplay = () => {
    if (!subscriptionStatus?.trial_end) return '';
    const trialEnd = new Date(subscriptionStatus.trial_end);
    const now = new Date();
    
    if (trialEnd <= now) return 'Trial expired';
    
    return `Trial expires ${trialEnd.toLocaleDateString()}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <>
              <Crown className="h-5 w-5 text-pink-lavender-500" />
              Premium Subscriber
            </>
          ) : isTrialActive ? (
            <>
              <Zap className="h-5 w-5 text-periwinkle-500" />
              Free Trial Active
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-gray-500" />
              Trial Expired
            </>
          )}
          {subscriptionError && subscriptionStatus && (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          )}
          {subscriptionStatus && !subscriptionError && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </CardTitle>
        <CardDescription>
          {isSubscribed 
            ? "You have full access to all premium features"
            : isTrialActive 
            ? "Enjoying your free trial with full access"
            : "Subscribe to continue using premium features"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionError && subscriptionStatus && (
          <Alert className="border-orange-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-700 text-xs">
              Status loaded from cache. {subscriptionError}
            </AlertDescription>
          </Alert>
        )}

        {isTrialActive && (
          <div className="p-3 bg-periwinkle-50 rounded-lg border border-periwinkle-200">
            <div className="flex items-center gap-2 text-periwinkle-700 font-medium">
              <Zap className="h-4 w-4" />
              Trial Status
            </div>
            <div className="text-periwinkle-600 text-sm mt-1">{getTrialEndDisplay()}</div>
          </div>
        )}

        {isLegacyPricing && (
          <Badge variant="secondary" className="bg-puce-100 text-puce-800 border-puce-300">
            🔒 Legacy Pricing Locked: £{(priceAmount / 100).toFixed(2)}/month forever
          </Badge>
        )}

        {subscriptionStatus?.subscription_end && (
          <div className="text-sm text-gray-600">
            Next billing: {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
          </div>
        )}

        <div className="space-y-2">
          {!isSubscribed && (
            <Button 
              onClick={createCheckout} 
              className="w-full bg-vivid-sky-blue-500 hover:bg-vivid-sky-blue-600"
              size="lg"
            >
              {isTrialActive 
                ? `Lock in £${isLegacyPricing ? '12.99' : '19.99'}/month - Subscribe Now`
                : "Start 7-Day Free Trial"
              }
            </Button>
          )}

          {isSubscribed && (
            <Button 
              onClick={openCustomerPortal} 
              variant="outline" 
              className="w-full"
            >
              Manage Subscription
            </Button>
          )}

          <Button 
            onClick={handleManualRefresh} 
            variant="ghost" 
            size="sm" 
            className="w-full"
            disabled={manualRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${manualRefreshing ? 'animate-spin' : ''}`} />
            {subscriptionError ? 'Retry Sync' : 'Refresh Status'}
          </Button>
        </div>

        {isTrialActive && (
          <div className="text-xs text-gray-500 text-center">
            Cancel anytime. No charges during trial period.
            {isLegacyPricing && " Lock in this special pricing forever!"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
