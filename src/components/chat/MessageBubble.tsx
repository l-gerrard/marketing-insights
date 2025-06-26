import { Bot, User, Database, Zap, TrendingUp } from 'lucide-react';
import { Message } from './types';
import InsightDocument from './InsightDocument';
import { MarkdownParser } from '@/utils/markdownParser';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  // If message has structured content, render the document format
  if (message.structuredContent && message.role === 'assistant') {
    return (
      <div className="flex gap-3 md:gap-4 justify-start px-2 md:px-0">
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-vivid-sky-blue-200 to-vivid-sky-blue-300 rounded-full flex items-center justify-center border border-vivid-sky-blue-300 shadow-sm">
          <Bot className="h-4 w-4 md:h-5 md:w-5 text-vivid-sky-blue-700" />
        </div>
        
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-maya-blue-200 shadow-sm relative">
          {message.hasAnalyticsData && (
            <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-gradient-to-r from-vivid-sky-blue-500 to-vivid-sky-blue-600 text-white rounded-full p-1 md:p-1.5 shadow-lg">
              <Database className="h-2.5 w-2.5 md:h-3 md:w-3" />
            </div>
          )}
          
          <InsightDocument insight={message.structuredContent} />
          
          <div className="flex items-center justify-between mt-3 md:mt-6 pt-2 md:pt-4 border-t border-maya-blue-200 text-xs text-maya-blue-500">
            <span>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {message.hasAnalyticsData && (
              <div className="flex items-center gap-1 text-vivid-sky-blue-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span className="hidden md:inline">Data-powered insights</span>
                <span className="md:hidden">AI insights</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ChatGPT-style layout for regular messages
  if (message.role === 'assistant') {
    return (
      <div className="flex gap-3 md:gap-4 justify-start px-2 md:px-0 py-4 md:py-6">
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-vivid-sky-blue-200 to-vivid-sky-blue-300 rounded-full flex items-center justify-center border border-vivid-sky-blue-300 shadow-sm">
          <Bot className="h-4 w-4 md:h-5 md:w-5 text-vivid-sky-blue-700" />
        </div>
        
        <div className="flex-1 min-w-0">
          {message.hasAnalyticsData && (
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-r from-vivid-sky-blue-500 to-vivid-sky-blue-600 text-white rounded-full p-1.5 shadow-sm">
                <Zap className="h-3 w-3" />
              </div>
              <span className="text-xs font-medium text-vivid-sky-blue-600">
                AI Marketing Bestie with Analytics Data
              </span>
            </div>
          )}
          
          <div className="prose prose-sm md:prose-base max-w-none">
            <MarkdownParser 
              content={message.content} 
              className="text-gray-800 leading-relaxed"
            />
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {message.hasAnalyticsData && (
              <div className="flex items-center gap-1 text-vivid-sky-blue-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span className="hidden md:inline">Data-powered response</span>
                <span className="md:hidden">Data-powered</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Keep user messages as bubbles (right-aligned)
  return (
    <div className="flex gap-2 md:gap-4 px-2 md:px-0 justify-end py-2">
      <div className="max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-xl md:rounded-2xl relative shadow-sm bg-gradient-to-br from-maya-blue-500 to-maya-blue-600 text-white">
        <p className="text-sm md:text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
        
        <div className="flex items-center justify-between mt-2 md:mt-3 text-xs text-maya-blue-100">
          <span>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-maya-blue-500 to-maya-blue-600 rounded-full flex items-center justify-center border border-maya-blue-400 shadow-sm">
        <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
      </div>
    </div>
  );
};

export default MessageBubble;
