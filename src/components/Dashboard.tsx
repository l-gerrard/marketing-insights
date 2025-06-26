import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Bot, BarChart3, Database, Crown, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, subscriptionStatus } = useAuth();
  const navigate = useNavigate();

  // Handler for deleting the user's account
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    // TODO: Replace with a secure RPC or Edge Function call to delete user and all related data
    // Example: await supabase.rpc('delete_user_and_data');
    // For now, just sign out
    // Show a loading state or toast if desired
    try {
      // Placeholder: sign out only
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      alert('Failed to delete account: ' + (error.message || error));
    }
  };

  return (
    <div className="min-h-screen bg-mint-background-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.user_metadata?.first_name || 'there'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Your AI Marketing Analytics dashboard is ready
          </p>
        </div>

        {/* Subscription Status */}
        {subscriptionStatus && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-sage-blue-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <Crown className="h-5 w-5 text-lime-green-500 mr-2" />
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscriptionStatus.subscribed 
                    ? 'bg-lime-green-100 text-lime-green-800' 
                    : subscriptionStatus.is_trial_active
                    ? 'bg-sage-blue-100 text-sage-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {subscriptionStatus.subscribed 
                    ? 'Premium Active' 
                    : subscriptionStatus.is_trial_active 
                    ? 'Trial Active'
                    : 'Free Plan'
                  }
                </div>
                {subscriptionStatus.trial_end && subscriptionStatus.is_trial_active && (
                  <span className="text-sm text-gray-600">
                    Trial ends: {new Date(subscriptionStatus.trial_end).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-sage-blue-200 hover:shadow-sage-glow transition-all duration-200 cursor-pointer" onClick={() => navigate('/chat')}>
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 p-3 bg-lime-green-100 rounded-full w-fit">
                <Bot className="h-6 w-6 text-lime-green-600" />
              </div>
              <CardTitle className="text-xl">AI Chat Assistant</CardTitle>
              <CardDescription>
                Get instant insights about your marketing data
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="bg-lime-green-500 hover:bg-lime-green-600 text-gray-800 w-full">
                Start Chatting
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-sage-blue-200 hover:shadow-sage-glow transition-all duration-200 cursor-pointer" onClick={() => navigate('/analytics')}>
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 p-3 bg-sage-blue-100 rounded-full w-fit">
                <BarChart3 className="h-6 w-6 text-sage-blue-600" />
              </div>
              <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
              <CardDescription>
                View detailed charts and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="border-sage-blue-300 text-sage-blue-700 hover:bg-sage-blue-50 w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-sage-blue-200 hover:shadow-sage-glow transition-all duration-200 cursor-pointer" onClick={() => navigate('/data-integration')}>
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 p-3 bg-mint-background-200 rounded-full w-fit">
                <Database className="h-6 w-6 text-mint-background-600" />
              </div>
              <CardTitle className="text-xl">Data Integration</CardTitle>
              <CardDescription>
                Connect Google Analytics and Instagram
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="border-mint-background-300 text-mint-background-700 hover:bg-mint-background-50 w-full">
                Manage Integrations
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity or Getting Started */}
        <Card className="bg-white/80 backdrop-blur-sm border-sage-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-lime-green-500" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Complete these steps to get the most out of AI Marketing Bestie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-mint-background-50">
                <div className="h-2 w-2 bg-lime-green-500 rounded-full"></div>
                <span className="text-sm">Connect your Google Analytics account</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/data-integration')}>
                  Connect
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-mint-background-50">
                <div className="h-2 w-2 bg-sage-blue-500 rounded-full"></div>
                <span className="text-sm">Set up Instagram Business insights</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/data-integration')}>
                  Setup
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-mint-background-50">
                <div className="h-2 w-2 bg-mint-background-500 rounded-full"></div>
                <span className="text-sm">Ask your first question to the AI assistant</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/chat')}>
                  Ask AI
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Delete Account Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium shadow"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
