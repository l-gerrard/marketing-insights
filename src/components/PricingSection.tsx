
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';

export const PricingSection = () => {
  const { user, subscriptionStatus, createCheckout } = useAuth();

  const isTrialActive = subscriptionStatus?.is_trial_active;
  const isSubscribed = subscriptionStatus?.subscribed;
  const isLegacyPricing = subscriptionStatus?.legacy_pricing;

  const features = [
    "Advanced Analytics Dashboard",
    "AI-Powered Insights",
    "Real-time Data Updates",
    "Custom Reports",
    "Priority Support",
    "Data Export Features",
    "Advanced Integrations",
  ];

  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-gray-600 mb-8">
          Start with a 7-day free trial, then choose the plan that works for you.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free Trial Card */}
          <Card className={`relative ${isTrialActive ? 'ring-2 ring-periwinkle-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-periwinkle-500" />
                  Free Trial
                </CardTitle>
                {isTrialActive && <Badge className="bg-periwinkle-500">Active</Badge>}
              </div>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">£0</div>
              <div className="text-sm text-gray-500">for 7 days</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {!user && (
                <Button className="w-full bg-vivid-sky-blue-500 hover:bg-vivid-sky-blue-600" onClick={() => window.location.href = '/auth'}>
                  Start Free Trial
                </Button>
              )}
              {user && isTrialActive && (
                <div className="text-sm text-green-600 font-medium text-center">
                  ✓ Trial Active - Full Access
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Card */}
          <Card className={`relative ${isSubscribed ? 'ring-2 ring-pink-lavender-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-pink-lavender-500" />
                  Premium Plan
                </CardTitle>
                {isSubscribed && <Badge className="bg-pink-lavender-500">Current</Badge>}
                <Badge className="bg-puce-500">
                  <Star className="h-3 w-3 mr-1" />
                  Limited Time
                </Badge>
              </div>
              <CardDescription>
                Lock in this special rate forever!
              </CardDescription>
              <div className="flex items-center gap-2">
                <div className="text-lg text-gray-500 line-through">£19.99</div>
                <div className="text-3xl font-bold text-puce-600">£12.99</div>
              </div>
              <div className="text-sm text-gray-500">per month</div>
              <div className="text-xs text-puce-600 font-medium">
                🔒 Early adopter special - rate locked forever!
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm font-medium text-pink-lavender-600">
                  <Star className="h-4 w-4" />
                  Priority Support
                </li>
              </ul>
              
              {!isSubscribed && user && (
                <Button 
                  className="w-full bg-vivid-sky-blue-500 hover:bg-vivid-sky-blue-600" 
                  onClick={createCheckout}
                  size="lg"
                >
                  {isTrialActive 
                    ? "Subscribe for £12.99/month"
                    : "Start Free Trial + Subscribe"
                  }
                </Button>
              )}
              
              {!user && (
                <Button 
                  className="w-full bg-vivid-sky-blue-500 hover:bg-vivid-sky-blue-600" 
                  onClick={() => window.location.href = '/auth'}
                  size="lg"
                >
                  Get Started
                </Button>
              )}

              {isSubscribed && (
                <div className="text-sm text-green-600 font-medium text-center">
                  ✓ Active Subscription
                </div>
              )}
              
              <div className="text-xs text-gray-500 text-center mt-3">
                Cancel anytime. No hidden fees.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-puce-50 border border-puce-200 rounded-lg max-w-md mx-auto">
          <div className="text-puce-800 font-medium text-sm">
            🎉 Early Adopter Special
          </div>
          <div className="text-puce-700 text-xs mt-1">
            Lock in our special £12.99/month rate that will never increase. 
            This offer won't last forever!
          </div>
        </div>
      </div>
    </div>
  );
};
