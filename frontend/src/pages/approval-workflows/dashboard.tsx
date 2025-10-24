import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
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
  Activity
} from 'lucide-react';

interface ApprovalWorkflowsDashboardProps {
  companyId: string;
}

interface RequestStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  invoiceRequests: number;
  expenseRequests: number;
  paymentRequests: number;
  recentRequests: number;
}

interface ApprovalRequest {
  id: string;
  requestType: string;
  status: string;
  priority: string;
  currentStep: number;
  totalSteps: number;
  dueDate?: string;
  requestorId: string;
  createdAt: string;
  completedAt?: string;
  workflow: {
    id: string;
    workflowName: string;
    workflowType: string;
  };
  steps: ApprovalStep[];
}

interface ApprovalStep {
  id: string;
  stepNumber: number;
  stepName: string;
  approverId: string;
  approverType: string;
  status: string;
  dueDate?: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvalNotes?: string;
  rejectionReason?: string;
}

interface PendingApproval {
  id: string;
  stepName: string;
  approverId: string;
  approverType: string;
  dueDate?: string;
  request: ApprovalRequest;
}

const ApprovalWorkflowsDashboard: React.FC<ApprovalWorkflowsDashboardProps> = ({ companyId }) => {
  const [requestStats, setRequestStats] = useState<RequestStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<ApprovalRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadApprovalData();
  }, [companyId]);

  const loadApprovalData = async () => {
    try {
      setLoading(true);
      const [statsResponse, recentResponse, pendingResponse] = await Promise.all([
        fetch(`/api/approval-workflows/stats`),
        fetch(`/api/approval-workflows/recent`),
        fetch(`/api/approval-workflows/pending`)
      ]);

      if (!statsResponse.ok || !recentResponse.ok || !pendingResponse.ok) {
        throw new Error('Failed to load approval data');
      }

      const [statsData, recentData, pendingData] = await Promise.all([
        statsResponse.json(),
        recentResponse.json(),
        pendingResponse.json()
      ]);

      setRequestStats(statsData.data);
      setRecentRequests(recentData.data);
      setPendingApprovals(pendingData.data);
    } catch (error) {
      console.error('Error loading approval data:', error);
      setError('Failed to load approval data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getApproverIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />;
      case 'role': return <Users className="h-4 w-4" />;
      case 'department': return <Building2 className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const approveStep = async (stepId: string) => {
    try {
      const response = await fetch(`/api/approval-workflows/steps/${stepId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedBy: 'current-user-id', // This would come from auth context
          approvalNotes: 'Approved via dashboard'
        })
      });

      if (response.ok) {
        // Reload data to reflect changes
        loadApprovalData();
      }
    } catch (error) {
      console.error('Error approving step:', error);
    }
  };

  const rejectStep = async (stepId: string) => {
    try {
      const response = await fetch(`/api/approval-workflows/steps/${stepId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectedBy: 'current-user-id', // This would come from auth context
          rejectionReason: 'Rejected via dashboard'
        })
      });

      if (response.ok) {
        // Reload data to reflect changes
        loadApprovalData();
      }
    } catch (error) {
      console.error('Error rejecting step:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading approval data...</span>
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
          <h1 className="text-3xl font-bold">Approval Workflows Dashboard</h1>
          <p className="text-gray-600">Multi-step approval workflows with escalation rules</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadApprovalData} variant="outline">
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
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Request Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requestStats?.totalRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{requestStats?.pendingRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{requestStats?.approvedRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{requestStats?.rejectedRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Rejected requests
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Request Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span>Invoices</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={requestStats ? (requestStats.invoiceRequests / requestStats.totalRequests) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{requestStats?.invoiceRequests || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Expenses</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={requestStats ? (requestStats.expenseRequests / requestStats.totalRequests) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{requestStats?.expenseRequests || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Payments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={requestStats ? (requestStats.paymentRequests / requestStats.totalRequests) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{requestStats?.paymentRequests || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={requestStats ? (requestStats.pendingRequests / requestStats.totalRequests) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{requestStats?.pendingRequests || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Approved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={requestStats ? (requestStats.approvedRequests / requestStats.totalRequests) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{requestStats?.approvedRequests || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Rejected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={requestStats ? (requestStats.rejectedRequests / requestStats.totalRequests) * 100 : 0} className="w-20" />
                      <span className="text-sm font-medium">{requestStats?.rejectedRequests || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent requests</p>
                  </div>
                ) : (
                  recentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status.toUpperCase()}</span>
                          </Badge>
                          <span className="font-medium">{request.workflow.workflowName}</span>
                          <Badge variant="outline" className={getPriorityColor(request.priority)}>
                            {request.priority.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-600">{request.requestType}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Progress:</strong> {request.currentStep}/{request.totalSteps} steps</p>
                          <p><strong>Created:</strong> {formatDateTime(request.createdAt)}</p>
                          {request.dueDate && <p><strong>Due:</strong> {formatDate(request.dueDate)}</p>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No pending approvals</p>
                  </div>
                ) : (
                  pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium">{approval.stepName}</span>
                          <Badge variant="outline">
                            {getApproverIcon(approval.approverType)}
                            <span className="ml-1">{approval.approverType.toUpperCase()}</span>
                          </Badge>
                          <span className="text-sm text-gray-600">{approval.request.workflow.workflowName}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Request Type:</strong> {approval.request.requestType}</p>
                          <p><strong>Priority:</strong> {approval.request.priority}</p>
                          {approval.dueDate && <p><strong>Due:</strong> {formatDate(approval.dueDate)}</p>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => approveStep(approval.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => rejectStep(approval.id)}
                        >
                          <XCircle className="h-4 w-4" />
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

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Approval Workflows</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Workflow
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No workflows configured</p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Workflow
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalWorkflowsDashboard;