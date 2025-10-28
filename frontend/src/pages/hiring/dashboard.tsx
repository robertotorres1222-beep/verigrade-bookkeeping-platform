import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Group as GroupIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface HiringDashboard {
  bottlenecks: {
    count: number;
    analysis: any[];
  };
  hiringTriggers: {
    count: number;
    analysis: any[];
  };
  scenarios: {
    count: number;
    analysis: any[];
  };
  headcountPlan: {
    count: number;
    analysis: any[];
  };
  summary: {
    totalBottlenecks: number;
    urgentHiringNeeded: number;
    recommendedHires: number;
    totalHiringCost: number;
  };
}

const HiringDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<HiringDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchHiringDashboard();
  }, []);

  const fetchHiringDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hiring/dashboard/company-id');
      const data = await response.json();
      
      if (data.success) {
        setDashboard(data.data);
      } else {
        setError('Failed to fetch hiring dashboard');
      }
    } catch (err) {
      setError('Error fetching hiring dashboard');
      console.error('Fetch hiring dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Immediate Hiring Needed': return 'error';
      case 'Hiring Needed in 1-2 months': return 'warning';
      case 'Hiring Needed in 3-6 months': return 'info';
      default: return 'success';
    }
  };

  const getBottleneckColor = (score: number) => {
    if (score >= 70) return 'error';
    if (score >= 50) return 'warning';
    if (score >= 30) return 'info';
    return 'success';
  };

  const getBottleneckLabel = (score: number) => {
    if (score >= 70) return 'Severe';
    if (score >= 50) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Hiring Prediction Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchHiringDashboard}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Bottlenecks</Typography>
                </Box>
                <Typography variant="h4">{dashboard.summary.totalBottlenecks}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Identified bottlenecks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Urgent Hiring</Typography>
                </Box>
                <Typography variant="h4">{dashboard.summary.urgentHiringNeeded}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Immediate hiring needed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Recommended Hires</Typography>
                </Box>
                <Typography variant="h4">{dashboard.summary.recommendedHires}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total recommended hires
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Hiring Cost</Typography>
                </Box>
                <Typography variant="h4">${dashboard.summary.totalHiringCost.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total estimated cost
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Hiring Analysis Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab label="Bottlenecks" />
            <Tab label="Hiring Triggers" />
            <Tab label="Scenarios" />
            <Tab label="Headcount Planning" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Bottlenecks Tab */}
          {selectedTab === 0 && dashboard && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Bottleneck Analysis
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Bottleneck Score</TableCell>
                      <TableCell>Severity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.bottlenecks.analysis.map((bottleneck, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={bottleneck.bottleneck_type}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{bottleneck.name}</TableCell>
                        <TableCell>{bottleneck.department || 'N/A'}</TableCell>
                        <TableCell>{bottleneck.status || 'N/A'}</TableCell>
                        <TableCell>{bottleneck.bottleneck_score}</TableCell>
                        <TableCell>
                          <Chip
                            label={getBottleneckLabel(bottleneck.bottleneck_score)}
                            color={getBottleneckColor(bottleneck.bottleneck_score) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Hiring Triggers Tab */}
          {selectedTab === 1 && dashboard && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Hiring Triggers
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Current Employees</TableCell>
                      <TableCell>Avg Hours/Employee</TableCell>
                      <TableCell>Active Projects</TableCell>
                      <TableCell>Hiring Urgency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.hiringTriggers.analysis.map((trigger, index) => (
                      <TableRow key={index}>
                        <TableCell>{trigger.department}</TableCell>
                        <TableCell>{trigger.position}</TableCell>
                        <TableCell>{trigger.current_employees}</TableCell>
                        <TableCell>{trigger.avg_hours_per_employee?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>{trigger.active_projects || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={trigger.hiring_urgency}
                            color={getUrgencyColor(trigger.hiring_urgency) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Scenarios Tab */}
          {selectedTab === 2 && dashboard && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Hiring Scenarios</Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export Scenarios
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Scenario</TableCell>
                      <TableCell>Employees</TableCell>
                      <TableCell>Hiring Cost</TableCell>
                      <TableCell>Projected Profit</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.scenarios.analysis.map((scenario, index) => (
                      <TableRow key={index}>
                        <TableCell>{scenario.scenario_name}</TableCell>
                        <TableCell>{scenario.current_employees}</TableCell>
                        <TableCell>${scenario.hiring_cost?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell>${scenario.projected_profit?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell>{scenario.description}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedScenario(scenario);
                              setScenarioDialogOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Headcount Planning Tab */}
          {selectedTab === 3 && dashboard && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Headcount Planning
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell>Current Employees</TableCell>
                      <TableCell>Recommended</TableCell>
                      <TableCell>Hiring Urgency</TableCell>
                      <TableCell>Cost per Hire</TableCell>
                      <TableCell>Total Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.headcountPlan.analysis.map((plan, index) => (
                      <TableRow key={index}>
                        <TableCell>{plan.department}</TableCell>
                        <TableCell>{plan.current_employees}</TableCell>
                        <TableCell>{plan.recommended_employees}</TableCell>
                        <TableCell>
                          <Chip
                            label={plan.hiring_urgency}
                            color={getUrgencyColor(plan.hiring_urgency) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${plan.cost_per_new_hire?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell>${plan.total_hiring_cost?.toLocaleString() || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Scenario Details Dialog */}
      <Dialog open={scenarioDialogOpen} onClose={() => setScenarioDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Scenario Details</DialogTitle>
        <DialogContent>
          {selectedScenario && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Scenario Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Scenario Name"
                        secondary={selectedScenario.scenario_name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Current Employees"
                        secondary={selectedScenario.current_employees}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Hiring Cost"
                        secondary={`$${selectedScenario.hiring_cost?.toLocaleString() || 'N/A'}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Projected Profit"
                        secondary={`$${selectedScenario.projected_profit?.toLocaleString() || 'N/A'}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Financial Impact
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total Hours"
                        secondary={selectedScenario.total_hours}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Active Projects"
                        secondary={selectedScenario.active_projects}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Total Budget"
                        secondary={`$${selectedScenario.total_budget?.toLocaleString() || 'N/A'}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Actual Cost"
                        secondary={`$${selectedScenario.total_actual_cost?.toLocaleString() || 'N/A'}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedScenario.description}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScenarioDialogOpen(false)}>Close</Button>
          <Button variant="contained">Implement Scenario</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HiringDashboard;









