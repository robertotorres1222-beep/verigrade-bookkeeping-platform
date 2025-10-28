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
  Slider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MonitoringDashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  widgets: any[];
  filters: any[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SLOMetric {
  id: string;
  name: string;
  description: string;
  metricType: 'availability' | 'latency' | 'error_rate' | 'throughput' | 'custom';
  target: number;
  measurement: number;
  status: 'healthy' | 'warning' | 'critical';
  errorBudget: number;
  burnRate: number;
  timeWindow: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  isActive: boolean;
  cooldown: number;
  createdAt: string;
  updatedAt: string;
}

const AdvancedMonitoringDashboard: React.FC = () => {
  const [dashboards, setDashboards] = useState<MonitoringDashboard[]>([]);
  const [sloMetrics, setSloMetrics] = useState<SLOMetric[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<MonitoringDashboard | null>(null);
  const [isCreateDashboardDialogOpen, setIsCreateDashboardDialogOpen] = useState(false);
  const [isCreateSLODialogOpen, setIsCreateSLODialogOpen] = useState(false);
  const [isCreateAlertDialogOpen, setIsCreateAlertDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [newSLO, setNewSLO] = useState({
    name: '',
    description: '',
    metricType: 'availability',
    target: 99.9,
    timeWindow: '30d'
  });
  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
    metric: '',
    condition: 'greater_than',
    threshold: 0,
    severity: 'medium',
    channels: []
  });

  const metricTypes = [
    { value: 'availability', label: 'Availability' },
    { value: 'latency', label: 'Latency' },
    { value: 'error_rate', label: 'Error Rate' },
    { value: 'throughput', label: 'Throughput' },
    { value: 'custom', label: 'Custom' }
  ];

  const alertSeverities = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' },
    { value: 'critical', label: 'Critical', color: 'error' }
  ];

  const sampleMetrics = [
    { name: 'CPU Usage', value: 45, unit: '%', trend: 'up' },
    { name: 'Memory Usage', value: 67, unit: '%', trend: 'down' },
    { name: 'Response Time', value: 120, unit: 'ms', trend: 'up' },
    { name: 'Error Rate', value: 0.2, unit: '%', trend: 'down' }
  ];

  const sampleChartData = [
    { time: '00:00', cpu: 45, memory: 67, response: 120 },
    { time: '04:00', cpu: 42, memory: 65, response: 115 },
    { time: '08:00', cpu: 48, memory: 70, response: 125 },
    { time: '12:00', cpu: 52, memory: 75, response: 130 },
    { time: '16:00', cpu: 50, memory: 72, response: 128 },
    { time: '20:00', cpu: 47, memory: 68, response: 122 }
  ];

  useEffect(() => {
    fetchDashboards();
    fetchSLOMetrics();
    fetchAlertRules();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await fetch('/api/advanced-monitoring/companies/1/dashboards');
      const data = await response.json();
      if (data.success) {
        setDashboards(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    }
  };

  const fetchSLOMetrics = async () => {
    try {
      const response = await fetch('/api/advanced-monitoring/companies/1/slo-metrics');
      const data = await response.json();
      if (data.success) {
        setSloMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching SLO metrics:', error);
    }
  };

  const fetchAlertRules = async () => {
    try {
      const response = await fetch('/api/advanced-monitoring/companies/1/alert-rules');
      const data = await response.json();
      if (data.success) {
        setAlertRules(data.data);
      }
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    }
  };

  const handleCreateDashboard = async () => {
    try {
      const response = await fetch('/api/advanced-monitoring/companies/1/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDashboard)
      });
      
      if (response.ok) {
        fetchDashboards();
        setIsCreateDashboardDialogOpen(false);
        setNewDashboard({ name: '', description: '', isPublic: false });
      }
    } catch (error) {
      console.error('Error creating dashboard:', error);
    }
  };

  const handleCreateSLO = async () => {
    try {
      const response = await fetch('/api/advanced-monitoring/companies/1/slo-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSLO)
      });
      
      if (response.ok) {
        fetchSLOMetrics();
        setIsCreateSLODialogOpen(false);
        setNewSLO({ name: '', description: '', metricType: 'availability', target: 99.9, timeWindow: '30d' });
      }
    } catch (error) {
      console.error('Error creating SLO:', error);
    }
  };

  const handleCreateAlert = async () => {
    try {
      const response = await fetch('/api/advanced-monitoring/companies/1/alert-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
      
      if (response.ok) {
        fetchAlertRules();
        setIsCreateAlertDialogOpen(false);
        setNewAlert({ name: '', description: '', metric: '', condition: 'greater_than', threshold: 0, severity: 'medium', channels: [] });
      }
    } catch (error) {
      console.error('Error creating alert rule:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Advanced Monitoring
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Monitor system performance, SLOs, alerts, and create custom dashboards
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Dashboards" />
        <Tab label="SLOs" />
        <Tab label="Alerts" />
        <Tab label="Metrics" />
        <Tab label="Logs" />
        <Tab label="Incidents" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Monitoring Dashboards</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDashboardDialogOpen(true)}
              >
                Create Dashboard
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {dashboards.map((dashboard) => (
                <Grid item xs={12} sm={6} md={4} key={dashboard.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedDashboard?.id === dashboard.id ? 2 : 1,
                      borderColor: selectedDashboard?.id === dashboard.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSelectedDashboard(dashboard)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{dashboard.name}</Typography>
                        <DashboardIcon color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {dashboard.description}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={`${dashboard.widgets.length} widgets`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        {dashboard.isPublic && (
                          <Chip 
                            label="Public" 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(dashboard.createdAt).toLocaleDateString()}
                      </Typography>
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
              <Typography variant="h6">SLO Metrics</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateSLODialogOpen(true)}
              >
                Create SLO
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {sloMetrics.map((slo) => (
                <Grid item xs={12} sm={6} md={4} key={slo.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{slo.name}</Typography>
                        {getStatusIcon(slo.status)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {slo.description}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={slo.status} 
                          size="small" 
                          color={getStatusColor(slo.status) as any}
                          variant="outlined"
                        />
                        <Chip 
                          label={`${slo.target}% target`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Current: {slo.measurement.toFixed(2)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(slo.measurement / slo.target) * 100} 
                          color={slo.status === 'healthy' ? 'success' : slo.status === 'warning' ? 'warning' : 'error'}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Error Budget: {slo.errorBudget.toFixed(2)}%
                      </Typography>
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
              <Typography variant="h6">Alert Rules</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateAlertDialogOpen(true)}
              >
                Create Alert
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Metric</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Threshold</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alertRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>{rule.metric}</TableCell>
                      <TableCell>{rule.condition}</TableCell>
                      <TableCell>{rule.threshold}</TableCell>
                      <TableCell>
                        <Chip 
                          label={rule.severity} 
                          size="small" 
                          color={getSeverityColor(rule.severity) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={rule.isActive ? 'Active' : 'Inactive'} 
                          size="small" 
                          color={rule.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            
            <Grid container spacing={2}>
              {sampleMetrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{metric.name}</Typography>
                        {metric.trend === 'up' ? <TrendingUpIcon color="error" /> : <TrendingDownIcon color="success" />}
                      </Box>
                      <Typography variant="h4" color="primary">
                        {metric.value}{metric.unit}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Performance Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sampleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="response" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Log Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Query and analyze application logs
          </Typography>
        </Box>
      )}

      {activeTab === 5 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Incidents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage system incidents
          </Typography>
        </Box>
      )}

      {/* Create Dashboard Dialog */}
      <Dialog open={isCreateDashboardDialogOpen} onClose={() => setIsCreateDashboardDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Monitoring Dashboard</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Dashboard Name"
            value={newDashboard.name}
            onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newDashboard.description}
            onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newDashboard.isPublic}
                onChange={(e) => setNewDashboard({ ...newDashboard, isPublic: e.target.checked })}
              />
            }
            label="Public Dashboard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDashboardDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateDashboard} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create SLO Dialog */}
      <Dialog open={isCreateSLODialogOpen} onClose={() => setIsCreateSLODialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create SLO Metric</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SLO Name"
                value={newSLO.name}
                onChange={(e) => setNewSLO({ ...newSLO, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newSLO.description}
                onChange={(e) => setNewSLO({ ...newSLO, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Metric Type</InputLabel>
                <Select
                  value={newSLO.metricType}
                  onChange={(e) => setNewSLO({ ...newSLO, metricType: e.target.value })}
                >
                  {metricTypes.map((type) => (
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
                label="Target (%)"
                type="number"
                value={newSLO.target}
                onChange={(e) => setNewSLO({ ...newSLO, target: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Time Window</InputLabel>
                <Select
                  value={newSLO.timeWindow}
                  onChange={(e) => setNewSLO({ ...newSLO, timeWindow: e.target.value })}
                >
                  <MenuItem value="1d">1 Day</MenuItem>
                  <MenuItem value="7d">7 Days</MenuItem>
                  <MenuItem value="30d">30 Days</MenuItem>
                  <MenuItem value="90d">90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateSLODialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSLO} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={isCreateAlertDialogOpen} onClose={() => setIsCreateAlertDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Alert Rule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alert Name"
                value={newAlert.name}
                onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Metric"
                value={newAlert.metric}
                onChange={(e) => setNewAlert({ ...newAlert, metric: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                >
                  <MenuItem value="greater_than">Greater Than</MenuItem>
                  <MenuItem value="less_than">Less Than</MenuItem>
                  <MenuItem value="equals">Equals</MenuItem>
                  <MenuItem value="not_equals">Not Equals</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Threshold"
                type="number"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                >
                  {alertSeverities.map((severity) => (
                    <MenuItem key={severity.value} value={severity.value}>
                      {severity.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateAlertDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateAlert} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedMonitoringDashboard;







