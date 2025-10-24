import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Grid,
  Divider,
  LinearProgress,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  AccountTree,
  PlayArrow,
  Pause,
  Stop,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  Settings,
  FilterList,
  Download,
  Upload,
  Timeline,
  Schedule,
  Rule,
  ExpandMore,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
import { format, differenceInDays, differenceInHours } from 'date-fns';

interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'approval' | 'notification' | 'automation' | 'escalation';
  isActive: boolean;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStep {
  id: string;
  type: 'approval' | 'notification' | 'action' | 'condition' | 'delay';
  name: string;
  description: string;
  order: number;
  config: any;
  isRequired: boolean;
  timeout?: number; // in hours
  escalation?: WorkflowEscalation;
}

interface WorkflowTrigger {
  id: string;
  type: 'event' | 'schedule' | 'condition';
  eventType?: string;
  schedule?: string; // cron expression
  conditions?: WorkflowCondition[];
  isActive: boolean;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface WorkflowEscalation {
  type: 'email' | 'sms' | 'slack' | 'escalate';
  recipients: string[];
  message: string;
  delay: number; // in hours
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  entityId: string; // ID of the entity being processed
  entityType: string; // Type of entity (invoice, expense, etc.)
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled' | 'escalated';
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  assignedTo?: string;
  comments: WorkflowComment[];
  history: WorkflowHistory[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: Date;
}

interface WorkflowHistory {
  id: string;
  stepId: string;
  stepName: string;
  action: 'started' | 'completed' | 'rejected' | 'escalated' | 'skipped';
  userId: string;
  userName: string;
  timestamp: Date;
  comment?: string;
}

interface WorkflowAction {
  id: string;
  type: 'approve' | 'reject' | 'comment' | 'escalate' | 'skip';
  userId: string;
  comment?: string;
  timestamp: Date;
}

interface WorkflowStats {
  totalInstances: number;
  completed: number;
  pending: number;
  rejected: number;
  escalated: number;
  averageCompletionTime: number; // in hours
  successRate: number;
}

interface WorkflowManagerProps {
  workflows: Workflow[];
  instances: WorkflowInstance[];
  onWorkflowCreate: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onWorkflowUpdate: (id: string, updates: Partial<Workflow>) => void;
  onWorkflowDelete: (id: string) => void;
  onWorkflowStart: (workflowId: string, entityId: string, entityType: string, assignedTo?: string) => void;
  onWorkflowAction: (instanceId: string, action: WorkflowAction) => void;
  onWorkflowCancel: (instanceId: string, userId: string, reason?: string) => void;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  workflows,
  instances,
  onWorkflowCreate,
  onWorkflowUpdate,
  onWorkflowDelete,
  onWorkflowStart,
  onWorkflowAction,
  onWorkflowCancel,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showInstanceDialog, setShowInstanceDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  // Form state
  const [workflowData, setWorkflowData] = useState({
    name: '',
    description: '',
    type: 'approval' as Workflow['type'],
    isActive: true,
    steps: [] as WorkflowStep[],
    triggers: [] as WorkflowTrigger[],
    conditions: [] as WorkflowCondition[],
  });

  const [actionData, setActionData] = useState({
    type: 'approve' as WorkflowAction['type'],
    comment: '',
  });

  // Handle workflow creation/update
  const handleWorkflowSubmit = () => {
    if (!workflowData.name || !workflowData.description) {
      setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
      return;
    }

    if (editingWorkflow) {
      onWorkflowUpdate(editingWorkflow.id, workflowData);
      setSnackbar({ open: true, message: 'Workflow updated successfully', severity: 'success' });
    } else {
      onWorkflowCreate(workflowData);
      setSnackbar({ open: true, message: 'Workflow created successfully', severity: 'success' });
    }

    setShowWorkflowDialog(false);
    setEditingWorkflow(null);
    setWorkflowData({
      name: '',
      description: '',
      type: 'approval',
      isActive: true,
      steps: [],
      triggers: [],
      conditions: [],
    });
  };

  // Handle workflow edit
  const handleWorkflowEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setWorkflowData({
      name: workflow.name,
      description: workflow.description,
      type: workflow.type,
      isActive: workflow.isActive,
      steps: workflow.steps,
      triggers: workflow.triggers,
      conditions: workflow.conditions,
    });
    setShowWorkflowDialog(true);
  };

  // Handle workflow delete
  const handleWorkflowDelete = (workflow: Workflow) => {
    if (window.confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      onWorkflowDelete(workflow.id);
      setSnackbar({ open: true, message: 'Workflow deleted successfully', severity: 'success' });
    }
  };

  // Handle workflow start
  const handleWorkflowStart = (workflow: Workflow) => {
    onWorkflowStart(workflow.id, 'entity_123', 'invoice', 'user_123');
    setSnackbar({ open: true, message: 'Workflow started successfully', severity: 'success' });
  };

  // Handle workflow action
  const handleWorkflowAction = () => {
    if (!selectedInstance || !actionData.type) {
      setSnackbar({ open: true, message: 'Please select an action', severity: 'warning' });
      return;
    }

    const action: WorkflowAction = {
      id: `action_${Date.now()}`,
      type: actionData.type,
      userId: 'user_123',
      comment: actionData.comment,
      timestamp: new Date(),
    };

    onWorkflowAction(selectedInstance.id, action);
    setSnackbar({ open: true, message: 'Action processed successfully', severity: 'success' });
    setShowActionDialog(false);
    setActionData({ type: 'approve', comment: '' });
  };

  // Handle workflow cancel
  const handleWorkflowCancel = (instance: WorkflowInstance) => {
    if (window.confirm('Are you sure you want to cancel this workflow?')) {
      onWorkflowCancel(instance.id, 'user_123', 'Workflow cancelled by user');
      setSnackbar({ open: true, message: 'Workflow cancelled successfully', severity: 'success' });
    }
  };

  // Get status color
  const getStatusColor = (status: WorkflowInstance['status']): string => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'in_progress': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'cancelled': return '#757575';
      case 'escalated': return '#9c27b0';
      default: return '#757575';
    }
  };

  // Get status icon
  const getStatusIcon = (status: WorkflowInstance['status']) => {
    switch (status) {
      case 'pending': return <Schedule color="warning" />;
      case 'in_progress': return <PlayArrow color="primary" />;
      case 'completed': return <CheckCircle color="success" />;
      case 'rejected': return <Error color="error" />;
      case 'cancelled': return <Stop color="action" />;
      case 'escalated': return <Warning color="error" />;
      default: return <Schedule />;
    }
  };

  // Get workflow type color
  const getWorkflowTypeColor = (type: Workflow['type']): string => {
    switch (type) {
      case 'approval': return '#2196f3';
      case 'notification': return '#4caf50';
      case 'automation': return '#ff9800';
      case 'escalation': return '#f44336';
      default: return '#757575';
    }
  };

  // Get workflow statistics
  const getWorkflowStats = (workflowId: string): WorkflowStats => {
    const workflowInstances = instances.filter(i => i.workflowId === workflowId);
    
    const stats: WorkflowStats = {
      totalInstances: workflowInstances.length,
      completed: workflowInstances.filter(i => i.status === 'completed').length,
      pending: workflowInstances.filter(i => i.status === 'pending' || i.status === 'in_progress').length,
      rejected: workflowInstances.filter(i => i.status === 'rejected').length,
      escalated: workflowInstances.filter(i => i.status === 'escalated').length,
      averageCompletionTime: 0,
      successRate: 0,
    };

    // Calculate average completion time
    const completedInstances = workflowInstances.filter(i => i.status === 'completed' && i.completedAt);
    if (completedInstances.length > 0) {
      const totalTime = completedInstances.reduce((sum, instance) => {
        return sum + (instance.completedAt!.getTime() - instance.startedAt.getTime());
      }, 0);
      stats.averageCompletionTime = totalTime / completedInstances.length / (1000 * 60 * 60); // Convert to hours
    }

    // Calculate success rate
    if (stats.totalInstances > 0) {
      stats.successRate = (stats.completed / stats.totalInstances) * 100;
    }

    return stats;
  };

  // Filter instances by status
  const getFilteredInstances = (status?: WorkflowInstance['status']) => {
    if (!status) return instances;
    return instances.filter(instance => instance.status === status);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Workflow Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' })}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowWorkflowDialog(true)}
          >
            Create Workflow
          </Button>
        </Box>
      </Box>

      {/* Workflow Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {workflows.map((workflow) => {
          const stats = getWorkflowStats(workflow.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={workflow.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountTree color="primary" />
                      <Typography variant="h6">
                        {workflow.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={workflow.type}
                      size="small"
                      sx={{ bgcolor: getWorkflowTypeColor(workflow.type), color: 'white' }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {workflow.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Instances: {stats.totalInstances}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate: {stats.successRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Completion: {stats.averageCompletionTime.toFixed(1)}h
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleWorkflowStart(workflow)}
                    >
                      Start
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleWorkflowEdit(workflow)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleWorkflowDelete(workflow)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Instances" />
            <Tab label="Pending" />
            <Tab label="In Progress" />
            <Tab label="Completed" />
            <Tab label="Rejected" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Instances Tab */}
          {activeTab < 5 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Workflow</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Current Step</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredInstances(
                    activeTab === 0 ? undefined : 
                    activeTab === 1 ? 'pending' : 
                    activeTab === 2 ? 'in_progress' : 
                    activeTab === 3 ? 'completed' : 'rejected'
                  ).map((instance) => {
                    const workflow = workflows.find(w => w.id === instance.workflowId);
                    const currentStep = workflow?.steps[instance.currentStep];
                    return (
                      <TableRow key={instance.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {workflow?.name || 'Unknown Workflow'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {workflow?.type || 'Unknown Type'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {instance.entityType} - {instance.entityId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(instance.status)}
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {instance.status.replace('_', ' ')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {currentStep?.name || 'Unknown Step'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {instance.assignedTo || 'Unassigned'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(instance.startedAt, 'MMM dd, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => {
                                setSelectedInstance(instance);
                                setShowInstanceDialog(true);
                              }}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {instance.status === 'pending' || instance.status === 'in_progress' ? (
                              <Tooltip title="Take Action">
                                <IconButton size="small" onClick={() => {
                                  setSelectedInstance(instance);
                                  setShowActionDialog(true);
                                }}>
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            <Tooltip title="Cancel">
                              <IconButton size="small" onClick={() => handleWorkflowCancel(instance)} color="error">
                                <Stop fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Card>

      {/* Workflow Dialog */}
      <Dialog
        open={showWorkflowDialog}
        onClose={() => setShowWorkflowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Workflow Name"
              value={workflowData.name}
              onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={workflowData.description}
              onChange={(e) => setWorkflowData({ ...workflowData, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={workflowData.type}
                onChange={(e) => setWorkflowData({ ...workflowData, type: e.target.value as Workflow['type'] })}
              >
                <MenuItem value="approval">Approval</MenuItem>
                <MenuItem value="notification">Notification</MenuItem>
                <MenuItem value="automation">Automation</MenuItem>
                <MenuItem value="escalation">Escalation</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={workflowData.isActive}
                  onChange={(e) => setWorkflowData({ ...workflowData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWorkflowDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleWorkflowSubmit} variant="contained">
            {editingWorkflow ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instance Dialog */}
      <Dialog
        open={showInstanceDialog}
        onClose={() => setShowInstanceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Workflow Instance Details
        </DialogTitle>
        <DialogContent>
          {selectedInstance && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Workflow
                </Typography>
                <Typography variant="body1">
                  {workflows.find(w => w.id === selectedInstance.workflowId)?.name || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(selectedInstance.status)}
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedInstance.status.replace('_', ' ')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Entity
                </Typography>
                <Typography variant="body1">
                  {selectedInstance.entityType} - {selectedInstance.entityId}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Started
                </Typography>
                <Typography variant="body1">
                  {format(selectedInstance.startedAt, 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              History
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {selectedInstance.history.map((entry, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>{entry.stepName}</strong> - {entry.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.userName} • {format(entry.timestamp, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                  {entry.comment && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {entry.comment}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowInstanceDialog(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Action Dialog */}
    <Dialog
      open={showActionDialog}
      onClose={() => setShowActionDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Take Action
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={actionData.type}
              onChange={(e) => setActionData({ ...actionData, type: e.target.value as WorkflowAction['type'] })}
            >
              <MenuItem value="approve">Approve</MenuItem>
              <MenuItem value="reject">Reject</MenuItem>
              <MenuItem value="comment">Comment</MenuItem>
              <MenuItem value="escalate">Escalate</MenuItem>
              <MenuItem value="skip">Skip</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Comment"
            value={actionData.comment}
            onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowActionDialog(false)}>
          Cancel
        </Button>
        <Button onClick={handleWorkflowAction} variant="contained">
          Submit Action
        </Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Box>
);
};

export default WorkflowManager;






