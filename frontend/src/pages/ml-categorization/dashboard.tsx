import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Filter,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Activity
} from 'lucide-react';

interface MLCategorizationDashboardProps {
  companyId: string;
}

interface CategorizationStats {
  totalCategorizations: number;
  feedbackCount: number;
  avgConfidence: number;
  avgFeedbackConfidence: number;
  mlCategorizations: number;
  rulesCategorizations: number;
  correctCategorizations: number;
  incorrectCategorizations: number;
}

interface CategorizationItem {
  id: string;
  category: string;
  confidence: number;
  method: 'ml' | 'rules' | 'manual';
  userFeedback?: string;
  correctedCategory?: string;
  transaction: {
    id: string;
    amount: number;
    description: string;
    type: string;
    createdAt: string;
  };
  createdAt: string;
}

interface CategoryDistribution {
  category: string;
  count: number;
  avgConfidence: number;
  correctCount: number;
  incorrectCount: number;
}

const MLCategorizationDashboard: React.FC<MLCategorizationDashboardProps> = ({ companyId }) => {
  const [stats, setStats] = useState<CategorizationStats | null>(null);
  const [recentCategorizations, setRecentCategorizations] = useState<CategorizationItem[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryDistribution[]>([]);
  const [accuracyTrends, setAccuracyTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadCategorizationData();
  }, [companyId]);

  const loadCategorizationData = async () => {
    try {
      setLoading(true);
      const [statsResponse, recentResponse, categoriesResponse, trendsResponse] = await Promise.all([
        fetch(`/api/ml-categorization/stats`),
        fetch(`/api/ml-categorization/recent`),
        fetch(`/api/ml-categorization/top-categories`),
        fetch(`/api/ml-categorization/accuracy-trends`)
      ]);

      if (!statsResponse.ok || !recentResponse.ok || !categoriesResponse.ok || !trendsResponse.ok) {
        throw new Error('Failed to load categorization data');
      }

      const [statsData, recentData, categoriesData, trendsData] = await Promise.all([
        statsResponse.json(),
        recentResponse.json(),
        categoriesResponse.json(),
        trendsResponse.json()
      ]);

      setStats(statsData.data);
      setRecentCategorizations(recentData.data);
      setTopCategories(categoriesData.data);
      setAccuracyTrends(trendsData.data);
    } catch (error) {
      console.error('Error loading categorization data:', error);
      setError('Failed to load categorization data');
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'ml': return 'bg-blue-500';
      case 'rules': return 'bg-green-500';
      case 'manual': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'ml': return <Brain className="h-4 w-4" />;
      case 'rules': return <Settings className="h-4 w-4" />;
      case 'manual': return <Target className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const provideFeedback = async (categorizationId: string, feedback: string, correctedCategory?: string) => {
    try {
      const response = await fetch(`/api/ml-categorization/categorization/${categorizationId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback,
          correctedCategory,
          confidence: 1.0
        })
      });

      if (response.ok) {
        // Reload data to reflect feedback
        loadCategorizationData();
      }
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading categorization data...</span>
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
          <h1 className="text-3xl font-bold">ML Categorization Dashboard</h1>
          <p className="text-gray-600">AI-powered transaction categorization with confidence scoring</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadCategorizationData} variant="outline">
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Categorization Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Categorizations</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCategorizations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatConfidence(stats?.avgConfidence || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  ML model confidence
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback Count</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.feedbackCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  User feedback received
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats && stats.feedbackCount > 0 
                    ? `${((stats.correctCategorizations / stats.feedbackCount) * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on feedback
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Method Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Categorization Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-blue-500" />
                      <span>ML Model</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={stats ? (stats.mlCategorizations / stats.totalCategorizations) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{stats?.mlCategorizations || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-green-500" />
                      <span>Rules</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={stats ? (stats.rulesCategorizations / stats.totalCategorizations) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{stats?.rulesCategorizations || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>High (≥80%)</span>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium (60-79%)</span>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Low (<60%)</span>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Categorizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCategorizations.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent categorizations</p>
                  </div>
                ) : (
                  recentCategorizations.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className={getMethodColor(item.method)}>
                            {getMethodIcon(item.method)}
                            <span className="ml-1">{item.method.toUpperCase()}</span>
                          </Badge>
                          <span className="font-medium">{item.category}</span>
                          <span className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                            {formatConfidence(item.confidence)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Transaction:</strong> {item.transaction.description}</p>
                          <p><strong>Amount:</strong> {formatAmount(item.transaction.amount)}</p>
                          <p><strong>Date:</strong> {formatDate(item.transaction.createdAt)}</p>
                        </div>
                        {item.userFeedback && (
                          <div className="mt-2">
                            <Badge variant={item.userFeedback === 'correct' ? 'default' : 'destructive'}>
                              {item.userFeedback === 'correct' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {item.userFeedback}
                            </Badge>
                            {item.correctedCategory && (
                              <span className="ml-2 text-sm text-gray-600">
                                → {item.correctedCategory}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => provideFeedback(item.id, 'correct')}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => provideFeedback(item.id, 'incorrect')}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No category data available</p>
                  </div>
                ) : (
                  topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{category.category}</h4>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                              {formatConfidence(category.avgConfidence)}
                            </span>
                            <Badge variant="outline">
                              {category.count} transactions
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            {category.correctCount} correct
                          </span>
                          <span className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            {category.incorrectCount} incorrect
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accuracyTrends.length === 0 ? (
                  <div className="text-center py-8">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No trend data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accuracyTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Week of {new Date(trend.week).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">
                              {trend.total_categorizations} categorizations
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {trend.correct_categorizations > 0 
                              ? `${((trend.correct_categorizations / trend.total_categorizations) * 100).toFixed(1)}%`
                              : 'N/A'
                            }
                          </p>
                          <p className="text-sm text-gray-600">accuracy</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLCategorizationDashboard;