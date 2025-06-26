
import { FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickReportButtonProps {
  onGenerateReport: () => void;
  isLoading: boolean;
}

const QuickReportButton = ({ onGenerateReport, isLoading }: QuickReportButtonProps) => {
  return (
    <div className="bg-gradient-to-r from-vivid-sky-blue-50 to-maya-blue-50 border border-maya-blue-200 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gradient-to-r from-vivid-sky-blue-500 to-vivid-sky-blue-600 rounded-lg">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-maya-blue-800 text-sm md:text-base">
            Quick Performance Report
          </h3>
          <p className="text-xs md:text-sm text-maya-blue-600">
            Get instant insights about your business performance
          </p>
        </div>
      </div>
      
      <Button
        onClick={onGenerateReport}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-vivid-sky-blue-500 to-vivid-sky-blue-600 hover:from-vivid-sky-blue-600 hover:to-vivid-sky-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Generate My Report
      </Button>
      
      <p className="text-xs text-maya-blue-500 mt-2 text-center">
        Analyzes your latest data with actionable recommendations
      </p>
    </div>
  );
};

export default QuickReportButton;
