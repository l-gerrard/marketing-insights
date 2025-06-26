
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Mic, Plus } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput = ({ input, isLoading, onInputChange, onSendMessage, onKeyPress }: ChatInputProps) => (
  <div className="p-3 md:p-6">
    <div className="flex gap-2 md:gap-3 items-end">
      {/* Quick Actions Button (Mobile) */}
      <Button
        variant="outline"
        size="sm"
        className="md:hidden flex-shrink-0 w-10 h-10 p-0 border-maya-blue-300 hover:bg-maya-blue-50 rounded-xl"
      >
        <Plus className="h-4 w-4 text-maya-blue-600" />
      </Button>

      {/* Input Container */}
      <div className="flex-1 relative">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Ask about your performance, trends..."
          disabled={isLoading}
          className="w-full bg-white border-maya-blue-300 focus:border-vivid-sky-blue-400 rounded-xl text-sm md:text-base py-2.5 md:py-3 px-3 md:px-4 pr-10 md:pr-12 resize-none min-h-[40px] md:min-h-[48px]"
          style={{ minHeight: '40px' }}
        />
        
        {/* Voice Input Button (Hidden on small screens) */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 hidden md:flex text-maya-blue-500 hover:text-vivid-sky-blue-600"
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>

      {/* Send Button */}
      <Button
        onClick={onSendMessage}
        disabled={!input.trim() || isLoading}
        className="flex-shrink-0 bg-gradient-to-r from-vivid-sky-blue-500 to-vivid-sky-blue-600 hover:from-vivid-sky-blue-600 hover:to-vivid-sky-blue-700 text-white rounded-xl w-10 h-10 md:w-12 md:h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Send className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
    </div>
    
    <div className="flex items-center justify-center mt-2 md:mt-4 text-xs text-maya-blue-500">
      <Sparkles className="h-3 w-3 mr-1" />
      <span className="text-center">Press Enter to send • AI analyzes your data with trends</span>
    </div>
  </div>
);

export default ChatInput;
