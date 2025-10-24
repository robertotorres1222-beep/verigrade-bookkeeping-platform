'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Settings,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
  User,
  Database,
  Webhook
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowTrigger {
  id: string;
  type: 'transaction_created' | 'invoice_sent' | 'payment_received' | 'due_date_approaching' | 'user_registered' | 'custom';
  name: string;
  description: string;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  isActive: boolean;
}

interface WorkflowAction {
  id: string;
  type: 'send_email' | 'create_task' | 'update_status' | 'webhook_call' | 'send_sms' | 'create_invoice' | 'assign_user';
  name: string;
  description: string;
  config: Record<string, any>;
  isActive: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
    logic: 'AND' | 'OR';
  }>;
  isActive: boolean;
  lastRun?: string;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  error?: string;
  actions: Array<{
    id: string;
    type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [activeTab, setActiveTab] = useState('workflows');

  const triggerTypes = [
    {
      value: 'transaction_created',
      label: 'Transaction Created',
      icon: DollarSign,
      description: 'When a new transaction is created'
    },
    {
      value: 'invoice_sent',
      label: 'Invoice Sent',
      icon: FileText,
      description: 'When an invoice is sent to a client'
    },
    {
      value: 'payment_received',
      label: 'Payment Received',
      icon: CheckCircle,
      description: 'When a payment is received'
    },
    {
      value: 'due_date_approaching',
      label: 'Due Date Approaching',
      icon: Clock,
      description: 'When an invoice due date is approaching'
    },
    {
      value: 'user_registered',
      label: 'User Registered',
      icon: User,
      description: 'When a new user registers'
    },
    {
      value: 'custom',
      label: 'Custom Trigger',
      icon: Zap,
      description: 'Custom trigger based on conditions'
    }
  ];

  const actionTypes = [
    {
      value: 'send_email',
      label: 'Send Email',
      icon: Mail,
      description: 'Send an email notification'
    },
    {
      value: 'create_task',
      label: 'Create Task',
      icon: CheckCircle,
      description: 'Create a new task'
    },
    {
      value: 'update_status',
      label: 'Update Status',
      icon: Settings,
      description: 'Update record status'
    },
    {
      value: 'webhook_call',
      label: 'Webhook Call',
      icon: Webhook,
      description: 'Call external webhook'
    },
    {
      value: 'send_sms',
      label: 'Send SMS',
      icon: MessageSquare,
      description: 'Send SMS notification'
    },
    {
      value: 'create_invoice',
      label: 'Create Invoice',
      icon: FileText,
      description: 'Create new invoice'
    },
    {
      value: 'assign_user',
      label: 'Assign User',
      icon: User,
      description: 'Assign to specific user'
    }
  ];

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: {
      type: 'transaction_created' as string,
      conditions: []
    },
    actions: [] as Array<{
      type: string;
      config: Record<string, any>;
    }>,
    conditions: [] as Array<{
      field: string;
      operator: string;
      value: any;
      logic: 'AND' | 'OR';
    }>
  });

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.data.workflows || []);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    try {
      const response = await fetch('/api/workflows/executions');
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.data.executions || []);
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (!newWorkflow.trigger.type) {
      toast.error('Please select a trigger');
      return;
    }

    if (newWorkflow.actions.length === 0) {
      toast.error('Please add at least one action');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflow)
      });

      if (response.ok) {
        toast.success('Workflow created successfully');
        setNewWorkflow({
          name: '',
          description: '',
          trigger: { type: 'transaction_created', conditions: [] },
          actions: [],
          conditions: []
        });
        setShowCreateWorkflow(false);
        await loadWorkflows();
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      toast.error('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (workflowId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        toast.success(`Workflow ${isActive ? 'disabled' : 'enabled'}`);
        await loadWorkflows();
      } else {
        throw new Error('Failed to toggle workflow');
      }
    } catch (error) {
      toast.error('Failed to toggle workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Workflow deleted successfully');
        await loadWorkflows();
      } else {
        throw new Error('Failed to delete workflow');
      }
    } catch (error) {
      toast.error('Failed to delete workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleRunWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Workflow execution started');
        await loadExecutions();
      } else {
        throw new Error('Failed to run workflow');
      }
    } catch (error) {
      toast.error('Failed to run workflow');
    } finally {
      setLoading(false);
    }
  };

  const addAction = () => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'send_email', config: {} }]
    }));
  };

  const updateAction = (index: number, updates: any) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      )
    }));
  };

  const removeAction = (index: number) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const getTriggerIcon = (type: string) => {
    const trigger = triggerTypes.find(t => t.value === type);
    return trigger ? trigger.icon : Zap;
  };

  const getActionIcon = (type: string) => {
    const action = actionTypes.find(a => a.value === type);
    return action ? action.icon : Settings;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Workflow className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadWorkflows}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateWorkflow(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading workflows...</span>
            </div>
          ) : workflows.length === 0 ? (
            <Alert>
              <Workflow className="h-4 w-4" />
              <AlertDescription>
                No workflows found. Create your first workflow to automate your business processes.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingWorkflow(workflow)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {workflow.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Trigger */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Trigger</Label>
                      <div className="flex items-center space-x-2">
                        {React.createElement(getTriggerIcon(workflow.trigger.type), { className: "h-4 w-4" })}
                        <span className="text-sm">{workflow.trigger.name}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Actions ({workflow.actions.length})</Label>
                      <div className="space-y-1">
                        {workflow.actions.slice(0, 2).map((action, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {React.createElement(getActionIcon(action.type), { className: "h-4 w-4" })}
                            <span className="text-sm">{action.name}</span>
                          </div>
                        ))}
                        {workflow.actions.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{workflow.actions.length - 2} more actions
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Runs: {workflow.runCount}</span>
                      <span>
                        {workflow.lastRun ? 
                          new Date(workflow.lastRun).toLocaleDateString() : 
                          'Never'
                        }
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRunWorkflow(workflow.id)}
                        disabled={!workflow.isActive}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleWorkflow(workflow.id, workflow.isActive)}
                        className="flex-1"
                      >
                        {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Executions</CardTitle>
              <CardDescription>
                Monitor the execution history of your workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    No workflow executions found. Run a workflow to see execution history.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <div key={execution.id} className="border rounded p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(execution.status)}
                          <div>
                            <p className="font-medium">Execution {execution.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Started {new Date(execution.startedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </div>

                      {execution.actions.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Actions</Label>
                          <div className="space-y-1">
                            {execution.actions.map((action, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{action.type}</span>
                                <Badge className={getStatusColor(action.status)}>
                                  {action.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {execution.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {execution.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>
                Pre-built workflow templates to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">Invoice Reminder</h3>
                        <p className="text-sm text-muted-foreground">
                          Automatically send reminder emails for overdue invoices
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-medium">New Client Onboarding</h3>
                        <p className="text-sm text-muted-foreground">
                          Automate the onboarding process for new clients
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-8 w-8 text-yellow-600" />
                      <div>
                        <h3 className="font-medium">Payment Received</h3>
                        <p className="text-sm text-muted-foreground">
                          Automatically update records when payments are received
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-medium">Monthly Reports</h3>
                        <p className="text-sm text-muted-foreground">
                          Automatically generate and send monthly reports
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Workflow Modal */}
      {showCreateWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Workflow</CardTitle>
              <CardDescription>
                Build an automated workflow to streamline your business processes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workflow name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workflow-description">Description</Label>
                  <textarea
                    id="workflow-description"
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this workflow does"
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
              </div>

              {/* Trigger Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Trigger</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {triggerTypes.map(trigger => (
                    <Card
                      key={trigger.value}
                      className={`cursor-pointer ${
                        newWorkflow.trigger.type === trigger.value ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setNewWorkflow(prev => ({
                        ...prev,
                        trigger: { ...prev.trigger, type: trigger.value }
                      }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {React.createElement(trigger.icon, { className: "h-6 w-6" })}
                          <div>
                            <h3 className="font-medium">{trigger.label}</h3>
                            <p className="text-sm text-muted-foreground">{trigger.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Actions</Label>
                  <Button size="sm" onClick={addAction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>

                {newWorkflow.actions.length === 0 ? (
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      No actions added yet. Add at least one action to complete the workflow.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {newWorkflow.actions.map((action, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {React.createElement(getActionIcon(action.type), { className: "h-5 w-5" })}
                              <span className="font-medium">Action {index + 1}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeAction(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Action Type</Label>
                              <select
                                value={action.type}
                                onChange={(e) => updateAction(index, { type: e.target.value, config: {} })}
                                className="w-full p-2 border rounded"
                              >
                                {actionTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {action.type === 'send_email' && (
                              <div className="space-y-2">
                                <Label>Email Template</Label>
                                <Input
                                  placeholder="Enter email template"
                                  value={action.config.template || ''}
                                  onChange={(e) => updateAction(index, {
                                    config: { ...action.config, template: e.target.value }
                                  })}
                                />
                              </div>
                            )}

                            {action.type === 'webhook_call' && (
                              <div className="space-y-2">
                                <Label>Webhook URL</Label>
                                <Input
                                  placeholder="Enter webhook URL"
                                  value={action.config.url || ''}
                                  onChange={(e) => updateAction(index, {
                                    config: { ...action.config, url: e.target.value }
                                  })}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Save/Cancel */}
              <div className="flex space-x-2">
                <Button onClick={handleCreateWorkflow} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Workflow'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateWorkflow(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}