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
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent
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
  PieChart,
  Lightbulb,
  Insights,
  AutoAwesome,
  SmartToy,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info,
  Star,
  StarBorder,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Feedback,
  Help,
  QuestionAnswer,
  Chat,
  Message,
  Send,
  Reply,
  Forward,
  Share,
  Bookmark,
  BookmarkBorder,
  Favorite,
  FavoriteBorder,
  Grade,
  GradeOutlined,
  PersonAdd,
  PersonRemove,
  GroupAdd,
  GroupRemove,
  PersonPin,
  PersonPinCircle,
  PersonSearch,
  PersonOff,
  PersonAddAlt,
  PersonRemoveAlt,
  PersonAddDisabled,
  PersonRemoveDisabled,
  PersonAddAlt1,
  PersonRemoveAlt1,
  PersonAddAlt1Outlined,
  PersonRemoveAlt1Outlined,
  PersonAddAlt1Rounded,
  PersonRemoveAlt1Rounded,
  PersonAddAlt1Sharp,
  PersonRemoveAlt1Sharp,
  PersonAddAlt1TwoTone,
  PersonRemoveAlt1TwoTone
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ChurnPreventionDashboardProps {}

const ChurnPreventionDashboard: React.FC<ChurnPreventionDashboardProps> = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [recommendationsDialogOpen, setRecommendationsDialogOpen] = useState(false);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [customersDialogOpen, setCustomersDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<any>(null);
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
      const response = await fetch('/api/churn-prevention/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch churn prevention dashboard');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeChurnRisk = async () => {
    try {
      const response = await fetch('/api/churn-prevention/analysis', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to analyze churn risk');
      }

      const result = await response.json();
      setSelectedAnalysis(result.data);
      setAnalysisDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetRecommendations = async () => {
    try {
      const response = await fetch('/api/churn-prevention/recommendations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const result = await response.json();
      setSelectedRecommendation(result.data);
      setRecommendationsDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetAlerts = async () => {
    try {
      const response = await fetch('/api/churn-prevention/alerts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get alerts');
      }

      const result = await response.json();
      setSelectedAlert(result.data);
      setAlertsDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetChurnRiskCustomers = async () => {
    try {
      const response = await fetch('/api/churn-prevention/customers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get churn risk customers');
      }

      const result = await response.json();
      setSelectedCustomers(result.data);
      setCustomersDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveAnalysis = async () => {
    try {
      const response = await fetch('/api/churn-prevention/analysis', {
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
        No churn prevention data available
      </Alert>
    );
  }

  const churnStatsData = [
    { name: 'Total Customers', value: dashboardData.churnStats?.total_customers || 0, color: '#4caf50' },
    { name: 'Active Customers', value: dashboardData.churnStats?.active_customers || 0, color: '#2196f3' },
    { name: 'At Risk Customers', value: dashboardData.churnStats?.at_risk_customers || 0, color: '#ff9800' },
    { name: 'Inactive Customers', value: dashboardData.churnStats?.inactive_customers || 0, color: '#f44336' }
  ];

  const recentAnalysesData = dashboardData.recentAnalyses?.map((analysis: any) => ({
    id: analysis.id,
    type: analysis.analysis_type,
    score: analysis.churn_risk_score,
    confidence: analysis.confidence_score,
    analyzedAt: new Date(analysis.analyzed_at).toLocaleDateString(),
    data: analysis.analysis_data
  })) || [];

  const customerSegmentsData = dashboardData.customerSegments?.map((segment: any) => ({
    segment: segment.segment,
    customerCount: segment.customer_count,
    avgValue: segment.avg_segment_value,
    totalValue: segment.total_segment_value,
    activeInSegment: segment.active_in_segment,
    inactiveInSegment: segment.inactive_in_segment
  })) || [];

  const trendAnalysisData = dashboardData.trendAnalysis?.map((trend: any) => ({
    month: new Date(trend.month).toLocaleDateString(),
    newCustomers: trend.new_customers,
    churnedCustomers: trend.churned_customers,
    avgCustomerValue: trend.avg_customer_value
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Churn Prevention Dashboard
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
            onClick={handleAnalyzeChurnRisk}
            sx={{ mr: 1 }}
          >
            Analyze Churn Risk
          </Button>
          <Button
            variant="outlined"
            startIcon={<Lightbulb />}
            onClick={handleGetRecommendations}
            sx={{ mr: 1 }}
          >
            Recommendations
          </Button>
          <Button
            variant="outlined"
            startIcon={<Notifications />}
            onClick={handleGetAlerts}
            sx={{ mr: 1 }}
          >
            Alerts
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonSearch />}
            onClick={handleGetChurnRiskCustomers}
          >
            At-Risk Customers
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
                <Typography variant="h6">Total Customers</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.churnStats?.total_customers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Customers</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {dashboardData.churnStats?.active_customers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">At Risk</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {dashboardData.churnStats?.at_risk_customers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Error color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Inactive</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {dashboardData.churnStats?.inactive_customers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Customer Analysis" />
          <Tab label="Risk Factors" />
          <Tab label="Recommendations" />
          <Tab label="Alerts" />
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
                  Customer Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={churnStatsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {churnStatsData.map((entry, index) => (
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
                        secondary={`Risk Score: ${analysis.score} - Confidence: ${analysis.confidence}% - ${analysis.analyzedAt}`}
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
              Customer Segments
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Segment</TableCell>
                    <TableCell>Customer Count</TableCell>
                    <TableCell>Avg Value</TableCell>
                    <TableCell>Total Value</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Inactive</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerSegmentsData.map((segment: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          label={segment.segment}
                          size="small"
                          color={
                            segment.segment === 'high_value' ? 'success' :
                            segment.segment === 'medium_value' ? 'info' :
                            segment.segment === 'low_value' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{segment.customerCount}</TableCell>
                      <TableCell>${segment.avgValue?.toLocaleString() || 0}</TableCell>
                      <TableCell>${segment.totalValue?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={segment.activeInSegment}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={segment.inactiveInSegment}
                          size="small"
                          color="error"
                        />
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

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Factors
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Inactive for 90+ days"
                      secondary="15 customers have been inactive for 90+ days"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Low engagement"
                      secondary="25 customers show low engagement levels"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Behavior patterns"
                      secondary="10 customers show concerning behavior patterns"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Critical Risk</Typography>
                  <Typography variant="body2" color="error.main">5 customers</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">High Risk</Typography>
                  <Typography variant="body2" color="warning.main">12 customers</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Medium Risk</Typography>
                  <Typography variant="body2" color="info.main">18 customers</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Low Risk</Typography>
                  <Typography variant="body2" color="success.main">45 customers</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Churn Prevention Recommendations
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Retention
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Focus on retaining high-value customers at risk of churning
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Priority:</Typography>
                      <Typography variant="body2">High</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Impact:</Typography>
                      <Typography variant="body2">High - will prevent revenue loss</Typography>
                    </Box>
                    <Button variant="outlined" size="small" fullWidth>
                      Implement Strategy
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Re-engagement Campaign
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Launch campaigns to re-engage disengaged customers
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Priority:</Typography>
                      <Typography variant="body2">Medium</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Impact:</Typography>
                      <Typography variant="body2">Medium - will improve engagement</Typography>
                    </Box>
                    <Button variant="outlined" size="small" fullWidth>
                      Launch Campaign
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Critical Alerts
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Error color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="High Churn Risk"
                      secondary="Overall churn risk is 75%. Immediate action required."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Critical Customers at Risk"
                      secondary="5 critical customers are at risk of churning"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Disengaged Customers"
                      secondary="15 customers are disengaged"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alert Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Critical</Typography>
                  <Typography variant="body2" color="error.main">1</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">High</Typography>
                  <Typography variant="body2" color="warning.main">2</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Medium</Typography>
                  <Typography variant="body2" color="info.main">3</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Low</Typography>
                  <Typography variant="body2" color="text.secondary">1</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 5 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Churn Trends
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trendAnalysisData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="newCustomers" stroke="#4caf50" strokeWidth={2} />
                        <Line type="monotone" dataKey="churnedCustomers" stroke="#f44336" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Value Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={trendAnalysisData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="avgCustomerValue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
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
        <DialogTitle>Churn Risk Analysis</DialogTitle>
        <DialogContent>
          {selectedAnalysis && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overall Churn Risk
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {selectedAnalysis.overallChurnRisk || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedAnalysis.overallChurnRisk || 0}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Risk Breakdown
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Customer Risk:</Typography>
                      <Typography variant="body2">75%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Behavior Risk:</Typography>
                      <Typography variant="body2">60%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Engagement Risk:</Typography>
                      <Typography variant="body2">80%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Risk Factors:</Typography>
                      <Typography variant="body2">70%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recommendations Dialog */}
      <Dialog open={recommendationsDialogOpen} onClose={() => setRecommendationsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Churn Prevention Recommendations</DialogTitle>
        <DialogContent>
          {selectedRecommendation && (
            <Grid container spacing={3}>
              {selectedRecommendation.map((rec: any, index: number) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {rec.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {rec.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Priority:</Typography>
                        <Typography variant="body2">{rec.priority}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Type:</Typography>
                        <Typography variant="body2">{rec.type}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2">Impact:</Typography>
                        <Typography variant="body2">{rec.impact}</Typography>
                      </Box>
                      <Button variant="outlined" size="small" fullWidth>
                        Implement Recommendation
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecommendationsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerts Dialog */}
      <Dialog open={alertsDialogOpen} onClose={() => setAlertsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Churn Prevention Alerts</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <List>
              {selectedAlert.map((alert: any, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {alert.type === 'critical' ? <Error color="error" /> :
                     alert.type === 'high' ? <Warning color="warning" /> :
                     <Info color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title}
                    secondary={alert.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customers Dialog */}
      <Dialog open={customersDialogOpen} onClose={() => setCustomersDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>At-Risk Customers</DialogTitle>
        <DialogContent>
          {selectedCustomers && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Total Spent</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCustomers.slice(0, 10).map((customer: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {customer.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer.priority_level}
                          size="small"
                          color={
                            customer.priority_level === 'critical' ? 'error' :
                            customer.priority_level === 'high' ? 'warning' :
                            customer.priority_level === 'medium' ? 'info' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{customer.risk_score || 0}</TableCell>
                      <TableCell>${customer.total_spent?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        {customer.last_activity ? new Date(customer.last_activity).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Retain">
                          <IconButton size="small">
                            <PersonAdd />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomersDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChurnPreventionDashboard;