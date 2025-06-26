
import { TrendingUp, PieChart } from 'lucide-react';

const FloatingChartElements = () => (
  <>
    <div className="absolute -top-8 -right-8 z-10 animate-float">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-vivid-sky-blue-200 shadow-lg">
        <TrendingUp className="h-6 w-6 text-vivid-sky-blue-600" />
      </div>
    </div>
    
    <div className="absolute -top-4 -left-4 z-10 animate-float animation-delay-1000">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-maya-blue-200 shadow-lg">
        <PieChart className="h-6 w-6 text-maya-blue-600" />
      </div>
    </div>
  </>
);

export default FloatingChartElements;
