import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Settings,
  Eye,
  Play,
  Pause,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Zap,
  Lightbulb,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Database,
  Cpu,
  Layers
} from 'lucide-react';

interface PredictiveAnalyticsDashboardProps {
  companyId: string;
}

interface ForecastData {
  period: string;
  value: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

interface TimeSeriesForecast {
  metric: string;
  periods: ForecastData[];
  seasonality: {
    detected: boolean;
    period: number;
    strength: number;
  };
  trend: {
    direction: 'up' | 'down' | 'stable';
    strength: number;
  };
  accuracy: number;
}

interface ModelPrediction {
  modelId: string;
  input: Record<string, any>;
  prediction: any;
  confidence: number;
  probability?: number;
  explanation?: string;
}

interface CustomerSegmentation {
  segment: string;
  customers: number;
  revenue: number;
  characteristics: Record<string, any>;
  recommendations: string[];
}

interface AnomalyDetection {
  timestamp: Date;
  metric: string;
  value: number;
  expectedValue: number;
  anomalyScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedAction: string;
}

interface ModelPerformance {
  models: any[];
  overallAccuracy: number;
  modelCount: number;
  lastTraining: string | null;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({ companyId }) => {
  const [revenueForecast, setRevenueForecast] = useState<TimeSeriesForecast | null>(null);
  const [expenseForecast, setExpenseForecast] = useState<TimeSeriesForecast | null>(null);
  const [cashFlowForecast, setCashFlowForecast] = useState<TimeSeriesForecast | null>(null);
  const [churnPredictions, setChurnPredictions] = useState<ModelPrediction[]>([]);
  const [segments, setSegments] = useState<CustomerSegmentation[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [performance, setPerformance] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('forecasts');
  const [selectedPeriods, setSelectedPeriods] = useState(12);

  useEffect(() => {
    loadPredictiveData();
  }, [companyId, selectedPeriods]);

  const loadPredictiveData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, performanceResponse] = await Promise.all([
        fetch(`/api/predictive-analytics/${companyId}/dashboard?periods=${selectedPeriods}`),
        fetch(`/api/predictive-analytics/${companyId}/performance`)
      ]);

      if (!dashboardResponse.ok || !performanceResponse.ok) {
        throw new Error('Failed to load predictive analytics data');
      }

      const [dashboardData, performanceData] = await Promise.all([
        dashboardResponse.json(),
        performanceResponse.json()
      ]);

      setRevenueForecast(dashboardData.data.forecasts.revenue);
      setExpenseForecast(dashboardData.data.forecasts.expenses);
      setCashFlowForecast(dashboardData.data.forecasts.cashFlow);
      setChurnPredictions(dashboardData.data.predictions.churn);
      setSegments(dashboardData.data.predictions.segments);
      setAnomalies(dashboardData.data.anomalies);
      setPerformance(performanceData.data);
    } catch (error) {
      console.error('Error loading predictive analytics data:', error);
      setError('Failed to load predictive analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const trainModels = async () => {
    try {
      const response = await fetch(`/api/predictive-analytics/${companyId}/train`, {
        method: 'POST'
      });

      if (response.ok) {
        // Reload data after training
        loadPredictiveData();
      }
    } catch (error) {
      console.error('Error training models:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading predictive analytics...</span>
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
          <h1 className="text-3xl font-bold">Predictive Analytics Dashboard</h1>
          <p className="text-gray-600">AI-powered forecasting and predictive insights</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={selectedPeriods} 
            onChange={(e) => setSelectedPeriods(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
            <option value={24}>24 months</option>
          </select>
          <Button onClick={loadPredictiveData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={trainModels} variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Train Models
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-6">
          {/* Forecast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {revenueForecast && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span>Revenue Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Next Month:</span>
                      <span className="font-medium">{formatCurrency(revenueForecast.periods[0]?.value || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidence:</span>
                      <span>{formatPercentage(revenueForecast.periods[0]?.confidence || 0)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(revenueForecast.trend.direction)}
                      <span className={`text-sm ${getTrendColor(revenueForecast.trend.direction)}`}>
                        {revenueForecast.trend.direction.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Accuracy: {formatPercentage(revenueForecast.accuracy)}</p>
                      <p>Seasonality: {revenueForecast.seasonality.detected ? 'Detected' : 'None'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {expenseForecast && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span>Expense Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Next Month:</span>
                      <span className="font-medium">{formatCurrency(expenseForecast.periods[0]?.value || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidence:</span>
                      <span>{formatPercentage(expenseForecast.periods[0]?.confidence || 0)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(expenseForecast.trend.direction)}
                      <span className={`text-sm ${getTrendColor(expenseForecast.trend.direction)}`}>
                        {expenseForecast.trend.direction.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Accuracy: {formatPercentage(expenseForecast.accuracy)}</p>
                      <p>Seasonality: {expenseForecast.seasonality.detected ? 'Detected' : 'None'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {cashFlowForecast && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <span>Cash Flow Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Next Month:</span>
                      <span className="font-medium">{formatCurrency(cashFlowForecast.periods[0]?.value || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidence:</span>
                      <span>{formatPercentage(cashFlowForecast.periods[0]?.confidence || 0)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(cashFlowForecast.trend.direction)}
                      <span className={`text-sm ${getTrendColor(cashFlowForecast.trend.direction)}`}>
                        {cashFlowForecast.trend.direction.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Accuracy: {formatPercentage(cashFlowForecast.accuracy)}</p>
                      <p>Seasonality: {cashFlowForecast.seasonality.detected ? 'Detected' : 'None'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Forecast Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <LineChart className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-600">Chart visualization would go here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Forecast Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-600">Chart visualization would go here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* Churn Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Customer Churn Predictions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnPredictions.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No churn predictions available</p>
                  </div>
                ) : (
                  churnPredictions.slice(0, 10).map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium">Customer {index + 1}</span>
                          <Badge variant={prediction.prediction ? "destructive" : "outline"}>
                            {prediction.prediction ? "High Risk" : "Low Risk"}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {formatPercentage(prediction.probability || 0)} probability
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{prediction.explanation}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(prediction.probability || 0) * 100} className="w-20" />
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

          {/* Customer Segmentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Customer Segmentation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segments.map((segment, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{segment.segment}</h4>
                      <Badge variant="outline">{segment.customers} customers</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <p>Revenue: {formatCurrency(segment.revenue)}</p>
                      <p>Avg per customer: {formatCurrency(segment.revenue / segment.customers)}</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Recommendations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {segment.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Anomaly Detection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No anomalies detected</p>
                  </div>
                ) : (
                  anomalies.map((anomaly, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(anomaly.severity)} bg-opacity-10`}>
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(anomaly.severity)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{anomaly.metric}</span>
                            <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Score: {anomaly.anomalyScore.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{anomaly.description}</p>
                          <div className="text-sm">
                            <p><strong>Value:</strong> {formatCurrency(anomaly.value)}</p>
                            <p><strong>Expected:</strong> {formatCurrency(anomaly.expectedValue)}</p>
                            <p><strong>Action:</strong> {anomaly.recommendedAction}</p>
                            <p><strong>Time:</strong> {formatDate(anomaly.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {performance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Model Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Accuracy:</span>
                      <span className="font-medium">{formatPercentage(performance.overallAccuracy)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Models:</span>
                      <span className="font-medium">{performance.modelCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Training:</span>
                      <span className="text-sm text-gray-600">
                        {performance.lastTraining ? formatDate(performance.lastTraining) : 'Never'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {performance.models.map((model, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{model.model_name}</span>
                        <Badge variant="outline">{model.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button onClick={trainModels} className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Train All Models
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retrain Models
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Model Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>AI Insights & Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">AI-powered insights and recommendations would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;





