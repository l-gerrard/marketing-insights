import React from 'react';
interface MarkdownParserProps {
  content: string;
  className?: string;
}
export const MarkdownParser: React.FC<MarkdownParserProps> = ({
  content,
  className = ''
}) => {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;
    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(listType === 'ul' ? <ul key={elements.length} className="list-disc list-inside space-y-2 my-4 ml-4">
              {currentList}
            </ul> : <ol key={elements.length} className="list-decimal list-inside space-y-2 my-4 ml-4">
              {currentList}
            </ol>);
        currentList = [];
        listType = null;
      }
    };
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Headers
      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={elements.length} className="text-lg font-semibold text-maya-blue-800 mt-6 mb-3 border-b border-maya-blue-200 pb-2">
            {trimmedLine.slice(4)}
          </h3>);
        return;
      }
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push();
        return;
      }
      if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={elements.length} className="text-2xl font-bold text-maya-blue-800 mt-6 mb-4 border-b-2 border-maya-blue-300 pb-3">
            {trimmedLine.slice(2)}
          </h1>);
        return;
      }

      // Performance metrics highlighting
      if (trimmedLine.includes('**') && (trimmedLine.includes('%') || trimmedLine.includes('views') || trimmedLine.includes('sessions'))) {
        flushList();
        elements.push(<div key={elements.length} className="bg-gradient-to-r from-vivid-sky-blue-50 to-maya-blue-50 border border-vivid-sky-blue-200 rounded-lg p-4 my-3">
            <p className="text-maya-blue-800 font-medium">
              {formatInlineText(trimmedLine)}
            </p>
          </div>);
        return;
      }

      // Bullet points
      if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push();
        return;
      }

      // Numbered lists
      const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)/);
      if (numberedMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(<li key={currentList.length} className="text-maya-blue-700 pl-2">
            {formatInlineText(numberedMatch[1])}
          </li>);
        return;
      }

      // Code blocks and statistics
      if (trimmedLine.startsWith('```')) {
        flushList();
        elements.push(<div key={elements.length} className="bg-gray-100 rounded-lg p-4 my-3 font-mono text-sm border border-gray-300">
            <code className="text-gray-800">{trimmedLine.slice(3)}</code>
          </div>);
        return;
      }

      // Key insights or recommendations (lines starting with specific keywords)
      if (trimmedLine.match(/^(Key|Important|Recommendation|Insight|Action):/i)) {
        flushList();
        elements.push(<div key={elements.length} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 my-3">
            <p className="text-yellow-800 font-medium">
              {formatInlineText(trimmedLine)}
            </p>
          </div>);
        return;
      }

      // Regular paragraphs
      if (trimmedLine) {
        flushList();
        elements.push(<p key={elements.length} className="text-maya-blue-700 leading-relaxed mb-3">
            {formatInlineText(trimmedLine)}
          </p>);
      }
    });
    flushList();
    return elements;
  };
  const formatInlineText = (text: string): React.ReactNode => {
    // Bold text with metrics highlighting
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-maya-blue-900">$1</strong>');

    // Italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Inline code and metrics
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border">$1</code>');

    // Highlight percentages and numbers
    formatted = formatted.replace(/(\d+(?:\.\d+)?%)/g, '<span class="font-semibold text-vivid-sky-blue-700 bg-vivid-sky-blue-100 px-1 py-0.5 rounded">$1</span>');
    formatted = formatted.replace(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*(?:views|sessions|users|clicks))/gi, '<span class="font-semibold text-maya-blue-700 bg-maya-blue-100 px-1 py-0.5 rounded">$1</span>');
    return <span dangerouslySetInnerHTML={{
      __html: formatted
    }} />;
  };
  return <div className={`markdown-content ${className}`}>
      {parseMarkdown(content)}
    </div>;
};