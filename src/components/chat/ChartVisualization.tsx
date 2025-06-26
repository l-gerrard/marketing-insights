
import { Button } from '@/components/ui/button';
import { BarChart3, Brain } from 'lucide-react';

interface ChartVisualizationProps {
  onGetInsights: () => void;
  isLoading: boolean;
}

const ChartVisualization = ({ onGetInsights, isLoading }: ChartVisualizationProps) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-maya-blue-200 mb-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-vivid-sky-blue-600" />
        <span className="text-sm font-medium text-maya-blue-800">Smart Analytics</span>
      </div>
      <Button 
        onClick={onGetInsights}
        size="sm" 
        variant="outline"
        className="h-6 text-xs"
        disabled={isLoading}
      >
        <Brain className="h-3 w-3 mr-1" />
        Get Insights
      </Button>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-maya-blue-600">AI-Powered Analysis</span>
        <span className="text-xs font-medium text-maya-blue-800">Active</span>
      </div>
      <div className="w-full bg-maya-blue-100 rounded-full h-2">
        <div className="bg-gradient-to-r from-vivid-sky-blue-400 to-vivid-sky-blue-500 h-2 rounded-full w-3/4 animate-pulse"></div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-maya-blue-600">Trend Integration</span>
        <span className="text-xs font-medium text-maya-blue-800">Live</span>
      </div>
      <div className="w-full bg-maya-blue-100 rounded-full h-2">
        <div className="bg-gradient-to-r from-maya-blue-400 to-maya-blue-500 h-2 rounded-full w-4/5 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default ChartVisualization;
