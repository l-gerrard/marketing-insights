
import { Calendar, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyWeeklyReportsProps {
  onGenerateDailyReport: () => void;
  onGenerateWeeklyReport: () => void;
  isLoading: boolean;
}

const DailyWeeklyReports = ({ onGenerateDailyReport, onGenerateWeeklyReport, isLoading }: DailyWeeklyReportsProps) => {
  return (
    <div className="bg-gradient-to-r from-vivid-sky-blue-50 to-maya-blue-50 border border-maya-blue-200 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-vivid-sky-blue-500 to-vivid-sky-blue-600 rounded-lg">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-maya-blue-800 text-sm md:text-base">
            Smart Performance Reports
          </h3>
          <p className="text-xs md:text-sm text-maya-blue-600">
            Choose your insight level - quick daily pulse or deep weekly analysis
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Daily Report */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-maya-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <h4 className="font-medium text-maya-blue-800 text-sm">Yesterday's Pulse</h4>
          </div>
          <p className="text-xs text-maya-blue-600 mb-3">
            Quick daily check-in with your key metrics and immediate opportunities
          </p>
          <Button
            onClick={onGenerateDailyReport}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm text-xs h-8"
          >
            <Zap className="h-3 w-3 mr-1" />
            Get Daily Pulse
          </Button>
        </div>

        {/* Weekly Report */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-maya-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-vivid-sky-blue-600" />
            <h4 className="font-medium text-maya-blue-800 text-sm">Weekly Deep Dive</h4>
          </div>
          <p className="text-xs text-maya-blue-600 mb-3">
            Comprehensive analysis with trends, patterns, and strategic recommendations
          </p>
          <Button
            onClick={onGenerateWeeklyReport}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-vivid-sky-blue-500 to-vivid-sky-blue-600 hover:from-vivid-sky-blue-600 hover:to-vivid-sky-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm text-xs h-8"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Get Weekly Analysis
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-maya-blue-500 mt-3 text-center">
        📊 Daily insights help build habits • 📈 Weekly analysis drives strategy
      </p>
    </div>
  );
};

export default DailyWeeklyReports;
