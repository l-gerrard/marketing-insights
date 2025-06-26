
import { MessageSquare, TrendingUp, Target, BarChart3, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
  isLoading: boolean;
}

const SuggestedQuestions = ({ onQuestionClick, isLoading }: SuggestedQuestionsProps) => {
  const quickInsights = [
    "What's my biggest opportunity for growth right now?",
    "Which pages should I optimize first?",
    "How is my traffic trending this week vs last week?",
    "What's working well that I should double down on?",
    "Which traffic sources bring my best visitors?"
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-maya-blue-800 mb-2 flex items-center justify-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Quick Questions
        </h3>
        <p className="text-sm text-maya-blue-600">
          Ask me anything about your performance or click a question below
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {quickInsights.map((question, questionIndex) => (
          <Button
            key={questionIndex}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => onQuestionClick(question)}
            className="w-full text-left justify-start h-auto p-3 text-sm text-maya-blue-700 hover:text-maya-blue-900 hover:bg-maya-blue-50 border border-maya-blue-200 hover:border-maya-blue-300 rounded-lg transition-all duration-200"
          >
            <Search className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="text-left leading-relaxed">{question}</span>
          </Button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-maya-blue-500">
          💡 Get instant insights about your business performance
        </p>
      </div>
    </div>
  );
};

export default SuggestedQuestions;
