
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Sparkles, Shield, Lock, CheckCircle } from 'lucide-react';

interface SignupGateProps {
  onClose: () => void;
}

const SignupGate = ({ onClose }: SignupGateProps) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "🎉 Welcome back!",
          description: "You're now logged in and can chat with your AI bestie!",
        });
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "🎉 Welcome to your AI Marketing Bestie!",
          description: "Your account is ready! Start chatting with your AI bestie now.",
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 rounded-xl md:rounded-2xl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-vivid-sky-blue-100 to-maya-blue-100 rounded-lg">
              <Bot className="h-6 w-6 text-vivid-sky-blue-700" />
            </div>
            <Sparkles className="h-5 w-5 text-vivid-sky-blue-600 animate-pulse" />
          </div>
          <CardTitle className="text-xl font-bold text-maya-blue-900">
            {isLogin ? 'Welcome Back!' : 'Meet Your AI Marketing Bestie'}
          </CardTitle>
          <CardDescription className="text-maya-blue-600">
            {isLogin 
              ? 'Sign in to continue chatting with your AI bestie' 
              : 'Sign up to unlock AI-powered marketing insights and personalized recommendations'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Value Proposition */}
          {!isLogin && (
            <div className="bg-gradient-to-r from-vivid-sky-blue-50 to-maya-blue-50 border border-vivid-sky-blue-200 rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-vivid-sky-blue-600" />
                  <span className="text-maya-blue-700">Real-time analytics insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-vivid-sky-blue-600" />
                  <span className="text-maya-blue-700">Personalized growth recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-vivid-sky-blue-600" />
                  <span className="text-maya-blue-700">Daily & weekly business reports</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="border-maya-blue-200 focus:border-vivid-sky-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="border-maya-blue-200 focus:border-vivid-sky-blue-400"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-maya-blue-200 focus:border-vivid-sky-blue-400"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-maya-blue-200 focus:border-vivid-sky-blue-400"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-vivid-sky-blue-500 to-vivid-sky-blue-600 hover:from-vivid-sky-blue-600 hover:to-vivid-sky-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  {isLogin ? 'Sign In & Chat' : 'Start Chatting with AI Bestie'}
                </>
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-vivid-sky-blue-600 hover:text-vivid-sky-blue-800 text-sm"
            >
              {isLogin 
                ? "New here? Sign up to meet your AI bestie" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          {/* Security Badge */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center justify-center gap-2 text-xs text-green-700">
              <Shield className="h-3 w-3" />
              <span>Secure & Privacy Protected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupGate;
