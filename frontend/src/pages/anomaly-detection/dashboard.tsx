import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface AnomalyDetectionDashboardProps {
  companyId: string;
}

interface AnomalyStats {
  totalAnomalies: number;
  criticalAnomalies: number;
  highAnomalies: number;
  mediumAnomalies: number;
  lowAnomalies: number;
  financialAnomalies: number;
  vendorAnomalies: number;
  employeeAnomalies: number;
  recentAnomalies: number;
}

interface AnomalyAlert {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  timestamp: string;
}

interface AnomalyPattern {
  type: string;
  count: number;
  percentage: number;
}

const AnomalyDetectionDashboard: React.FC<AnomalyDetectionDashboardProps> = ({ companyId }) => {
  const [anomalyStats, setAnomalyStats] = useState<AnomalyStats | null>(null);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [patterns, setPatterns] = useState<AnomalyPattern[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnomalyDetectionData();
  }, [companyId]);

  const loadAnomalyDetectionData = async () => {
    try {
      setLoading(true);
      const [statsResponse, alertsResponse, patternsResponse, trendsResponse] = await Promise.all([
        fetch(`/api/anomaly-detection/stats`),
        fetch(`/api/anomaly-detection/alerts`),
        fetch(`/api/anomaly-detection/patterns`),
        fetch(`/api/anomaly-detection/trends`)
      ]);

      if (!statsResponse.ok || !alertsResponse.ok || !patternsResponse.ok || !trendsResponse.ok) {
        throw new Error('Failed to load anomaly detection data');
      }

      const [statsData, alertsData, patternsData, trendsData] = await Promise.all([
        statsResponse.json(),
        alertsResponse.json(),
        patternsResponse.json(),
        trendsResponse.json()
      ]);

      setAnomalyStats(statsData.data);
      setAlerts(alertsData.data);
      setPatterns(patternsData.data);
      setTrends(trendsData.data);
    } catch (error) {
      console.error('Error loading anomaly detection data:', error);
      setError('Failed to load anomaly detection data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading anomaly detection data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Anomaly Detection Dashboard</h1>
          <p className="text-gray-600">AI-powered anomaly detection and alerting system</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadAnomalyDetectionData} variant="outline">
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
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Anomaly Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anomalyStats?.totalAnomalies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Anomalies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{anomalyStats?.criticalAnomalies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Anomalies</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{anomalyStats?.highAnomalies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Need investigation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Anomalies</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{anomalyStats?.recentAnomalies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Anomaly Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span>Financial</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={anomalyStats ? (anomalyStats.financialAnomalies / anomalyStats.totalAnomalies) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{anomalyStats?.financialAnomalies || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <span>Vendor</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={anomalyStats ? (anomalyStats.vendorAnomalies / anomalyStats.totalAnomalies) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{anomalyStats?.vendorAnomalies || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>Employee</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={anomalyStats ? (anomalyStats.employeeAnomalies / anomalyStats.totalAnomalies) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{anomalyStats?.employeeAnomalies || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anomaly Distribution by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Critical</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={anomalyStats ? (anomalyStats.criticalAnomalies / anomalyStats.totalAnomalies) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{anomalyStats?.criticalAnomalies || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={anomalyStats ? (anomalyStats.highAnomalies / anomalyStats.totalAnomalies) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{anomalyStats?.highAnomalies || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={anomalyStats ? (anomalyStats.mediumAnomalies / anomalyStats.totalAnomalies) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{anomalyStats?.mediumAnomalies || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Low</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={anomalyStats ? (anomalyStats.lowAnomalies / anomalyStats.totalAnomalies) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{anomalyStats?.lowAnomalies || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Anomaly Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No active alerts</p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <Alert key={index} className={`border-l-4 ${
                      alert.severity === 'critical' ? 'border-l-red-500' :
                      alert.severity === 'high' ? 'border-l-orange-500' :
                      alert.severity === 'medium' ? 'border-l-yellow-500' :
                      'border-l-blue-500'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Action:</strong> {alert.action}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(alert.timestamp)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No patterns detected</p>
                  </div>
                ) : (
                  patterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{pattern.type}</p>
                          <p className="text-sm text-gray-600">{pattern.count} occurrences</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{pattern.percentage.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">of total</p>
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
              <CardTitle>Anomaly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.length === 0 ? (
                  <div className="text-center py-8">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No trend data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Week of {new Date(trend.week).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{trend.anomalies_detected} anomalies detected</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{trend.avg_anomaly_score?.toFixed(1) || 0}</p>
                          <p className="text-sm text-gray-600">avg score</p>
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

export default AnomalyDetectionDashboard;