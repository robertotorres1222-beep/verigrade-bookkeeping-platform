import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
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
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  PlayArrow,
  Stop,
  Settings,
  Analytics,
  Security,
  ExpandMore,
  Add,
  Edit,
  Delete,
  Schedule,
  History,
  Notifications,
  Person,
  Group,
  Business,
  Timer,
  Flag,
  ThumbUp,
  ThumbDown,
  EscalatorWarning,
  Download,
  Upload,
  Search,
  FilterList,
  Visibility,
  RestoreFromTrash,
  Compare,
  Timeline,
  Psychology,
  Assessment,
  Work,
  School,
  AttachMoney,
  TrendingFlat,
  Speed,
  HourglassEmpty,
  People,
  BusinessCenter,
  AccountBalance,
  Receipt,
  Store,
  Calculate,
  Timeline as TimelineIcon,
  BarChart,
  PieChart
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface HiringIntelligenceProps {}

const HiringIntelligence: React.FC<HiringIntelligenceProps> = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [analysisForm, setAnalysisForm] = useState<any>({
    type: '',
    data: {},
    recommendations: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hiring/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hiring dashboard');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeHiringNeeds = async () => {
    try {
      const response = await fetch('/api/hiring/analysis', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to analyze hiring needs');
      }

      const result = await response.json();
      alert(`Hiring analysis completed. Found ${result.data.recommendations?.length || 0} recommendations.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnalyzeBottlenecks = async () => {
    try {
      const response = await fetch('/api/hiring/bottlenecks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to analyze bottlenecks');
      }

      const result = await response.json();
      alert(`Bottleneck analysis completed. Found ${result.data.recommendations?.length || 0} recommendations.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetHiringScenarios = async () => {
    try {
      const response = await fetch('/api/hiring/scenarios', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get hiring scenarios');
      }

      const result = await response.json();
      setSelectedAnalysis(result.data);
      setScenarioDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveAnalysis = async () => {
    try {
      const response = await fetch('/api/hiring/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(analysisForm)
      });

      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }

      alert('Analysis saved successfully');
      setAnalysisDialogOpen(false);
      setAnalysisForm({ type: '', data: {}, recommendations: [] });
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No hiring intelligence data available
      </Alert>
    );
  }

  const hiringStatsData = [
    { name: 'Total Employees', value: dashboardData.hiringStats?.total_employees || 0, color: '#4caf50' },
    { name: 'Recent Hires', value: dashboardData.hiringStats?.recent_hires || 0, color: '#2196f3' },
    { name: 'Recent Departures', value: dashboardData.hiringStats?.recent_departures || 0, color: '#f44336' },
    { name: 'Active Employees', value: dashboardData.hiringStats?.active_employees || 0, color: '#ff9800' }
  ];

  const recentAnalysesData = dashboardData.recentAnalyses?.map((analysis: any) => ({
    id: analysis.id,
    type: analysis.analysis_type,
    confidenceScore: analysis.confidence_score,
    analyzedAt: new Date(analysis.analyzed_at).toLocaleDateString(),
    data: analysis.analysis_data
  })) || [];

  const departmentAnalysisData = dashboardData.departmentAnalysis?.map((dept: any) => ({
    department: dept.department,
    employeeCount: dept.employee_count,
    avgSalary: dept.avg_salary,
    recentHires: dept.recent_hires,
    recentDepartures: dept.recent_departures,
    avgEfficiency: dept.avg_efficiency
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Predictive Hiring Intelligence
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Psychology />}
            onClick={handleAnalyzeHiringNeeds}
            sx={{ mr: 1 }}
          >
            Analyze Hiring Needs
          </Button>
          <Button
            variant="outlined"
            startIcon={<HourglassEmpty />}
            onClick={handleAnalyzeBottlenecks}
            sx={{ mr: 1 }}
          >
            Analyze Bottlenecks
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={handleGetHiringScenarios}
          >
            Hiring Scenarios
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Employees</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.hiringStats?.total_employees || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Hires</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {dashboardData.hiringStats?.recent_hires || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Departures</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {dashboardData.hiringStats?.recent_departures || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoney color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Salary</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                ${dashboardData.hiringStats?.avg_salary?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Hiring Analysis" />
          <Tab label="Bottleneck Analysis" />
          <Tab label="Department Analysis" />
          <Tab label="Trends" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hiring Statistics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={hiringStatsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {hiringStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Analyses
                </Typography>
                <List>
                  {recentAnalysesData.slice(0, 5).map((analysis: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Assessment color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={analysis.type}
                        secondary={`Confidence: ${analysis.confidenceScore}% - ${analysis.analyzedAt}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hiring Analysis
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Analysis Summary
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Analyses</Typography>
                      <Typography variant="body2">24</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">High Confidence</Typography>
                      <Typography variant="body2">18</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Recommendations</Typography>
                      <Typography variant="body2">12</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Last Analysis</Typography>
                      <Typography variant="body2">2 hours ago</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Hiring Triggers
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Critical bottleneck in Engineering" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText primary="Capacity issues in Sales" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Support team balanced" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Bottleneck Analysis
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bottleneck Severity
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Critical</Typography>
                      <Typography variant="body2">2 departments</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">High</Typography>
                      <Typography variant="body2">3 departments</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Medium</Typography>
                      <Typography variant="body2">1 department</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Low</Typography>
                      <Typography variant="body2">4 departments</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bottleneck Types
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <HourglassEmpty color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Task bottlenecks: 5 departments" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <People color="warning" />
                        </ListItemIcon>
                        <ListItemText primary="Resource bottlenecks: 3 departments" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Speed color="info" />
                        </ListItemIcon>
                        <ListItemText primary="Process bottlenecks: 2 departments" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Business color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Capacity bottlenecks: 1 department" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Analysis
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell>Employees</TableCell>
                    <TableCell>Avg Salary</TableCell>
                    <TableCell>Recent Hires</TableCell>
                    <TableCell>Departures</TableCell>
                    <TableCell>Efficiency</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentAnalysisData.map((dept: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {dept.department}
                        </Typography>
                      </TableCell>
                      <TableCell>{dept.employeeCount}</TableCell>
                      <TableCell>${dept.avgSalary?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={dept.recentHires}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={dept.recentDepartures}
                          size="small"
                          color="error"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={dept.avgEfficiency * 100}
                            sx={{ width: 100, mr: 1 }}
                          />
                          <Typography variant="body2">
                            {Math.round(dept.avgEfficiency * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Analyze">
                          <IconButton size="small">
                            <Assessment />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hiring Trends
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Hiring Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={[
                        { month: 'Jan', hires: 2, departures: 1 },
                        { month: 'Feb', hires: 3, departures: 0 },
                        { month: 'Mar', hires: 1, departures: 2 },
                        { month: 'Apr', hires: 4, departures: 1 },
                        { month: 'May', hires: 2, departures: 0 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="hires" stroke="#4caf50" strokeWidth={2} />
                        <Line type="monotone" dataKey="departures" stroke="#f44336" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Salary Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { department: 'Engineering', avgSalary: 120000 },
                        { department: 'Sales', avgSalary: 95000 },
                        { department: 'Support', avgSalary: 75000 },
                        { department: 'Marketing', avgSalary: 85000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="avgSalary" fill="#2196f3" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Analysis Dialog */}
      <Dialog open={analysisDialogOpen} onClose={() => setAnalysisDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Save Analysis</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Analysis Type"
            value={analysisForm.type}
            onChange={(e) => setAnalysisForm({ ...analysisForm, type: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Analysis Data (JSON)"
            multiline
            rows={4}
            value={JSON.stringify(analysisForm.data)}
            onChange={(e) => setAnalysisForm({ ...analysisForm, data: JSON.parse(e.target.value || '{}') })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Recommendations (JSON)"
            multiline
            rows={3}
            value={JSON.stringify(analysisForm.recommendations)}
            onChange={(e) => setAnalysisForm({ ...analysisForm, recommendations: JSON.parse(e.target.value || '[]') })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAnalysis} variant="contained">
            Save Analysis
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scenario Dialog */}
      <Dialog open={scenarioDialogOpen} onClose={() => setScenarioDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Hiring Scenarios</DialogTitle>
        <DialogContent>
          {selectedAnalysis && (
            <Grid container spacing={3}>
              {selectedAnalysis.map((scenario: any, index: number) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {scenario.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {scenario.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Timeline:</Typography>
                        <Typography variant="body2">{scenario.timeline}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Cost:</Typography>
                        <Typography variant="body2">${scenario.cost?.toLocaleString()}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2">Benefits:</Typography>
                        <Typography variant="body2">{scenario.benefits?.length || 0} benefits</Typography>
                      </Box>
                      <Button variant="outlined" size="small" fullWidth>
                        Select Scenario
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScenarioDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HiringIntelligence;






