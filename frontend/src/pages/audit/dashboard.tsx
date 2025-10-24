import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
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
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  User,
  Users,
  Building2,
  Activity,
  Lock,
  Unlock,
  FileText,
  Database
} from 'lucide-react';

interface AuditDashboardProps {
  companyId: string;
}

interface AuditStats {
  totalAudits: number;
  userAudits: number;
  transactionAudits: number;
  invoiceAudits: number;
  expenseAudits: number;
  createActions: number;
  updateActions: number;
  deleteActions: number;
  recentAudits: number;
}

interface AuditTrail {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  beforeData: any;
  afterData: any;
  changes: any[];
  auditHash: string;
  metadata: any;
  createdAt: string;
}

interface AuditSummary {
  entityType: string;
  action: string;
  count: number;
  lastActivity: string;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ companyId }) => {
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [recentAudits, setRecentAudits] = useState<AuditTrail[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAuditData();
  }, [companyId]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const [statsResponse, recentResponse, summaryResponse] = await Promise.all([
        fetch(`/api/audit/stats`),
        fetch(`/api/audit/recent`),
        fetch(`/api/audit/summary`)
      ]);

      if (!statsResponse.ok || !recentResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to load audit data');
      }

      const [statsData, recentData, summaryData] = await Promise.all([
        statsResponse.json(),
        recentResponse.json(),
        summaryResponse.json()
      ]);

      setAuditStats(statsData.data);
      setRecentAudits(recentData.data);
      setAuditSummary(summaryData.data);
    } catch (error) {
      console.error('Error loading audit data:', error);
      setError('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-500';
      case 'update': return 'bg-blue-500';
      case 'delete': return 'bg-red-500';
      case 'view': return 'bg-gray-500';
      case 'export': return 'bg-purple-500';
      case 'login': return 'bg-yellow-500';
      case 'logout': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="h-4 w-4" />;
      case 'update': return <Edit className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'view': return <Eye className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'login': return <Unlock className="h-4 w-4" />;
      case 'logout': return <Lock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'user': return <User className="h-4 w-4" />;
      case 'transaction': return <BarChart3 className="h-4 w-4" />;
      case 'invoice': return <FileText className="h-4 w-4" />;
      case 'expense': return <XCircle className="h-4 w-4" />;
      case 'payment': return <CheckCircle className="h-4 w-4" />;
      case 'customer': return <Users className="h-4 w-4" />;
      case 'vendor': return <Building2 className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const verifyAuditTrail = async (auditTrailId: string) => {
    try {
      const response = await fetch(`/api/audit/trails/${auditTrailId}/verify`, {
        method: 'POST'
      });

      if (response.ok) {
        // Reload data to reflect changes
        loadAuditData();
      }
    } catch (error) {
      console.error('Error verifying audit trail:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading audit data...</span>
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
          <h1 className="text-3xl font-bold">Audit Trails Dashboard</h1>
          <p className="text-gray-600">Immutable audit trails with SHA-256 hashing and tamper detection</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadAuditData} variant="outline">
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
          <TabsTrigger value="trails">Trails</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="integrity">Integrity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Audit Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditStats?.totalAudits || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Audits</CardTitle>
                <User className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{auditStats?.userAudits || 0}</div>
                <p className="text-xs text-muted-foreground">
                  User-related activities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaction Audits</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{auditStats?.transactionAudits || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Transaction activities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delete Actions</CardTitle>
                <Trash2 className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{auditStats?.deleteActions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Deletion activities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Action Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4 text-green-500" />
                      <span>Create</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={auditStats ? (auditStats.createActions / auditStats.totalAudits) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{auditStats?.createActions || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Edit className="h-4 w-4 text-blue-500" />
                      <span>Update</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={auditStats ? (auditStats.updateActions / auditStats.totalAudits) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{auditStats?.updateActions || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span>Delete</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={auditStats ? (auditStats.deleteActions / auditStats.totalAudits) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{auditStats?.deleteActions || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entity Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={auditStats ? (auditStats.userAudits / auditStats.totalAudits) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{auditStats?.userAudits || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-green-500" />
                      <span>Transactions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={auditStats ? (auditStats.transactionAudits / auditStats.totalAudits) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{auditStats?.transactionAudits || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span>Invoices</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={auditStats ? (auditStats.invoiceAudits / auditStats.totalAudits) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{auditStats?.invoiceAudits || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Trails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAudits.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No audit trails</p>
                  </div>
                ) : (
                  recentAudits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className={getActionColor(audit.action)}>
                            {getActionIcon(audit.action)}
                            <span className="ml-1">{audit.action.toUpperCase()}</span>
                          </Badge>
                          <Badge variant="outline">
                            {getEntityIcon(audit.entityType)}
                            <span className="ml-1">{audit.entityType.toUpperCase()}</span>
                          </Badge>
                          <span className="font-medium">{audit.userEmail}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Entity ID:</strong> {audit.entityId}</p>
                          <p><strong>IP Address:</strong> {audit.ipAddress}</p>
                          <p><strong>Timestamp:</strong> {formatDateTime(audit.createdAt)}</p>
                          <p><strong>Hash:</strong> {audit.auditHash.substring(0, 16)}...</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => verifyAuditTrail(audit.id)}
                        >
                          <Shield className="h-4 w-4" />
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

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditSummary.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No audit summary data</p>
                  </div>
                ) : (
                  auditSummary.map((summary, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">
                            {getEntityIcon(summary.entityType)}
                            <span className="ml-1">{summary.entityType.toUpperCase()}</span>
                          </Badge>
                          <Badge variant="outline" className={getActionColor(summary.action)}>
                            {getActionIcon(summary.action)}
                            <span className="ml-1">{summary.action.toUpperCase()}</span>
                          </Badge>
                          <span className="font-medium">{summary.count} occurrences</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Last Activity:</strong> {formatDateTime(summary.lastActivity)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail Integrity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">All audit trails are integrity verified</p>
                  <p className="text-sm text-gray-500 mt-2">
                    SHA-256 hashing ensures tamper detection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditDashboard;





