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
  Lightbulb,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Database,
  Cpu,
  Layers,
  FileText,
  Share2,
  Bell,
  Star,
  Bookmark
} from 'lucide-react';

interface BusinessIntelligenceDashboardProps {
  companyId: string;
}

interface BIKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'on-track' | 'at-risk' | 'behind';
  category: string;
  lastUpdated: Date;
}

interface BIReport {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'dashboard' | 'report' | 'analysis';
  data: any;
  filters: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

interface BIDashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  widgets: any[];
  filters: Record<string, any>;
  refreshInterval: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BIAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  lastTriggered: Date | null;
  triggerCount: number;
  message: string;
  action: string;
}

interface BIAnalysis {
  id: string;
  name: string;
  type: 'trend' | 'comparison' | 'correlation' | 'forecast' | 'segmentation';
  data: any;
  insights: string[];
  recommendations: string[];
  confidence: number;
  methodology: string;
  createdAt: Date;
}

const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({ companyId }) => {
  const [kpis, setKpis] = useState<BIKPI[]>([]);
  const [reports, setReports] = useState<BIReport[]>([]);
  const [dashboards, setDashboards] = useState<BIDashboard[]>([]);
  const [alerts, setAlerts] = useState<BIAlert[]>([]);
  const [analyses, setAnalyses] = useState<BIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadBIData();
  }, [companyId]);

  const loadBIData = async () => {
    try {
      setLoading(true);
      const [kpisResponse, reportsResponse, dashboardsResponse, alertsResponse, analysesResponse] = await Promise.all([
        fetch(`/api/business-intelligence/${companyId}/kpis`),
        fetch(`/api/business-intelligence/${companyId}/reports`),
        fetch(`/api/business-intelligence/${companyId}/dashboards`),
        fetch(`/api/business-intelligence/${companyId}/alerts`),
        fetch(`/api/business-intelligence/${companyId}/analyses`)
      ]);

      if (!kpisResponse.ok || !reportsResponse.ok || !dashboardsResponse.ok || !alertsResponse.ok || !analysesResponse.ok) {
        throw new Error('Failed to load BI data');
      }

      const [kpisData, reportsData, dashboardsData, alertsData, analysesData] = await Promise.all([
        kpisResponse.json(),
        reportsResponse.json(),
        dashboardsResponse.json(),
        alertsResponse.json(),
        analysesResponse.json()
      ]);

      setKpis(kpisData.data);
      setReports(reportsData.data);
      setDashboards(dashboardsData.data);
      setAlerts(alertsData.data);
      setAnalyses(analysesData.data);
    } catch (error) {
      console.error('Error loading BI data:', error);
      setError('Failed to load BI data');
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
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatNumber = (value: number, unit: string) => {
    if (unit === 'USD') return formatCurrency(value);
    if (unit === '%') return `${value.toFixed(1)}%`;
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading business intelligence data...</span>
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
          <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
          <p className="text-gray-600">Advanced analytics, reporting, and insights</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadBIData} variant="outline">
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.length}</div>
                <p className="text-xs text-muted-foreground">
                  {kpis.filter(kpi => kpi.status === 'on-track').length} on track
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">
                  {reports.filter(r => r.isPublic).length} public
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboards.length}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboards.filter(d => d.isPublic).length} public
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.filter(a => a.isActive).length}</div>
                <p className="text-xs text-muted-foreground">
                  {alerts.filter(a => a.lastTriggered).length} triggered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent KPIs */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.slice(0, 6).map((kpi) => (
                  <div key={kpi.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{kpi.name}</h4>
                      {getStatusIcon(kpi.status)}
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {formatNumber(kpi.value, kpi.unit)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      {getTrendIcon(kpi.trend)}
                      <span className={getTrendColor(kpi.trend)}>
                        {formatPercentage(kpi.change)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Target: {formatNumber(kpi.target, kpi.unit)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium">{report.name}</span>
                        <Badge variant="outline">{report.category}</Badge>
                        <Badge variant="outline">{report.type}</Badge>
                        {report.isPublic && <Badge variant="outline">Public</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {formatDate(report.createdAt)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{kpi.name}</h4>
                        {getStatusIcon(kpi.status)}
                        <Badge variant="outline" className={getStatusColor(kpi.status)}>
                          {kpi.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(kpi.trend)}
                        <span className={`text-sm ${getTrendColor(kpi.trend)}`}>
                          {formatPercentage(kpi.change)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Value</p>
                        <p className="text-xl font-bold">{formatNumber(kpi.value, kpi.unit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Target</p>
                        <p className="text-xl font-bold">{formatNumber(kpi.target, kpi.unit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Progress</p>
                        <Progress value={(kpi.value / kpi.target) * 100} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="text-sm font-medium">{kpi.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Intelligence Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{report.name}</h4>
                        <Badge variant="outline">{report.category}</Badge>
                        <Badge variant="outline">{report.type}</Badge>
                        {report.isPublic && <Badge variant="outline">Public</Badge>}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {formatDate(report.createdAt)}</span>
                      <span>Updated: {formatDate(report.updatedAt)}</span>
                      <span>Tags: {report.tags.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BI Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboards.map((dashboard) => (
                  <div key={dashboard.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{dashboard.name}</h4>
                        {dashboard.isPublic && <Badge variant="outline">Public</Badge>}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{dashboard.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Widgets: {dashboard.widgets?.length || 0}</span>
                      <span>Refresh: {dashboard.refreshInterval}s</span>
                      <span>Created: {formatDate(dashboard.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BI Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{alert.name}</h4>
                        {getSeverityIcon(alert.severity)}
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {alert.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <div className="text-xs text-gray-500">
                      <p>Condition: {alert.condition}</p>
                      <p>Threshold: {alert.threshold} {alert.operator}</p>
                      <p>Triggers: {alert.triggerCount}</p>
                      {alert.lastTriggered && (
                        <p>Last triggered: {formatDate(alert.lastTriggered)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BI Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{analysis.name}</h4>
                        <Badge variant="outline">{analysis.type}</Badge>
                        <span className="text-sm text-gray-600">
                          Confidence: {(analysis.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <p>Methodology: {analysis.methodology}</p>
                    </div>
                    {analysis.insights.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">Insights:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {analysis.insights.map((insight, index) => (
                            <li key={index}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Recommendations:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {formatDate(analysis.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligenceDashboard;








