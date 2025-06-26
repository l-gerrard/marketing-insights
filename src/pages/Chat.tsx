
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, ArrowLeft, Menu, Shield, Lock, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/components/chat/types';
import MessageBubble from '@/components/chat/MessageBubble';
import LoadingIndicator from '@/components/chat/LoadingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import SuggestedQuestions from '@/components/chat/SuggestedQuestions';
import DailyWeeklyReports from '@/components/chat/DailyWeeklyReports';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: `# Hey there! I'm your AI Marketing Bestie! 🎉

I'm here to help you understand your data and grow your business! Here's what I can help you with:

## What You Can Ask Me:
• **Performance Analysis**: Get insights about what's working and what needs attention
• **Growth Opportunities**: Find your biggest opportunities to grow right now
• **Weekly Trends**: Understand how your business is trending week over week
• **Strategic Recommendations**: Get specific actions you can take today

## My Superpowers:
- **Real Data Analysis**: I analyze your actual Google Analytics data
- **Business-Focused Insights**: I explain what your numbers mean for your business
- **Actionable Advice**: I give you specific steps to take, not just statistics
- **Daily & Weekly Context**: I focus on recent performance and strategic trends

**Ready to dive in? Choose a report type below or ask me anything!**`,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authentication form states
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

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
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendMessage = async (messageContent?: string) => {
    const messageToSend = messageContent || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestedQuestions(false);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-gpt', {
        body: {
          message: messageToSend,
          conversationHistory
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        hasAnalyticsData: data.hasAnalyticsData
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const generateDailyReport = async () => {
    setIsLoading(true);
    setShowSuggestedQuestions(false);
    
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-gpt', {
        body: {
          message: 'Hey! Can you generate my Yesterday\'s Pulse report? I want a quick daily check-in focusing on yesterday\'s performance compared to the day before. Give me the key metrics that matter most, any immediate opportunities I should jump on today, and quick wins I can implement right now. Keep it conversational and actionable - I want to know what happened yesterday and what I should do about it today!',
          conversationHistory,
          reportType: 'daily'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const reportMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        hasAnalyticsData: data.hasAnalyticsData
      };

      setMessages(prev => [...prev, reportMessage]);

      toast({
        title: 'Daily Pulse Ready! 📊',
        description: 'Your yesterday\'s insights are here - check what happened and what to do next!'
      });

    } catch (error) {
      console.error('Error generating daily report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate daily report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyReport = async () => {
    setIsLoading(true);
    setShowSuggestedQuestions(false);
    
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-gpt', {
        body: {
          message: 'Hey! Can you generate my Weekly Deep Dive report? I want a comprehensive analysis of this week vs last week, including traffic patterns, user behavior trends, content performance, channel analysis, and strategic opportunities. Focus on patterns, momentum, and what the data tells me about where my business is heading. Give me specific recommendations for next week\'s strategy and longer-term opportunities to pursue. Make it strategic but still conversational!',
          conversationHistory,
          reportType: 'weekly'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const reportMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        hasAnalyticsData: data.hasAnalyticsData
      };

      setMessages(prev => [...prev, reportMessage]);

      toast({
        title: 'Weekly Analysis Ready! 📈',
        description: 'Your comprehensive business insights and strategic recommendations are here!'
      });

    } catch (error) {
      console.error('Error generating weekly report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate weekly report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show signup page for non-signed-in users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vivid-sky-blue-50 to-maya-blue-50 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-maya-blue-200 p-3 md:p-4 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center gap-2 md:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-maya-blue-600 hover:text-maya-blue-800 p-2 md:px-3">
                <ArrowLeft className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-vivid-sky-blue-100 to-maya-blue-100 rounded-lg">
                <Bot className="h-4 w-4 md:h-6 md:w-6 text-vivid-sky-blue-700" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-semibold text-maya-blue-800">AI Marketing Bestie</h1>
                <p className="text-xs md:text-sm text-maya-blue-600 hidden md:block">
                  Sign up to unlock personalized insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Signup Content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
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
                  disabled={authLoading}
                >
                  {authLoading ? (
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
      </div>
    );
  }

  // Authenticated user experience
  return (
    <div className="min-h-screen bg-gradient-to-br from-vivid-sky-blue-50 to-maya-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-maya-blue-200 p-3 md:p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-maya-blue-600 hover:text-maya-blue-800 p-2 md:px-3">
                <ArrowLeft className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-vivid-sky-blue-100 to-maya-blue-100 rounded-lg">
                <Bot className="h-4 w-4 md:h-6 md:w-6 text-vivid-sky-blue-700" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-semibold text-maya-blue-800">AI Marketing Bestie</h1>
                <p className="text-xs md:text-sm text-maya-blue-600 hidden md:block">
                  Your business growth companion
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="md:hidden p-2 text-maya-blue-600">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex justify-center px-4 md:px-6 py-4 md:py-6">
        <div className="w-full max-w-5xl flex flex-col h-[calc(100vh-8rem)]">
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto px-2 md:px-4">
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {showSuggestedQuestions && messages.length === 1 && (
                <div className="py-6">
                  <DailyWeeklyReports 
                    onGenerateDailyReport={generateDailyReport}
                    onGenerateWeeklyReport={generateWeeklyReport}
                    isLoading={isLoading}
                  />
                  <SuggestedQuestions 
                    onQuestionClick={handleQuestionClick}
                    isLoading={isLoading}
                  />
                </div>
              )}
              
              {isLoading && (
                <div className="flex gap-3 md:gap-4 justify-start px-2 md:px-0 py-4">
                  <LoadingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-maya-blue-200 shadow-lg mt-4">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                input={input}
                isLoading={isLoading}
                onInputChange={setInput}
                onSendMessage={() => handleSendMessage()}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
