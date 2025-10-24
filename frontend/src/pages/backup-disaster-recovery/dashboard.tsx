import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Monitor as MonitorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Restore as RestoreIcon,
  Test as TestIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';

interface BackupStrategy {
  id: string;
  name: string;
  type: 'scheduled' | 'continuous' | 'on-demand' | 'incremental' | 'full';
  schedule: string;
  retentionDays: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  config: any;
  status: 'active' | 'inactive' | 'error' | 'paused';
  lastBackup: string;
  nextBackup: string;
  createdAt: string;
  updatedAt: string;
}

interface DisasterRecoveryPlan {
  id: string;
  name: string;
  description: string;
  rto: number;
  rpo: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  components: any[];
  procedures: any[];
  contacts: any[];
  status: 'active' | 'inactive' | 'testing' | 'failed';
  lastTested: string;
  nextTest: string;
  createdAt: string;
  updatedAt: string;
}

interface HighAvailabilityConfig {
  id: string;
  name: string;
  type: 'active-passive' | 'active-active' | 'multi-master';
  primaryRegion: string;
  secondaryRegions: string[];
  failoverMode: 'automatic' | 'manual' | 'scheduled';
  healthChecks: any[];
  status: 'active' | 'inactive' | 'error' | 'failover';
  lastFailover: string;
  createdAt: string;
  updatedAt: string;
}

const BackupDisasterRecoveryDashboard: React.FC = () => {
  const [backupStrategies, setBackupStrategies] = useState<BackupStrategy[]>([]);
  const [disasterRecoveryPlans, setDisasterRecoveryPlans] = useState<DisasterRecoveryPlan[]>([]);
  const [highAvailabilityConfigs, setHighAvailabilityConfigs] = useState<HighAvailabilityConfig[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<BackupStrategy | null>(null);
  const [isCreateStrategyDialogOpen, setIsCreateStrategyDialogOpen] = useState(false);
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [isCreateHADialogOpen, setIsCreateHADialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    type: 'scheduled',
    schedule: '0 2 * * *',
    retentionDays: 30,
    encryptionEnabled: true,
    compressionEnabled: true
  });
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    rto: 60,
    rpo: 15,
    priority: 'high'
  });
  const [newHA, setNewHA] = useState({
    name: '',
    type: 'active-passive',
    primaryRegion: '',
    failoverMode: 'automatic'
  });

  const strategyTypes = [
    { value: 'scheduled', label: 'Scheduled Backup' },
    { value: 'continuous', label: 'Continuous Backup' },
    { value: 'on-demand', label: 'On-Demand Backup' },
    { value: 'incremental', label: 'Incremental Backup' },
    { value: 'full', label: 'Full Backup' }
  ];

  const planPriorities = [
    { value: 'critical', label: 'Critical', color: 'error' },
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'medium', label: 'Medium', color: 'info' },
    { value: 'low', label: 'Low', color: 'success' }
  ];

  const haTypes = [
    { value: 'active-passive', label: 'Active-Passive' },
    { value: 'active-active', label: 'Active-Active' },
    { value: 'multi-master', label: 'Multi-Master' }
  ];

  useEffect(() => {
    fetchBackupStrategies();
    fetchDisasterRecoveryPlans();
    fetchHighAvailabilityConfigs();
  }, []);

  const fetchBackupStrategies = async () => {
    try {
      const response = await fetch('/api/backup-disaster-recovery/companies/1/backup-strategies');
      const data = await response.json();
      if (data.success) {
        setBackupStrategies(data.data);
      }
    } catch (error) {
      console.error('Error fetching backup strategies:', error);
    }
  };

  const fetchDisasterRecoveryPlans = async () => {
    try {
      const response = await fetch('/api/backup-disaster-recovery/companies/1/disaster-recovery-plans');
      const data = await response.json();
      if (data.success) {
        setDisasterRecoveryPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching disaster recovery plans:', error);
    }
  };

  const fetchHighAvailabilityConfigs = async () => {
    try {
      const response = await fetch('/api/backup-disaster-recovery/companies/1/high-availability');
      const data = await response.json();
      if (data.success) {
        setHighAvailabilityConfigs(data.data);
      }
    } catch (error) {
      console.error('Error fetching high availability configs:', error);
    }
  };

  const handleCreateStrategy = async () => {
    try {
      const response = await fetch('/api/backup-disaster-recovery/companies/1/backup-strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStrategy)
      });
      
      if (response.ok) {
        fetchBackupStrategies();
        setIsCreateStrategyDialogOpen(false);
        setNewStrategy({
          name: '',
          type: 'scheduled',
          schedule: '0 2 * * *',
          retentionDays: 30,
          encryptionEnabled: true,
          compressionEnabled: true
        });
      }
    } catch (error) {
      console.error('Error creating backup strategy:', error);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const response = await fetch('/api/backup-disaster-recovery/companies/1/disaster-recovery-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan)
      });
      
      if (response.ok) {
        fetchDisasterRecoveryPlans();
        setIsCreatePlanDialogOpen(false);
        setNewPlan({ name: '', description: '', rto: 60, rpo: 15, priority: 'high' });
      }
    } catch (error) {
      console.error('Error creating disaster recovery plan:', error);
    }
  };

  const handleCreateHA = async () => {
    try {
      const response = await fetch('/api/backup-disaster-recovery/companies/1/high-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHA)
      });
      
      if (response.ok) {
        fetchHighAvailabilityConfigs();
        setIsCreateHADialogOpen(false);
        setNewHA({ name: '', type: 'active-passive', primaryRegion: '', failoverMode: 'automatic' });
      }
    } catch (error) {
      console.error('Error creating high availability config:', error);
    }
  };

  const handleStartBackup = async (strategyId: string) => {
    try {
      const response = await fetch(`/api/backup-disaster-recovery/backup-strategies/${strategyId}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full' })
      });
      
      if (response.ok) {
        fetchBackupStrategies();
      }
    } catch (error) {
      console.error('Error starting backup:', error);
    }
  };

  const handleTestDRPlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/backup-disaster-recovery/disaster-recovery-plans/${planId}/test`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchDisasterRecoveryPlans();
      }
    } catch (error) {
      console.error('Error testing DR plan:', error);
    }
  };

  const handleExecuteFailover = async (configId: string, targetRegion: string) => {
    try {
      const response = await fetch(`/api/backup-disaster-recovery/high-availability/${configId}/failover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRegion })
      });
      
      if (response.ok) {
        fetchHighAvailabilityConfigs();
      }
    } catch (error) {
      console.error('Error executing failover:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'running':
      case 'testing':
        return <InfoIcon color="info" />;
      case 'paused':
      case 'inactive':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'success';
      case 'error':
      case 'failed':
        return 'error';
      case 'running':
      case 'testing':
        return 'info';
      case 'paused':
      case 'inactive':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Backup & Disaster Recovery
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage backup strategies, disaster recovery plans, and high availability configurations
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Backup Strategies" />
        <Tab label="Disaster Recovery" />
        <Tab label="High Availability" />
        <Tab label="Recovery Points" />
        <Tab label="Monitoring" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Backup Strategies</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateStrategyDialogOpen(true)}
              >
                Create Strategy
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {backupStrategies.map((strategy) => (
                <Grid item xs={12} sm={6} md={4} key={strategy.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedStrategy?.id === strategy.id ? 2 : 1,
                      borderColor: selectedStrategy?.id === strategy.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{strategy.name}</Typography>
                        {getStatusIcon(strategy.status)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {strategyTypes.find(t => t.value === strategy.type)?.label}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={strategy.status} 
                          size="small" 
                          color={getStatusColor(strategy.status) as any}
                          variant="outlined"
                        />
                        <Chip 
                          label={`${strategy.retentionDays} days`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Schedule: {strategy.schedule}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PlayIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartBackup(strategy.id);
                          }}
                        >
                          Start
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Disaster Recovery Plans</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreatePlanDialogOpen(true)}
              >
                Create Plan
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {disasterRecoveryPlans.map((plan) => (
                <Grid item xs={12} sm={6} md={4} key={plan.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{plan.name}</Typography>
                        {getStatusIcon(plan.status)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {plan.description}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={plan.priority} 
                          size="small" 
                          color={getPriorityColor(plan.priority) as any}
                          variant="outlined"
                        />
                        <Chip 
                          label={`RTO: ${plan.rto}min`} 
                          size="small" 
                          color="info" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                        <Chip 
                          label={`RPO: ${plan.rpo}min`} 
                          size="small" 
                          color="warning" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Last tested: {plan.lastTested ? new Date(plan.lastTested).toLocaleDateString() : 'Never'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<TestIcon />}
                          onClick={() => handleTestDRPlan(plan.id)}
                        >
                          Test
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                        >
                          Edit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">High Availability Configurations</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateHADialogOpen(true)}
              >
                Create HA Config
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {highAvailabilityConfigs.map((config) => (
                <Grid item xs={12} sm={6} md={4} key={config.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{config.name}</Typography>
                        {getStatusIcon(config.status)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {haTypes.find(t => t.value === config.type)?.label}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={config.status} 
                          size="small" 
                          color={getStatusColor(config.status) as any}
                          variant="outlined"
                        />
                        <Chip 
                          label={config.failoverMode} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Primary: {config.primaryRegion}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SwapHorizIcon />}
                          onClick={() => handleExecuteFailover(config.id, config.secondaryRegions[0])}
                        >
                          Failover
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                        >
                          Edit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Recovery Points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage recovery points for backup restoration
          </Typography>
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Backup & DR Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor backup jobs, DR tests, and system health
          </Typography>
        </Box>
      )}

      {/* Create Backup Strategy Dialog */}
      <Dialog open={isCreateStrategyDialogOpen} onClose={() => setIsCreateStrategyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Backup Strategy</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Strategy Name"
                value={newStrategy.name}
                onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newStrategy.type}
                  onChange={(e) => setNewStrategy({ ...newStrategy, type: e.target.value })}
                >
                  {strategyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Schedule (Cron)"
                value={newStrategy.schedule}
                onChange={(e) => setNewStrategy({ ...newStrategy, schedule: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Retention Days"
                type="number"
                value={newStrategy.retentionDays}
                onChange={(e) => setNewStrategy({ ...newStrategy, retentionDays: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newStrategy.encryptionEnabled}
                      onChange={(e) => setNewStrategy({ ...newStrategy, encryptionEnabled: e.target.checked })}
                    />
                  }
                  label="Encryption Enabled"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={newStrategy.compressionEnabled}
                      onChange={(e) => setNewStrategy({ ...newStrategy, compressionEnabled: e.target.checked })}
                    />
                  }
                  label="Compression Enabled"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateStrategyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateStrategy} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Disaster Recovery Plan Dialog */}
      <Dialog open={isCreatePlanDialogOpen} onClose={() => setIsCreatePlanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Disaster Recovery Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plan Name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RTO (minutes)"
                type="number"
                value={newPlan.rto}
                onChange={(e) => setNewPlan({ ...newPlan, rto: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RPO (minutes)"
                type="number"
                value={newPlan.rpo}
                onChange={(e) => setNewPlan({ ...newPlan, rpo: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newPlan.priority}
                  onChange={(e) => setNewPlan({ ...newPlan, priority: e.target.value })}
                >
                  {planPriorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreatePlanDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePlan} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create High Availability Dialog */}
      <Dialog open={isCreateHADialogOpen} onClose={() => setIsCreateHADialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create High Availability Configuration</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Configuration Name"
                value={newHA.name}
                onChange={(e) => setNewHA({ ...newHA, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newHA.type}
                  onChange={(e) => setNewHA({ ...newHA, type: e.target.value })}
                >
                  {haTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Region"
                value={newHA.primaryRegion}
                onChange={(e) => setNewHA({ ...newHA, primaryRegion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Failover Mode</InputLabel>
                <Select
                  value={newHA.failoverMode}
                  onChange={(e) => setNewHA({ ...newHA, failoverMode: e.target.value })}
                >
                  <MenuItem value="automatic">Automatic</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateHADialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateHA} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupDisasterRecoveryDashboard;