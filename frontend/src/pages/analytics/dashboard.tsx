import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Settings,
  Eye,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  User,
  Building2,
  PieChart,
  LineChart,
  Target,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react';

interface AnalyticsDashboardProps {
  companyId: string;
}

interface AnalyticsMetrics {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  expenses: {
    total: number;
    monthly: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  profit: {
    total: number;
    margin: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  customers: {
    total: number;
    active: number;
    new: number;
    churn: number;
  };
  cashFlow: {
    current: number;
    projected: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  customers: number;
}

interface PredictiveInsights {
  revenueForecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
  expenseForecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
  cashFlowForecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
  churnRisk: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
  opportunities: {
    upselling: number;
    crossSelling: number;
    retention: number;
  };
}

interface BusinessIntelligence {
  kpis: {
    name: string;
    value: number;
    target: number;
    status: 'on-track' | 'at-risk' | 'behind';
    trend: 'up' | 'down' | 'stable';
  }[];
  alerts: {
    type: 'warning' | 'error' | 'info';
    message: string;
    priority: 'high' | 'medium' | 'low';
    action: string;
  }[];
  recommendations: {
    category: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    roi: number;
  }[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ companyId }) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [intelligence, setIntelligence] = useState<BusinessIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [companyId, selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [metricsResponse, timeSeriesResponse, insightsResponse, intelligenceResponse] = await Promise.all([
        fetch(`/api/advanced-analytics/${companyId}/metrics?period=${selectedPeriod}`),
        fetch(`/api/advanced-analytics/${companyId}/time-series?period=12m`),
        fetch(`/api/advanced-analytics/${companyId}/predictive-insights`),
        fetch(`/api/advanced-analytics/${companyId}/business-intelligence`)
      ]);

      if (!metricsResponse.ok || !timeSeriesResponse.ok || !insightsResponse.ok || !intelligenceResponse.ok) {
        throw new Error('Failed to load analytics data');
      }

      const [metricsData, timeSeriesData, insightsData, intelligenceData] = await Promise.all([
        metricsResponse.json(),
        timeSeriesResponse.json(),
        insightsResponse.json(),
        intelligenceResponse.json()
      ]);

      setMetrics(metricsData.data);
      setTimeSeries(timeSeriesData.data);
      setInsights(insightsData.data);
      setIntelligence(intelligenceData.data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: 'on-track' | 'at-risk' | 'behind') => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'at-risk': return 'bg-yellow-500';
      case 'behind': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: 'on-track' | 'at-risk' | 'behind') => {
    switch (status) {
      case 'on-track': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'at-risk': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'behind': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive business intelligence and predictive insights</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics?.revenue.monthly || 0)}</div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metrics?.revenue.trend || 'stable')}
                  <span className={`text-sm ${getTrendColor(metrics?.revenue.trend || 'stable')}`}>
                    {formatPercentage(metrics?.revenue.growth || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics?.expenses.monthly || 0)}</div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metrics?.expenses.trend || 'stable')}
                  <span className={`text-sm ${getTrendColor(metrics?.expenses.trend || 'stable')}`}>
                    {formatPercentage(metrics?.expenses.growth || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics?.profit.total || 0)}</div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metrics?.profit.trend || 'stable')}
                  <span className={`text-sm ${getTrendColor(metrics?.profit.trend || 'stable')}`}>
                    {formatPercentage(metrics?.profit.growth || 0)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Margin: {metrics?.profit.margin?.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.customers.total || 0}</div>
                <div className="text-sm text-muted-foreground">
                  <p>Active: {metrics?.customers.active || 0}</p>
                  <p>New: {metrics?.customers.new || 0}</p>
                  <p>Churn: {metrics?.customers.churn || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-600">Chart visualization would go here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <LineChart className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-600">Chart visualization would go here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {insights && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>Revenue Forecast</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Next Month:</span>
                        <span className="font-medium">{formatCurrency(insights.revenueForecast.nextMonth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Quarter:</span>
                        <span className="font-medium">{formatCurrency(insights.revenueForecast.nextQuarter)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Year:</span>
                        <span className="font-medium">{formatCurrency(insights.revenueForecast.nextYear)}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence:</span>
                          <span>{insights.revenueForecast.confidence.toFixed(1)}%</span>
                        </div>
                        <Progress value={insights.revenueForecast.confidence} className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5" />
                      <span>Expense Forecast</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Next Month:</span>
                        <span className="font-medium">{formatCurrency(insights.expenseForecast.nextMonth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Quarter:</span>
                        <span className="font-medium">{formatCurrency(insights.expenseForecast.nextQuarter)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Year:</span>
                        <span className="font-medium">{formatCurrency(insights.expenseForecast.nextYear)}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence:</span>
                          <span>{insights.expenseForecast.confidence.toFixed(1)}%</span>
                        </div>
                        <Progress value={insights.expenseForecast.confidence} className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Cash Flow Forecast</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Next Month:</span>
                        <span className="font-medium">{formatCurrency(insights.cashFlowForecast.nextMonth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Quarter:</span>
                        <span className="font-medium">{formatCurrency(insights.cashFlowForecast.nextQuarter)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Year:</span>
                        <span className="font-medium">{formatCurrency(insights.cashFlowForecast.nextYear)}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence:</span>
                          <span>{insights.cashFlowForecast.confidence.toFixed(1)}%</span>
                        </div>
                        <Progress value={insights.cashFlowForecast.confidence} className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Churn Risk Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>High Risk:</span>
                        <Badge variant="destructive">{insights.churnRisk.highRisk}%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Medium Risk:</span>
                        <Badge variant="secondary">{insights.churnRisk.mediumRisk}%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Low Risk:</span>
                        <Badge variant="outline">{insights.churnRisk.lowRisk}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Upselling:</span>
                        <span className="font-medium">{insights.opportunities.upselling} opportunities</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cross-selling:</span>
                        <span className="font-medium">{insights.opportunities.crossSelling} opportunities</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Retention:</span>
                        <span className="font-medium">{insights.opportunities.retention} opportunities</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-6">
          {intelligence && (
            <>
              {/* KPIs */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {intelligence.kpis.map((kpi, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium">{kpi.name}</span>
                            {getStatusIcon(kpi.status)}
                            <Badge variant="outline" className={getStatusColor(kpi.status)}>
                              {kpi.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Current: {formatCurrency(kpi.value)}</p>
                            <p>Target: {formatCurrency(kpi.target)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(kpi.trend)}
                          <span className="text-sm font-medium">{kpi.trend.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {intelligence.alerts.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-600">No active alerts</p>
                      </div>
                    ) : (
                      intelligence.alerts.map((alert, index) => (
                        <div key={index} className={`p-4 border rounded-lg ${getAlertColor(alert.priority)}`}>
                          <div className="flex items-start space-x-3">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium">{alert.message}</span>
                                <Badge variant="outline">{alert.priority.toUpperCase()}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{alert.action}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {intelligence.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{rec.category}</Badge>
                            <Badge variant="outline">{rec.impact.toUpperCase()}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Impact: {rec.impact}</span>
                          <span>Effort: {rec.effort}</span>
                          <span>ROI: {rec.roi}x</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Custom reports and scheduled reports would be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Analytics configuration and preferences would be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;




