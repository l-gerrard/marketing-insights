
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Eye, Clock, MousePointer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateStandardizedMetrics, assessDataQuality, DateRange, DataQualityInfo, MetricsData } from '@/lib/analytics-utils';
import DataQualityIndicator from './DataQualityIndicator';

interface EnhancedMetricsCardsProps {
  currentData: any[];
  comparisonData: any[];
  loading: boolean;
  dateRange?: DateRange;
  onRefresh?: () => void;
}

const EnhancedMetricsCards = ({ currentData, comparisonData, loading, dateRange, onRefresh }: EnhancedMetricsCardsProps) => {
  const { user } = useAuth();
  const [dataQuality, setDataQuality] = useState<DataQualityInfo | null>(null);

  useEffect(() => {
    if (user && currentData.length > 0) {
      assessDataQuality(user.id, dateRange).then(setDataQuality);
    }
  }, [user, currentData.length, dateRange]);

  const currentMetrics = calculateStandardizedMetrics(currentData);
  const comparisonMetrics = calculateStandardizedMetrics(comparisonData);

  const calculateChange = (current: number, previous: number) => {
    if (comparisonData.length === 0) {
      return null;
    }
    
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  const formatChange = (change: number | null) => {
    if (change === null) {
      return {
        value: 'No comparison data',
        isPositive: null,
        icon: null,
        color: 'text-gray-500'
      };
    }

    const isPositive = change >= 0;
    return {
      value: Math.abs(change).toFixed(1) + '%',
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  const cards = [
    {
      title: 'Total Page Views',
      value: currentMetrics.totalViews.toLocaleString(),
      change: calculateChange(currentMetrics.totalViews, comparisonMetrics.totalViews),
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Sessions',
      value: currentMetrics.totalSessions.toLocaleString(),
      change: calculateChange(currentMetrics.totalSessions, comparisonMetrics.totalSessions),
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: currentMetrics.activeUsers.toLocaleString(),
      change: calculateChange(currentMetrics.activeUsers, comparisonMetrics.activeUsers),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Bounce Rate',
      value: currentMetrics.bounceRate > 0 ? currentMetrics.bounceRate.toFixed(1) + '%' : 'N/A',
      change: calculateChange(currentMetrics.bounceRate, comparisonMetrics.bounceRate),
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Engagement Rate',
      value: currentMetrics.engagementRate.toFixed(1) + '%',
      change: calculateChange(currentMetrics.engagementRate, comparisonMetrics.engagementRate),
      icon: MousePointer,
      color: 'text-indigo-600'
    },
    {
      title: 'Conversions',
      value: currentMetrics.conversions.toLocaleString(),
      change: calculateChange(currentMetrics.conversions, comparisonMetrics.conversions),
      icon: TrendingUp,
      color: 'text-emerald-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {cards.map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Data Quality Indicator */}
      {dataQuality && (
        <div className="flex justify-end">
          <DataQualityIndicator 
            dataQuality={dataQuality} 
            onRefresh={onRefresh}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          const changeData = formatChange(card.change);
          
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-iced-coffee-600">
                  {card.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-iced-coffee-800">{card.value}</div>
                <div className="flex items-center mt-1">
                  {changeData.icon && (
                    <changeData.icon className={`h-3 w-3 mr-1 ${changeData.color}`} />
                  )}
                  <span className={`text-xs ${changeData.color}`}>
                    {changeData.value}
                  </span>
                  {changeData.value !== 'No comparison data' && (
                    <span className="text-xs text-iced-coffee-500 ml-1">vs previous period</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedMetricsCards;
