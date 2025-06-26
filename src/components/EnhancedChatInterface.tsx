
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from './chat/types';
import ChartVisualization from './chat/ChartVisualization';
import MessageBubble from './chat/MessageBubble';
import LoadingIndicator from './chat/LoadingIndicator';
import FloatingChartElements from './chat/FloatingChartElements';
import ChatInput from './chat/ChatInput';
import SuggestedQuestions from './chat/SuggestedQuestions';
import DailyWeeklyReports from './chat/DailyWeeklyReports';
import SignupGate from './chat/SignupGate';

const EnhancedChatInterface = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `# Hey! I'm your AI Marketing Bestie! 

I'm here to help you understand your data and grow your business with insights that actually matter.

## What I Can Help With:
• **Performance Analysis**: What's working and what needs attention
• **Growth Opportunities**: Your biggest chances to grow right now  
• **Weekly Trends**: How you're trending and what it means
• **Actionable Advice**: Specific steps you can take today

**Ready to dive in? Choose a report type below or ask me anything!**`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Only scroll to bottom when new messages are added by user interaction
  useEffect(() => {
    // Only scroll if there are more than 1 message (user has started interacting)
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const requireAuth = () => {
    if (!user) {
      setShowSignupGate(true);
      return false;
    }
    return true;
  };

  const handleSendMessage = async (messageContent?: string) => {
    if (!requireAuth()) return;

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
    if (!requireAuth()) return;
    handleSendMessage(question);
  };

  const generateDailyReport = async () => {
    if (!requireAuth()) return;

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
        description: 'Your yesterday\'s insights are here!'
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
    if (!requireAuth()) return;

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
        description: 'Your comprehensive business insights are here!'
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

  return (
    <div className="relative">
      <FloatingChartElements />

      <div className="flex flex-col h-[500px] md:h-[600px] border border-maya-blue-200 rounded-xl md:rounded-2xl bg-gradient-to-br from-maya-blue-50 to-vivid-sky-blue-50 backdrop-blur-sm shadow-xl">
        <div className="p-3 md:p-6 border-b border-maya-blue-200 bg-white/60 backdrop-blur-sm rounded-t-xl md:rounded-t-2xl">
          <h3 className="text-lg md:text-xl font-semibold text-maya-blue-800 flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-gradient-to-br from-vivid-sky-blue-100 to-maya-blue-100 rounded-lg">
              <Bot className="h-4 w-4 md:h-6 md:w-6 text-vivid-sky-blue-700" />
            </div>
            <span>Ask your marketing bestie</span>
            <Sparkles className="h-4 w-4 text-vivid-sky-blue-600 ml-auto animate-pulse" />
          </h3>
          <p className="text-xs md:text-sm text-maya-blue-600 mt-1 md:mt-2">
            {user ? 
              'Get AI-powered insights from your analytics data with business-focused recommendations' :
              'Sign up to unlock personalized AI-powered marketing insights'
            }
          </p>
        </div>

        <ScrollArea className="flex-1 p-2 md:p-6" ref={scrollAreaRef}>
          <div className="space-y-1">
            {user && <ChartVisualization onGetInsights={generateWeeklyReport} isLoading={isLoading} />}
            
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Show daily/weekly reports and suggested questions after welcome message and before any user messages */}
            {showSuggestedQuestions && messages.length === 1 && (
              <div className="py-4">
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
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-vivid-sky-blue-200 to-vivid-sky-blue-300 rounded-full flex items-center justify-center border border-vivid-sky-blue-300 shadow-sm">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-vivid-sky-blue-700" />
                </div>
                <LoadingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSendMessage={() => handleSendMessage()}
          onKeyPress={handleKeyPress}
        />

        {/* Signup Gate Overlay */}
        {showSignupGate && <SignupGate onClose={() => setShowSignupGate(false)} />}
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
