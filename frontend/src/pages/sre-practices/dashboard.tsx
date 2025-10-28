import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Tooltip,
  Fab,
  Switch,
  FormControlLabel,
  Slider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

interface SLO {
  id: string;
  name: string;
  description: string;
  service: string;
  sli: string;
  target: number;
  window: string;
  status: string;
}

interface SLI {
  id: string;
  sloId: string;
  timestamp: string;
  value: number;
  status: string;
}

interface ErrorBudget {
  id: string;
  sloId: string;
  totalBudget: number;
  consumedBudget: number;
  remainingBudget: number;
  burnRate: number;
  status: string;
}

interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  service: string;
  type: string;
  status: string;
  duration: number;
  severity: string;
  results?: {
    success: boolean;
    impact: string;
    lessons: string[];
    recommendations: string[];
  };
}

interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  service: string;
  type: string;
  status: string;
  configuration: {
    virtualUsers: number;
    duration: number;
    rampUp: number;
  };
  results?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    errorRate: number;
  };
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  service: string;
  assignee?: string;
  reporter: string;
  startTime: string;
  endTime?: string;
  impact: {
    usersAffected: number;
    revenueImpact: number;
    duration: number;
  };
  tags: string[];
}

interface Runbook {
  id: string;
  name: string;
  description: string;
  service: string;
  category: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    command?: string;
    expectedOutcome: string;
    timeout: number;
    critical: boolean;
  }>;
  status: string;
}

interface PostMortem {
  id: string;
  incidentId: string;
  title: string;
  summary: string;
  rootCause: string;
  impact: {
    usersAffected: number;
    revenueImpact: number;
    duration: number;
  };
  lessonsLearned: string[];
  actionItems: Array<{
    id: string;
    description: string;
    assignee: string;
    dueDate: string;
    status: string;
  }>;
  status: string;
}

interface Toil {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  timeSpent: number;
  automationPotential: string;
  priority: string;
  status: string;
}

interface SREAnalytics {
  sloCompliance: number;
  errorBudgetHealth: number;
  incidentCount: number;
  mttr: number;
  mtbf: number;
  toilReduction: number;
  chaosExperiments: number;
  performanceTests: number;
  topServices: Array<{
    service: string;
    incidents: number;
    sloCompliance: number;
  }>;
  trendData: Array<{
    date: string;
    incidents: number;
    sloCompliance: number;
  }>;
}

const SREPracticesDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [slos, setSlos] = useState<SLO[]>([]);
  const [slis, setSlis] = useState<SLI[]>([]);
  const [errorBudgets, setErrorBudgets] = useState<ErrorBudget[]>([]);
  const [chaosExperiments, setChaosExperiments] = useState<ChaosExperiment[]>([]);
  const [performanceTests, setPerformanceTests] = useState<PerformanceTest[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [postMortems, setPostMortems] = useState<PostMortem[]>([]);
  const [toils, setToils] = useState<Toil[]>([]);
  const [analytics, setAnalytics] = useState<SREAnalytics | null>(null);
  const [selectedSLO, setSelectedSLO] = useState<SLO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'slo' | 'chaos-experiment' | 'performance-test' | 'incident' | 'runbook' | 'post-mortem' | 'toil'>('slo');
  const [formData, setFormData] = useState<any>({});

  // Mock data for demonstration
  const mockSLOs: SLO[] = [
    { id: '1', name: 'API Availability', description: 'API uptime target', service: 'api-service', sli: 'availability', target: 99.9, window: '30d', status: 'ACTIVE' },
    { id: '2', name: 'Response Time', description: 'API response time target', service: 'api-service', sli: 'latency', target: 95.0, window: '7d', status: 'ACTIVE' },
    { id: '3', name: 'Error Rate', description: 'Error rate target', service: 'api-service', sli: 'error_rate', target: 99.5, window: '24h', status: 'ACTIVE' },
  ];

  const mockSLIs: SLI[] = [
    { id: '1', sloId: '1', timestamp: '2024-01-15T10:00:00Z', value: 99.95, status: 'GOOD' },
    { id: '2', sloId: '1', timestamp: '2024-01-15T11:00:00Z', value: 99.92, status: 'GOOD' },
    { id: '3', sloId: '2', timestamp: '2024-01-15T10:00:00Z', value: 94.5, status: 'WARNING' },
  ];

  const mockErrorBudgets: ErrorBudget[] = [
    { id: '1', sloId: '1', totalBudget: 0.1, consumedBudget: 0.05, remainingBudget: 0.05, burnRate: 0.5, status: 'HEALTHY' },
    { id: '2', sloId: '2', totalBudget: 5.0, consumedBudget: 2.5, remainingBudget: 2.5, burnRate: 0.5, status: 'HEALTHY' },
    { id: '3', sloId: '3', totalBudget: 0.5, consumedBudget: 0.4, remainingBudget: 0.1, burnRate: 0.8, status: 'WARNING' },
  ];

  const mockChaosExperiments: ChaosExperiment[] = [
    { id: '1', name: 'Network Latency', description: 'Simulate network latency', service: 'api-service', type: 'NETWORK', status: 'COMPLETED', duration: 30, severity: 'MEDIUM', results: { success: true, impact: 'Service degradation observed', lessons: ['Network latency increased', 'Database connections reduced'], recommendations: ['Implement circuit breakers', 'Add retry mechanisms'] } },
    { id: '2', name: 'CPU Stress', description: 'Simulate high CPU usage', service: 'api-service', type: 'CPU', status: 'RUNNING', duration: 60, severity: 'HIGH' },
  ];

  const mockPerformanceTests: PerformanceTest[] = [
    { id: '1', name: 'Load Test', description: 'Standard load test', service: 'api-service', type: 'LOAD', status: 'COMPLETED', configuration: { virtualUsers: 100, duration: 30, rampUp: 5 }, results: { totalRequests: 30000, successfulRequests: 28500, failedRequests: 1500, averageResponseTime: 250, p95ResponseTime: 500, p99ResponseTime: 1000, throughput: 16.7, errorRate: 0.05 } },
    { id: '2', name: 'Stress Test', description: 'High load stress test', service: 'api-service', type: 'STRESS', status: 'RUNNING', configuration: { virtualUsers: 500, duration: 60, rampUp: 10 } },
  ];

  const mockIncidents: Incident[] = [
    { id: '1', title: 'API Outage', description: 'Complete API service outage', severity: 'P1', status: 'RESOLVED', service: 'api-service', assignee: 'user1', reporter: 'user2', startTime: '2024-01-15T09:00:00Z', endTime: '2024-01-15T10:30:00Z', impact: { usersAffected: 1000, revenueImpact: 5000, duration: 90 }, tags: ['outage', 'api', 'critical'] },
    { id: '2', title: 'Database Slowdown', description: 'Database performance degradation', severity: 'P2', status: 'INVESTIGATING', service: 'api-service', assignee: 'user1', reporter: 'user3', startTime: '2024-01-16T14:00:00Z', impact: { usersAffected: 500, revenueImpact: 2500, duration: 0 }, tags: ['database', 'performance'] },
  ];

  const mockRunbooks: Runbook[] = [
    { id: '1', name: 'API Outage Response', description: 'Steps to respond to API outages', service: 'api-service', category: 'INCIDENT_RESPONSE', status: 'ACTIVE', steps: [
      { id: '1', title: 'Check Service Status', description: 'Verify service is down', command: 'curl -f http://api-service/health', expectedOutcome: 'Service returns 200', timeout: 5, critical: true },
      { id: '2', title: 'Check Logs', description: 'Review application logs', command: 'kubectl logs -f deployment/api-service', expectedOutcome: 'Identify error patterns', timeout: 10, critical: true },
    ] },
  ];

  const mockPostMortems: PostMortem[] = [
    { id: '1', incidentId: '1', title: 'API Outage Post-Mortem', summary: 'Root cause analysis of API outage', rootCause: 'Database connection pool exhaustion', impact: { usersAffected: 1000, revenueImpact: 5000, duration: 90 }, lessonsLearned: ['Need better monitoring', 'Implement circuit breakers'], actionItems: [
      { id: '1', description: 'Implement database connection pooling', assignee: 'user1', dueDate: '2024-02-01', status: 'OPEN' },
      { id: '2', description: 'Add database monitoring', assignee: 'user2', dueDate: '2024-02-15', status: 'IN_PROGRESS' },
    ], status: 'APPROVED' },
  ];

  const mockToils: Toil[] = [
    { id: '1', name: 'Manual Database Backup', description: 'Daily manual database backup process', category: 'MANUAL', frequency: 'DAILY', timeSpent: 30, automationPotential: 'HIGH', priority: 'MEDIUM', status: 'IDENTIFIED' },
    { id: '2', name: 'Log Analysis', description: 'Manual log analysis for incidents', category: 'REACTIVE', frequency: 'ON_DEMAND', timeSpent: 60, automationPotential: 'HIGH', priority: 'HIGH', status: 'AUTOMATED' },
  ];

  const mockAnalytics: SREAnalytics = {
    sloCompliance: 98.5,
    errorBudgetHealth: 85.2,
    incidentCount: 12,
    mttr: 45.5,
    mtbf: 720.0,
    toilReduction: 65.0,
    chaosExperiments: 8,
    performanceTests: 15,
    topServices: [
      { service: 'api-service', incidents: 8, sloCompliance: 98.5 },
      { service: 'web-service', incidents: 3, sloCompliance: 99.2 },
      { service: 'db-service', incidents: 1, sloCompliance: 99.8 },
    ],
    trendData: [
      { date: '2024-01-01', incidents: 2, sloCompliance: 98.5 },
      { date: '2024-01-02', incidents: 1, sloCompliance: 99.0 },
      { date: '2024-01-03', incidents: 0, sloCompliance: 99.5 },
    ],
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSlos(mockSLOs);
      setSlis(mockSLIs);
      setErrorBudgets(mockErrorBudgets);
      setChaosExperiments(mockChaosExperiments);
      setPerformanceTests(mockPerformanceTests);
      setIncidents(mockIncidents);
      setRunbooks(mockRunbooks);
      setPostMortems(mockPostMortems);
      setToils(mockToils);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError('Failed to load SRE data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'slo' | 'chaos-experiment' | 'performance-test' | 'incident' | 'runbook' | 'post-mortem' | 'toil', item?: any) => {
    setDialogType(type);
    setFormData(item || {});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError('Failed to save data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'success';
      case 'RESOLVED': return 'success';
      case 'HEALTHY': return 'success';
      case 'GOOD': return 'success';
      case 'RUNNING': return 'info';
      case 'INVESTIGATING': return 'warning';
      case 'WARNING': return 'warning';
      case 'CRITICAL': return 'error';
      case 'EXHAUSTED': return 'error';
      case 'FAILED': return 'error';
      case 'P1': return 'error';
      case 'P2': return 'warning';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'P1': return 'error';
      case 'CRITICAL': return 'error';
      case 'P2': return 'warning';
      case 'HIGH': return 'warning';
      case 'P3': return 'info';
      case 'MEDIUM': return 'info';
      case 'P4': return 'success';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading SRE data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          SRE Practices Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('slo')}
          >
            Add SLO
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    SLO Compliance
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.sloCompliance?.toFixed(1) || 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Error Budget Health
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.errorBudgetHealth?.toFixed(1) || 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BugReportIcon color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Incidents (30d)
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.incidentCount || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    MTTR (min)
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.mttr?.toFixed(1) || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="SLOs" />
            <Tab label="Chaos Engineering" />
            <Tab label="Performance Testing" />
            <Tab label="Incidents" />
            <Tab label="Runbooks" />
            <Tab label="Post-Mortems" />
            <Tab label="Toil" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* SLOs Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Service Level Objectives</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('slo')}
                >
                  Add SLO
                </Button>
              </Box>

              <Grid container spacing={2}>
                {slos.map((slo) => (
                  <Grid item xs={12} sm={6} md={4} key={slo.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{slo.name}</Typography>
                          <Chip
                            label={slo.status}
                            color={getStatusColor(slo.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {slo.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Service: {slo.service}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Target: {slo.target}% ({slo.window})
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Chaos Engineering Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Chaos Experiments</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('chaos-experiment')}
                >
                  Add Experiment
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chaosExperiments.map((experiment) => (
                      <TableRow key={experiment.id}>
                        <TableCell>{experiment.name}</TableCell>
                        <TableCell>{experiment.service}</TableCell>
                        <TableCell>{experiment.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={experiment.severity}
                            color={getSeverityColor(experiment.severity) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={experiment.status}
                            color={getStatusColor(experiment.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{experiment.duration}m</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <PlayIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Performance Testing Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Performance Tests</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('performance-test')}
                >
                  Add Test
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Virtual Users</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>{test.name}</TableCell>
                        <TableCell>{test.service}</TableCell>
                        <TableCell>{test.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={test.status}
                            color={getStatusColor(test.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{test.configuration.virtualUsers}</TableCell>
                        <TableCell>{test.configuration.duration}m</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <PlayIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Incidents Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Incidents</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('incident')}
                >
                  Create Incident
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{incident.title}</TableCell>
                        <TableCell>{incident.service}</TableCell>
                        <TableCell>
                          <Chip
                            label={incident.severity}
                            color={getSeverityColor(incident.severity) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={incident.status}
                            color={getStatusColor(incident.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(incident.startTime).toLocaleString()}</TableCell>
                        <TableCell>{incident.impact.duration}m</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Runbooks Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Runbooks</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('runbook')}
                >
                  Add Runbook
                </Button>
              </Box>

              <Grid container spacing={2}>
                {runbooks.map((runbook) => (
                  <Grid item xs={12} sm={6} md={4} key={runbook.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{runbook.name}</Typography>
                          <Chip
                            label={runbook.status}
                            color={getStatusColor(runbook.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {runbook.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Service: {runbook.service}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Category: {runbook.category}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Steps: {runbook.steps.length}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Post-Mortems Tab */}
          {activeTab === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Post-Mortems</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('post-mortem')}
                >
                  Add Post-Mortem
                </Button>
              </Box>

              <Grid container spacing={2}>
                {postMortems.map((postMortem) => (
                  <Grid item xs={12} key={postMortem.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{postMortem.title}</Typography>
                          <Chip
                            label={postMortem.status}
                            color={getStatusColor(postMortem.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {postMortem.summary}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Root Cause: {postMortem.rootCause}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Action Items: {postMortem.actionItems.length}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<ViewIcon />}>
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Toil Tab */}
          {activeTab === 6 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Toil Management</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('toil')}
                >
                  Add Toil
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Time Spent</TableCell>
                      <TableCell>Automation Potential</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {toils.map((toil) => (
                      <TableRow key={toil.id}>
                        <TableCell>{toil.name}</TableCell>
                        <TableCell>{toil.category}</TableCell>
                        <TableCell>{toil.frequency}</TableCell>
                        <TableCell>{toil.timeSpent}m</TableCell>
                        <TableCell>
                          <Chip
                            label={toil.automationPotential}
                            color={toil.automationPotential === 'HIGH' ? 'success' : toil.automationPotential === 'MEDIUM' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={toil.priority}
                            color={getSeverityColor(toil.priority) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={toil.status}
                            color={getStatusColor(toil.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 7 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>SRE Analytics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Incident Trend</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.trendData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="incidents" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Top Services by Incidents</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.topServices || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="service" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="incidents" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>SLO Compliance</Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress
                          variant="determinate"
                          value={analytics?.sloCompliance || 0}
                          size={120}
                          thickness={4}
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="h4" gutterBottom>
                          {analytics?.sloCompliance?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          SLO Compliance
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Error Budget Health</Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress
                          variant="determinate"
                          value={analytics?.errorBudgetHealth || 0}
                          size={120}
                          thickness={4}
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="h4" gutterBottom>
                          {analytics?.errorBudgetHealth?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Error Budget Health
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'slo' ? 'Add/Edit SLO' :
           dialogType === 'chaos-experiment' ? 'Add/Edit Chaos Experiment' :
           dialogType === 'performance-test' ? 'Add/Edit Performance Test' :
           dialogType === 'incident' ? 'Create/Edit Incident' :
           dialogType === 'runbook' ? 'Add/Edit Runbook' :
           dialogType === 'post-mortem' ? 'Add/Edit Post-Mortem' :
           'Add/Edit Toil'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'slo' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SLO Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Service"
                    value={formData.service || ''}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SLI"
                    value={formData.sli || ''}
                    onChange={(e) => setFormData({ ...formData, sli: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target (%)"
                    type="number"
                    value={formData.target || ''}
                    onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Window"
                    value={formData.window || ''}
                    onChange={(e) => setFormData({ ...formData, window: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                      <MenuItem value="DRAFT">Draft</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            {dialogType === 'chaos-experiment' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Experiment Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Service"
                    value={formData.service || ''}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <MenuItem value="NETWORK">Network</MenuItem>
                      <MenuItem value="CPU">CPU</MenuItem>
                      <MenuItem value="MEMORY">Memory</MenuItem>
                      <MenuItem value="DISK">Disk</MenuItem>
                      <MenuItem value="POD">Pod</MenuItem>
                      <MenuItem value="CUSTOM">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={formData.severity || ''}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    >
                      <MenuItem value="LOW">Low</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="HIGH">High</MenuItem>
                      <MenuItem value="CRITICAL">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            {dialogType === 'incident' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Service"
                    value={formData.service || ''}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={formData.severity || ''}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    >
                      <MenuItem value="P1">P1 - Critical</MenuItem>
                      <MenuItem value="P2">P2 - High</MenuItem>
                      <MenuItem value="P3">P3 - Medium</MenuItem>
                      <MenuItem value="P4">P4 - Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status || 'OPEN'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="OPEN">Open</MenuItem>
                      <MenuItem value="INVESTIGATING">Investigating</MenuItem>
                      <MenuItem value="RESOLVED">Resolved</MenuItem>
                      <MenuItem value="CLOSED">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog('slo')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default SREPracticesDashboard;







