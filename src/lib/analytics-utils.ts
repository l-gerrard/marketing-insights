
import { supabase } from '@/integrations/supabase/client';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DataQualityInfo {
  isComplete: boolean;
  lastSyncAt?: string;
  estimatedData: boolean;
  missingDataTypes: string[];
  dataFreshness: 'fresh' | 'stale' | 'unknown';
}

export interface MetricsData {
  totalViews: number;
  totalSessions: number;
  activeUsers: number;
  avgSessionDuration: number;
  engagementRate: number;
  conversions: number;
  bounceRate: number;
}

// Standardized date range filtering for all components
export const formatDateForQuery = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addDateRangeFilter = (query: any, dateRange?: DateRange) => {
  if (dateRange?.startDate && dateRange?.endDate) {
    const startDate = formatDateForQuery(dateRange.startDate);
    const endDate = formatDateForQuery(dateRange.endDate);
    return query
      .gte('date_range_start', startDate)
      .lte('date_range_end', endDate);
  }
  return query;
};

// Standardized bounce rate calculation
export const calculateWeightedBounceRate = (records: any[]): number => {
  let totalBounceRateWeighted = 0;
  let totalSessions = 0;

  records.forEach(record => {
    const bounceRate = record.bounce_rate || 0;
    const sessions = record.sessions || record.metric_value || 1;
    
    if (bounceRate > 0) {
      totalBounceRateWeighted += bounceRate * sessions;
      totalSessions += sessions;
    }
  });

  return totalSessions > 0 ? totalBounceRateWeighted / totalSessions : 0;
};

// Data deduplication utility
export const deduplicateByKey = <T>(
  data: T[], 
  keyExtractor: (item: T) => string,
  aggregateFunction?: (existing: T, newItem: T) => T
): T[] => {
  const map = new Map<string, T>();
  
  data.forEach(item => {
    const key = keyExtractor(item);
    const existing = map.get(key);
    
    if (existing && aggregateFunction) {
      map.set(key, aggregateFunction(existing, item));
    } else if (!existing) {
      map.set(key, item);
    }
  });
  
  return Array.from(map.values());
};

// Standardized metrics calculation
export const calculateStandardizedMetrics = (data: any[]): MetricsData => {
  console.log('📊 Calculating standardized metrics from', data.length, 'records');

  // Look for overall totals first for most accurate data
  const overallRecord = data.find(item => 
    item.data_type === 'overall_totals' && 
    (item.metric_name === 'site_performance' || item.metric_name === 'site_totals')
  );

  if (overallRecord) {
    console.log('✅ Using overall totals record for metrics');
    
    const bounceRate = overallRecord.bounce_rate || 
                      overallRecord.dimensions?.bounce_rate || 
                      calculateWeightedBounceRate(data.filter(d => d.bounce_rate > 0));

    return {
      totalViews: overallRecord.metric_value || 0,
      totalSessions: Number(overallRecord.dimensions?.sessions) || 0,
      activeUsers: Number(overallRecord.dimensions?.active_users) || 0,
      avgSessionDuration: overallRecord.avg_session_duration || 0,
      engagementRate: overallRecord.engagement_rate || (bounceRate > 0 ? 100 - bounceRate : 0),
      conversions: overallRecord.goal_completions || 0,
      bounceRate
    };
  }

  // Fallback to aggregated calculation with deduplication
  console.log('⚠️ No overall record found, using aggregated calculation');
  
  // Deduplicate enhanced metrics data
  const enhancedData = deduplicateByKey(
    data.filter(item => item.data_type === 'enhanced_metrics'),
    item => `${item.metric_name}-${item.date_range_start}`,
    (existing, newItem) => ({
      ...existing,
      metric_value: existing.metric_value + newItem.metric_value,
      dimensions: {
        ...existing.dimensions,
        sessions: (existing.dimensions?.sessions || 0) + (newItem.dimensions?.sessions || 0),
        active_users: (existing.dimensions?.active_users || 0) + (newItem.dimensions?.active_users || 0)
      }
    })
  );

  const totalViews = enhancedData.reduce((sum, item) => sum + (item.metric_value || 0), 0);
  const totalSessions = enhancedData.reduce((sum, item) => sum + (item.dimensions?.sessions || 0), 0);
  const activeUsers = enhancedData.reduce((sum, item) => sum + (item.dimensions?.active_users || 0), 0);
  const bounceRate = calculateWeightedBounceRate(enhancedData);

  return {
    totalViews,
    totalSessions,
    activeUsers,
    avgSessionDuration: totalSessions > 0 ? totalViews / totalSessions : 0,
    engagementRate: bounceRate > 0 ? 100 - bounceRate : 0,
    conversions: enhancedData.reduce((sum, item) => sum + (item.goal_completions || 0), 0),
    bounceRate
  };
};

// Data quality assessment
export const assessDataQuality = async (userId: string, dateRange?: DateRange): Promise<DataQualityInfo> => {
  try {
    // Check for recent sync data
    let query = supabase
      .from('analytics_data')
      .select('created_at, data_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    query = addDateRangeFilter(query, dateRange);
    const { data: recentData } = await query;

    const lastSyncAt = recentData?.[0]?.created_at;
    const lastSync = lastSyncAt ? new Date(lastSyncAt) : null;
    const now = new Date();
    const hoursSinceSync = lastSync ? (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60) : Infinity;

    // Check data completeness
    let dataQuery = supabase
      .from('analytics_data')
      .select('data_type')
      .eq('user_id', userId);

    dataQuery = addDateRangeFilter(dataQuery, dateRange);
    const { data: allData } = await dataQuery;

    const existingDataTypes = new Set(allData?.map(d => d.data_type) || []);
    const requiredDataTypes = ['overall_totals', 'daily_breakdown', 'enhanced_metrics'];
    const missingDataTypes = requiredDataTypes.filter(type => !existingDataTypes.has(type));

    return {
      isComplete: missingDataTypes.length === 0,
      lastSyncAt,
      estimatedData: missingDataTypes.length > 0,
      missingDataTypes,
      dataFreshness: hoursSinceSync < 2 ? 'fresh' : hoursSinceSync < 24 ? 'stale' : 'unknown'
    };
  } catch (error) {
    console.error('Error assessing data quality:', error);
    return {
      isComplete: false,
      estimatedData: true,
      missingDataTypes: ['unknown'],
      dataFreshness: 'unknown'
    };
  }
};

// Standardized error handling
export const handleAnalyticsError = (error: any, componentName: string) => {
  console.error(`Error in ${componentName}:`, error);
  
  if (error.message?.includes('insufficient authentication')) {
    return {
      type: 'auth',
      message: 'Authentication required. Please reconnect your Google Analytics account.',
      action: 'reconnect'
    };
  }
  
  if (error.message?.includes('API limit')) {
    return {
      type: 'limit',
      message: 'API limit exceeded. Data will automatically sync with reduced metrics.',
      action: 'wait'
    };
  }
  
  return {
    type: 'generic',
    message: `Failed to load data: ${error.message}`,
    action: 'retry'
  };
};
