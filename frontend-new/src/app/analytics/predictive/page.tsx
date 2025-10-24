'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface CashFlowForecast {
  forecast: Array<{
    date: string;
    projectedIncome: number;
    projectedExpenses: number;
    netCashFlow: number;
    confidence: number;
  }>;
  confidence: number;
  assumptions: string[];
}

interface RevenueTrend {
  historical: Array<{
    month: string;
    total: number;
  }>;
  trend: {
    slope: number;
    r2: number;
  };
  predictions: Array<{
    month: string;
    amount: number;
    confidence: number;
  }>;
  growthRate: number;
  seasonality: any[];
}

interface ExpenseTrend {
  historical: Array<{
    month: string;
    categories: Record<string, number>;
  }>;
  categoryTrends: Record<string, any>;
  predictions: Array<{
    month: string;
    categories: Record<string, number>;
  }>;
  topCategories: Array<{
    category: string;
    total: number;
  }>;
}

interface ScenarioAnalysis {
  base: CashFlowForecast;
  scenarios: CashFlowForecast[];
  recommendations: Array<{
    type: string;
    message: string;
    action: string;
  }>;
}

interface AnalyticsDashboard {
  cashFlow: {
    forecast: CashFlowForecast['forecast'];
    confidence: number;
    totalProjectedIncome: number;
    totalProjectedExpenses: number;
    netProjectedCashFlow: number;
    assumptions: string[];
  };
  revenue: {
    trend: any;
    growthRate: number;
    seasonality: any[];
    predictions: any[];
  };
  expenses: {
    categoryTrends: Record<string, any>;
    growthRate: number;
    topCategories: Array<{
      category: string;
      total: number;
    }>;
    predictions: any[];
  };
  insights: Array<{
    type: string;
    title: string;
    message: string;
    confidence: number;
  }>;
}

export default function PredictiveAnalyticsPage() {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [cashFlowForecast, setCashFlowForecast] = useState<CashFlowForecast | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend | null>(null);
  const [expenseTrend, setExpenseTrend] = useState<ExpenseTrend | null>(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<ScenarioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.data.dashboard);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCashFlowForecast = async (days: number = 90) => {
    try {
      const response = await fetch(`/api/analytics/cash-flow-forecast?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setCashFlowForecast(data.data.forecast);
      }
    } catch (error) {
      console.error('Failed to load cash flow forecast:', error);
    }
  };

  const loadRevenueTrend = async (months: number = 12) => {
    try {
      const response = await fetch(`/api/analytics/revenue-trend?months=${months}`);
      if (response.ok) {
        const data = await response.json();
        setRevenueTrend(data.data.trend);
      }
    } catch (error) {
      console.error('Failed to load revenue trend:', error);
    }
  };

  const loadExpenseTrend = async (months: number = 12) => {
    try {
      const response = await fetch(`/api/analytics/expense-trend?months=${months}`);
      if (response.ok) {
        const data = await response.json();
        setExpenseTrend(data.data.trend);
      }
    } catch (error) {
      console.error('Failed to load expense trend:', error);
    }
  };

  const loadScenarioAnalysis = async (scenarios: string[]) => {
    try {
      const response = await fetch('/api/analytics/scenario-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios })
      });
      if (response.ok) {
        const data = await response.json();
        setScenarioAnalysis(data.data.analysis);
      }
    } catch (error) {
      console.error('Failed to load scenario analysis:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      case 'info': return 'border-blue-200 bg-blue-50';
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
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading analytics...</span>
            </div>
          ) : dashboard ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Projected Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(dashboard.cashFlow.totalProjectedIncome)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Next 90 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Projected Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(dashboard.cashFlow.totalProjectedExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Next 90 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      dashboard.cashFlow.netProjectedCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(dashboard.cashFlow.netProjectedCashFlow)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Next 90 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatPercentage(dashboard.cashFlow.confidence)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Forecast accuracy
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>
                    Automated insights based on your financial data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard.insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                      >
                        <div className="flex items-start space-x-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-medium">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline">
                                {formatPercentage(insight.confidence)} confidence
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Growth Rates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Growth</CardTitle>
                    <CardDescription>
                      Historical and projected revenue trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Growth Rate</span>
                        <span className={`text-lg font-bold ${
                          dashboard.revenue.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(dashboard.revenue.growthRate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Trend Strength</span>
                        <span className="text-sm">
                          {dashboard.revenue.trend.r2 > 0.7 ? 'Strong' : 
                           dashboard.revenue.trend.r2 > 0.4 ? 'Moderate' : 'Weak'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expense Growth</CardTitle>
                    <CardDescription>
                      Historical and projected expense trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Growth Rate</span>
                        <span className={`text-lg font-bold ${
                          dashboard.expenses.growthRate <= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(dashboard.expenses.growthRate)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Top Categories</span>
                        <div className="space-y-1">
                          {dashboard.expenses.topCategories.slice(0, 3).map((category, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{category.category}</span>
                              <span>{formatCurrency(category.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                No analytics data available. Ensure you have sufficient transaction history for accurate predictions.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Forecast</CardTitle>
              <CardDescription>
                90-day cash flow projection based on historical patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button onClick={() => loadCashFlowForecast(30)} variant="outline">
                    30 Days
                  </Button>
                  <Button onClick={() => loadCashFlowForecast(90)} variant="outline">
                    90 Days
                  </Button>
                  <Button onClick={() => loadCashFlowForecast(180)} variant="outline">
                    180 Days
                  </Button>
                </div>
                
                {cashFlowForecast ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Total Projected Income</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(
                            cashFlowForecast.forecast.reduce((sum, day) => sum + day.projectedIncome, 0)
                          )}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">Total Projected Expenses</p>
                        <p className="text-2xl font-bold text-red-700">
                          {formatCurrency(
                            cashFlowForecast.forecast.reduce((sum, day) => sum + day.projectedExpenses, 0)
                          )}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">Net Cash Flow</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(
                            cashFlowForecast.forecast.reduce((sum, day) => sum + day.netCashFlow, 0)
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Forecast Assumptions</h4>
                      <ul className="space-y-1">
                        {cashFlowForecast.assumptions.map((assumption, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Info className="h-4 w-4" />
                            <span>{assumption}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <LineChart className="h-4 w-4" />
                    <AlertDescription>
                      Click a time period above to load cash flow forecast.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend Analysis</CardTitle>
              <CardDescription>
                Historical revenue patterns and future predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button onClick={() => loadRevenueTrend(6)} variant="outline">
                    6 Months
                  </Button>
                  <Button onClick={() => loadRevenueTrend(12)} variant="outline">
                    12 Months
                  </Button>
                  <Button onClick={() => loadRevenueTrend(24)} variant="outline">
                    24 Months
                  </Button>
                </div>
                
                {revenueTrend ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Growth Rate</h4>
                        <p className={`text-2xl font-bold ${
                          revenueTrend.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(revenueTrend.growthRate)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900">Trend Strength</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {revenueTrend.trend.r2 > 0.7 ? 'Strong' : 
                           revenueTrend.trend.r2 > 0.4 ? 'Moderate' : 'Weak'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Revenue Predictions</h4>
                      <div className="space-y-2">
                        {revenueTrend.predictions.map((prediction, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="font-medium">{prediction.month}</span>
                            <div className="flex items-center space-x-4">
                              <span className="font-bold">{formatCurrency(prediction.amount)}</span>
                              <Badge variant="outline">
                                {formatPercentage(prediction.confidence)} confidence
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      Click a time period above to load revenue trend analysis.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trend Analysis</CardTitle>
              <CardDescription>
                Historical expense patterns and category breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button onClick={() => loadExpenseTrend(6)} variant="outline">
                    6 Months
                  </Button>
                  <Button onClick={() => loadExpenseTrend(12)} variant="outline">
                    12 Months
                  </Button>
                  <Button onClick={() => loadExpenseTrend(24)} variant="outline">
                    24 Months
                  </Button>
                </div>
                
                {expenseTrend ? (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Top Expense Categories</h4>
                      <div className="space-y-2">
                        {expenseTrend.topCategories.map((category, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="font-medium">{category.category}</span>
                            <span className="font-bold">{formatCurrency(category.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Category Trends</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(expenseTrend.categoryTrends).map(([category, trend]: [string, any]) => (
                          <div key={category} className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{category}</span>
                              <span className={`text-sm ${
                                trend.slope > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {trend.slope > 0 ? '↗' : '↘'} {formatPercentage(Math.abs(trend.slope))}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <PieChart className="h-4 w-4" />
                    <AlertDescription>
                      Click a time period above to load expense trend analysis.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis</CardTitle>
              <CardDescription>
                Compare different business scenarios and their financial impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={() => loadScenarioAnalysis(['optimistic', 'pessimistic'])} 
                    variant="outline"
                  >
                    Compare Scenarios
                  </Button>
                  <Button 
                    onClick={() => loadScenarioAnalysis(['recession', 'growth'])} 
                    variant="outline"
                  >
                    Economic Scenarios
                  </Button>
                </div>
                
                {scenarioAnalysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">Optimistic Scenario</h4>
                        <p className="text-sm text-green-700">
                          Assumes 20% higher income, 10% lower expenses
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-red-900">Pessimistic Scenario</h4>
                        <p className="text-sm text-red-700">
                          Assumes 20% lower income, 10% higher expenses
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Recommendations</h4>
                      <div className="space-y-2">
                        {scenarioAnalysis.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-900">{rec.message}</p>
                                <p className="text-sm text-blue-700">{rec.action}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      Click a scenario type above to load scenario analysis.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

