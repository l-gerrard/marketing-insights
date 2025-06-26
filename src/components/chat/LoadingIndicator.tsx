
import { Bot } from 'lucide-react';

const LoadingIndicator = () => (
  <div className="flex gap-4 justify-start">
    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-vivid-sky-blue-200 to-vivid-sky-blue-300 rounded-full flex items-center justify-center border border-vivid-sky-blue-300">
      <Bot className="h-5 w-5 text-vivid-sky-blue-700" />
    </div>
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-maya-blue-200">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-vivid-sky-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-vivid-sky-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-vivid-sky-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export default LoadingIndicator;
