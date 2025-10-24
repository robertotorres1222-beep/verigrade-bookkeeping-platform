import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
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
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Activity
} from 'lucide-react';

interface BankFeedProcessingDashboardProps {
  companyId: string;
}

interface ProcessingStats {
  totalLogs: number;
  totalTransactions: number;
  processedTransactions: number;
  duplicateTransactions: number;
  errorTransactions: number;
  newTransactions: number;
  updatedTransactions: number;
  successRate: number;
  recentLogs: number;
}

interface ProcessingLog {
  id: string;
  totalTransactions: number;
  processedTransactions: number;
  duplicateTransactions: number;
  errorTransactions: number;
  newTransactions: number;
  updatedTransactions: number;
  processedAt: string;
}

interface BankFeedConnection {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  connectionStatus: string;
  lastSyncAt: string;
  isActive: boolean;
}

interface BankFeedRule {
  id: string;
  ruleName: string;
  ruleDescription: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

const BankFeedProcessingDashboard: React.FC<BankFeedProcessingDashboardProps> = ({ companyId }) => {
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<ProcessingLog[]>([]);
  const [connections, setConnections] = useState<BankFeedConnection[]>([]);
  const [rules, setRules] = useState<BankFeedRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadBankFeedProcessingData();
  }, [companyId]);

  const loadBankFeedProcessingData = async () => {
    try {
      setLoading(true);
      const [statsResponse, logsResponse, connectionsResponse, rulesResponse] = await Promise.all([
        fetch(`/api/bank-feed-processing/stats`),
        fetch(`/api/bank-feed-processing/logs`),
        fetch(`/api/bank-feed-processing/connections`),
        fetch(`/api/bank-feed-processing/rules`)
      ]);

      if (!statsResponse.ok || !logsResponse.ok || !connectionsResponse.ok || !rulesResponse.ok) {
        throw new Error('Failed to load bank feed processing data');
      }

      const [statsData, logsData, connectionsData, rulesData] = await Promise.all([
        statsResponse.json(),
        logsResponse.json(),
        rulesResponse.json(),
        connectionsResponse.json()
      ]);

      setProcessingStats(statsData.data);
      setRecentLogs(logsData.data);
      setConnections(connectionsData.data);
      setRules(rulesData.data);
    } catch (error) {
      console.error('Error loading bank feed processing data:', error);
      setError('Failed to load bank feed processing data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'disconnected': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const formatSuccessRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bank feed processing data...</span>
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
          <h1 className="text-3xl font-bold">Bank Feed Processing Dashboard</h1>
          <p className="text-gray-600">Automated bank feed processing with rule engine and error handling</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadBankFeedProcessingData} variant="outline">
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
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Processing Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{processingStats?.totalTransactions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatSuccessRate(processingStats?.successRate || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processing success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Transactions</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{processingStats?.newTransactions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Newly created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Transactions</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{processingStats?.errorTransactions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Failed to process
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Processing Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Processed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={processingStats ? (processingStats.processedTransactions / processingStats.totalTransactions) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{processingStats?.processedTransactions || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Errors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={processingStats ? (processingStats.errorTransactions / processingStats.totalTransactions) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{processingStats?.errorTransactions || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Duplicates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={processingStats ? (processingStats.duplicateTransactions / processingStats.totalTransactions) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{processingStats?.duplicateTransactions || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>New</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={processingStats ? (processingStats.newTransactions / processingStats.totalTransactions) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{processingStats?.newTransactions || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Updated</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={processingStats ? (processingStats.updatedTransactions / processingStats.totalTransactions) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{processingStats?.updatedTransactions || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bank Feed Connections</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bank feed connections</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Connection
                    </Button>
                  </div>
                ) : (
                  connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className={getStatusColor(connection.connectionStatus)}>
                            {getStatusIcon(connection.connectionStatus)}
                            <span className="ml-1">{connection.connectionStatus.toUpperCase()}</span>
                          </Badge>
                          <span className="font-medium">{connection.bankName}</span>
                          <span className="text-sm text-gray-600">{connection.accountNumber}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Account Type:</strong> {connection.accountType}</p>
                          <p><strong>Last Sync:</strong> {connection.lastSyncAt ? formatDateTime(connection.lastSyncAt) : 'Never'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Processing Rules</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No processing rules</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium">{rule.ruleName}</span>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            Priority: {rule.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rule.ruleDescription}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {formatDate(rule.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No processing logs</p>
                  </div>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium">Processing Log</span>
                          <Badge variant="outline">
                            {log.totalTransactions} total
                          </Badge>
                          <Badge variant="outline">
                            {log.processedTransactions} processed
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>New:</strong> {log.newTransactions} | <strong>Updated:</strong> {log.updatedTransactions}</p>
                          <p><strong>Errors:</strong> {log.errorTransactions} | <strong>Duplicates:</strong> {log.duplicateTransactions}</p>
                          <p><strong>Processed:</strong> {formatDateTime(log.processedAt)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
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
      </Tabs>
    </div>
  );
};

export default BankFeedProcessingDashboard;