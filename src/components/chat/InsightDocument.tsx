
import React from 'react';
import { StructuredInsight } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Clock, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface InsightDocumentProps {
  insight: StructuredInsight;
}

const InsightDocument = ({ insight }: InsightDocumentProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-vivid-sky-blue-500 to-maya-blue-500 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Analytics Insights Report</h2>
        <p className="text-maya-blue-100">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Executive Summary */}
      <Card className="border-l-4 border-l-vivid-sky-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-vivid-sky-blue-600" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-maya-blue-700 leading-relaxed">{insight.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insight.keyMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-maya-blue-800">{metric.title}</h3>
                {getChangeIcon(metric.changeType)}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-maya-blue-900">
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-sm text-maya-blue-600">{metric.unit}</span>
                )}
              </div>
              <div className={`text-sm ${getChangeColor(metric.changeType)} mt-1`}>
                {metric.change > 0 ? '+' : ''}{metric.change}% from last period
              </div>
              {metric.description && (
                <p className="text-xs text-maya-blue-600 mt-2">{metric.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Analysis Chart */}
      {insight.trendAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insight.trendAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#23c9ff" 
                  strokeWidth={3}
                  dot={{ fill: '#23c9ff', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-vivid-sky-blue-600" />
            Actionable Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insight.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-maya-blue-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority)} mt-2`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-maya-blue-800">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-maya-blue-700 text-sm mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-vivid-sky-blue-100 text-vivid-sky-blue-800">
                        {rec.category}
                      </Badge>
                      {rec.actionable && (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          Actionable
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Indicator */}
      <Card className="bg-gradient-to-r from-maya-blue-50 to-vivid-sky-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Data Quality & Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-maya-blue-600 mb-1">Quality Score</p>
              <div className="flex items-center gap-2">
                <Progress value={insight.dataQuality.score} className="flex-1" />
                <span className="text-sm font-medium">{insight.dataQuality.score}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-maya-blue-600 mb-1">Data Sources</p>
              <div className="flex flex-wrap gap-1">
                {insight.dataQuality.sources.map((source, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-maya-blue-600 mb-1">Last Updated</p>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{insight.dataQuality.lastUpdated}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightDocument;
