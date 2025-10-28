'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface Anomaly {
  type: 'amount' | 'frequency' | 'pattern' | 'time' | 'fraud';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  transactionId?: string;
  customerId?: string;
  userId?: string;
  detectedAt: string;
  metadata: any;
}

interface AnomalySummary {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recent: Anomaly[];
}

interface FraudPattern {
  type: string;
  count: number;
  severity: string;
  confidence: number;
  examples: Array<{
    id: string;
    description: string;
    detectedAt: string;
    confidence: number;
  }>;
}

interface RiskScore {
  customerId: string;
  riskScore: number;
  riskLevel: string;
  anomalyCount: number;
  recentAnomalies: Anomaly[];
  recommendations: string[];
}

export default function AnomalyDetectionPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [summary, setSummary] = useState<AnomalySummary | null>(null);
  const [fraudPatterns, setFraudPatterns] = useState<FraudPattern[]>([]);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    dateRange: '30'
  });

  useEffect(() => {
    loadAnomalyData();
  }, [filters]);

  const loadAnomalyData = async () => {
    setLoading(true);
    try {
      // Load anomalies
      const anomaliesResponse = await fetch(`/api/organizations/current/anomalies?${new URLSearchParams({
        type: filters.type,
        severity: filters.severity,
        limit: '100'
      })}`);
      if (anomaliesResponse.ok) {
        const anomaliesData = await anomaliesResponse.json();
        setAnomalies(anomaliesData.data.anomalies);
      }

      // Load summary
      const summaryResponse = await fetch('/api/organizations/current/anomalies/summary');
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.data);
      }

      // Load fraud patterns
      const fraudResponse = await fetch('/api/organizations/current/fraud-patterns');
      if (fraudResponse.ok) {
        const fraudData = await fraudResponse.json();
        setFraudPatterns(fraudData.data.patterns);
      }

    } catch (error) {
      console.error('Failed to load anomaly data:', error);
      toast.error('Failed to load anomaly data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'amount': return <DollarSign className="h-4 w-4" />;
      case 'frequency': return <Clock className="h-4 w-4" />;
      case 'pattern': return <BarChart3 className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'fraud': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'amount': return 'text-blue-600';
      case 'frequency': return 'text-purple-600';
      case 'pattern': return 'text-green-600';
      case 'time': return 'text-orange-600';
      case 'fraud': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const markAsResolved = async (anomalyId: string) => {
    try {
      const response = await fetch(`/api/organizations/current/anomalies/${anomalyId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution: 'resolved',
          notes: 'Marked as resolved by user'
        })
      });

      if (response.ok) {
        toast.success('Anomaly marked as resolved');
        loadAnomalyData();
      } else {
        toast.error('Failed to mark anomaly as resolved');
      }
    } catch (error) {
      console.error('Error marking anomaly as resolved:', error);
      toast.error('Failed to mark anomaly as resolved');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-red-600" />
          <h1 className="text-3xl font-bold">Anomaly Detection</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadAnomalyData}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Patterns</TabsTrigger>
          <TabsTrigger value="risk">Risk Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading anomaly data...</span>
            </div>
          ) : summary ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.total}</div>
                    <p className="text-xs text-muted-foreground">
                      Detected in last 90 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {summary.bySeverity.critical || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Require immediate attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fraud Patterns</CardTitle>
                    <Shield className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {summary.byType.fraud || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Potential fraud detected
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {summary.recent.filter(a => a.metadata?.resolved).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Issues resolved
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Anomaly Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Anomaly Types</CardTitle>
                    <CardDescription>
                      Breakdown of detected anomaly types
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(summary.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={getTypeColor(type)}>
                              {getTypeIcon(type)}
                            </div>
                            <span className="font-medium capitalize">{type}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Severity Distribution</CardTitle>
                    <CardDescription>
                      Distribution of anomaly severity levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(summary.bySeverity).map(([severity, count]) => (
                        <div key={severity} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              severity === 'critical' ? 'bg-red-500' :
                              severity === 'high' ? 'bg-orange-500' :
                              severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <span className="font-medium capitalize">{severity}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Anomalies */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Anomalies</CardTitle>
                  <CardDescription>
                    Latest detected anomalies requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.recent.slice(0, 5).map((anomaly, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={getTypeColor(anomaly.type)}>
                            {getTypeIcon(anomaly.type)}
                          </div>
                          <div>
                            <p className="font-medium">{anomaly.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(anomaly.detectedAt)} • {formatConfidence(anomaly.confidence)} confidence
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsResolved(anomaly.transactionId || '')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                No anomaly data available. Anomaly detection requires sufficient transaction history.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Anomalies</CardTitle>
              <CardDescription>
                Complete list of detected anomalies with filtering options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="amount">Amount</option>
                    <option value="frequency">Frequency</option>
                    <option value="pattern">Pattern</option>
                    <option value="time">Time</option>
                    <option value="fraud">Fraud</option>
                  </select>
                  
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({...filters, severity: e.target.value})}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Anomalies List */}
                <div className="space-y-4">
                  {anomalies.map((anomaly, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={getTypeColor(anomaly.type)}>
                            {getTypeIcon(anomaly.type)}
                          </div>
                          <div>
                            <p className="font-medium">{anomaly.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(anomaly.detectedAt)} • {formatConfidence(anomaly.confidence)} confidence
                            </p>
                            {anomaly.metadata && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <p>Transaction ID: {anomaly.transactionId}</p>
                                {anomaly.customerId && <p>Customer ID: {anomaly.customerId}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsResolved(anomaly.transactionId || '')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Patterns</CardTitle>
              <CardDescription>
                Detected fraud patterns and suspicious activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudPatterns.map((pattern, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium capitalize">{pattern.type.replace('_', ' ')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {pattern.count} instances detected
                        </p>
                        <div className="mt-2">
                          <Badge className={getSeverityColor(pattern.severity)}>
                            {pattern.severity}
                          </Badge>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {formatConfidence(pattern.confidence)} confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {pattern.examples.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-sm">Recent Examples:</h5>
                        <div className="space-y-2 mt-2">
                          {pattern.examples.slice(0, 3).map((example, exampleIndex) => (
                            <div key={exampleIndex} className="text-sm text-muted-foreground">
                              <p>{example.description}</p>
                              <p className="text-xs">{formatDate(example.detectedAt)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Risk Scores</CardTitle>
              <CardDescription>
                Risk assessment for customers based on anomaly patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  Risk scores are calculated based on anomaly frequency, severity, and patterns. 
                  Higher scores indicate increased risk.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

