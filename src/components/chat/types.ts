
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasAnalyticsData?: boolean;
  structuredContent?: StructuredInsight;
}

export interface StructuredInsight {
  type: 'insight_document';
  executiveSummary: string;
  keyMetrics: MetricCard[];
  trendAnalysis: TrendData[];
  recommendations: Recommendation[];
  dataQuality: DataQuality;
  chartData?: ChartData[];
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  unit?: string;
  description?: string;
}

export interface TrendData {
  period: string;
  value: number;
  date: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'engagement' | 'content' | 'technical';
  actionable: boolean;
}

export interface DataQuality {
  score: number;
  sources: string[];
  lastUpdated: string;
  completeness: number;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: any[];
  xKey?: string;
  yKey?: string;
}

// Enhanced interfaces for small business focused insights with source tracking
export interface SmallBusinessInsight {
  insight: string;
  sourceArticles: number[];
}

export interface EnhancedDailyInsight {
  summary: string;
  quickWins?: SmallBusinessInsight[];
  budgetFriendly?: SmallBusinessInsight[];
  platformUpdates?: SmallBusinessInsight[];
  localOpportunities?: SmallBusinessInsight[];
  aiSummary?: string;
  articleMapping?: Record<number, ArticleReference>;
  generatedAt: string;
}

export interface ArticleReference {
  id: string;
  headline: string;
  url: string | null;
  source: string;
  published_date?: string;
}

// Legacy interfaces for backwards compatibility
export interface InsightWithSources {
  insight: string;
  sourceArticles: number[];
}

export interface TrendWithSources {
  trend: string;
  sourceArticles: number[];
}
