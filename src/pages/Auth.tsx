
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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
          description: "You've been securely logged in to your account.",
        });
        // Navigation will be handled by auth state change
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
          title: "🎉 Account created successfully!",
          description: "Welcome to AI Marketing Bestie! Your account is secure and ready to use.",
        });
        // Navigation will be handled by auth state change
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
    <div className="min-h-screen flex items-center justify-center bg-mint-background-50 p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/80 backdrop-blur-sm border-sage-blue-200 shadow-sage-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
              <Shield className="h-7 w-7 text-lime-green-500" />
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              {isLogin 
                ? 'Sign in to access your secure analytics dashboard' 
                : 'Join our secure platform today'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Trust Badge */}
            <div className="glassmorphism-lime rounded-xl p-4 border border-lime-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-lime-green-600" />
                <span className="text-sm font-semibold text-lime-green-800">🔒 Your Data is Protected</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm text-lime-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-lime-green-600" />
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-lime-green-600" />
                  <span>Secure authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-lime-green-600" />
                  <span>Privacy compliant</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="border-sage-blue-300 focus:border-lime-green-400 focus:ring-lime-green-400/20 bg-white/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="border-sage-blue-300 focus:border-lime-green-400 focus:ring-lime-green-400/20 bg-white/80"
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-sage-blue-300 focus:border-lime-green-400 focus:ring-lime-green-400/20 bg-white/80"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-sage-blue-300 focus:border-lime-green-400 focus:ring-lime-green-400/20 bg-white/80"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-lime-green-500 hover:bg-lime-green-600 text-gray-800 font-semibold py-3 shadow-lime-glow transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Lock className="h-5 w-5 mr-2 animate-pulse" />
                    Processing securely...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    {isLogin ? 'Secure Sign In' : 'Create Secure Account'}
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sage-blue-600 hover:text-sage-blue-800 text-sm font-medium transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Create one securely" 
                  : 'Already have an account? Sign in securely'
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
