
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Eye, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsCardsProps {
  data: any[];
  loading: boolean;
}

const MetricsCards = ({ data, loading }: MetricsCardsProps) => {
  const calculateMetrics = () => {
    if (!data.length) return { totalViews: 0, totalSessions: 0, activeUsers: 0, avgSessionDuration: 0 };

    const totalViews = data.reduce((sum, item) => sum + (item.metric_value || 0), 0);
    const totalSessions = data.reduce((sum, item) => {
      const sessions = item.dimensions?.sessions || 0;
      return sum + sessions;
    }, 0);
    const activeUsers = data.reduce((sum, item) => {
      const users = item.dimensions?.active_users || 0;
      return sum + users;
    }, 0);
    
    return {
      totalViews,
      totalSessions,
      activeUsers,
      avgSessionDuration: totalSessions > 0 ? Math.round((totalViews / totalSessions) * 100) / 100 : 0
    };
  };

  const metrics = calculateMetrics();

  const cards = [
    {
      title: 'Total Page Views',
      value: metrics.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Sessions',
      value: metrics.totalSessions.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Avg. Pages/Session',
      value: metrics.avgSessionDuration.toString(),
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
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
              <p className="text-xs text-iced-coffee-500 mt-1">
                {data.length > 0 ? 'Based on current data' : 'No data available'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsCards;
