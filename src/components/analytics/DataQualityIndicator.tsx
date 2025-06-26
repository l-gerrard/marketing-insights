
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { DataQualityInfo } from '@/lib/analytics-utils';

interface DataQualityIndicatorProps {
  dataQuality: DataQualityInfo;
  onRefresh?: () => void;
  compact?: boolean;
}

const DataQualityIndicator = ({ dataQuality, onRefresh, compact = false }: DataQualityIndicatorProps) => {
  const getStatusIcon = () => {
    if (!dataQuality.isComplete) {
      return <AlertTriangle className="h-3 w-3 text-amber-600" />;
    }
    
    switch (dataQuality.dataFreshness) {
      case 'fresh':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'stale':
        return <Clock className="h-3 w-3 text-orange-600" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
    }
  };

  const getStatusText = () => {
    if (!dataQuality.isComplete) {
      return compact ? 'Incomplete' : `Incomplete data (missing: ${dataQuality.missingDataTypes.join(', ')})`;
    }
    
    switch (dataQuality.dataFreshness) {
      case 'fresh':
        return compact ? 'Fresh' : 'Data is up to date';
      case 'stale':
        return compact ? 'Stale' : 'Data may be outdated';
      default:
        return compact ? 'Unknown' : 'Data freshness unknown';
    }
  };

  const getStatusColor = () => {
    if (!dataQuality.isComplete) return 'bg-amber-100 text-amber-800 border-amber-200';
    
    switch (dataQuality.dataFreshness) {
      case 'fresh':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stale':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getTooltipContent = () => {
    let content = getStatusText();
    
    if (dataQuality.lastSyncAt) {
      const syncDate = new Date(dataQuality.lastSyncAt);
      content += `\nLast sync: ${syncDate.toLocaleString()}`;
    }
    
    if (dataQuality.estimatedData) {
      content += '\nSome values may be estimated';
    }
    
    return content;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Badge 
              variant="outline" 
              className={`text-xs flex items-center gap-1 ${getStatusColor()}`}
            >
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            {onRefresh && !dataQuality.isComplete && (
              <button
                onClick={onRefresh}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="h-3 w-3 text-gray-600" />
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="whitespace-pre-line text-sm">
            {getTooltipContent()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataQualityIndicator;
