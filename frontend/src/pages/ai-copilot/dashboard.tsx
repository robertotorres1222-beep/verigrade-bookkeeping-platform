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
  GradeOutlined
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AICoPilotDashboardProps {}

const AICoPilotDashboard: React.FC<AICoPilotDashboardProps> = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [recommendationsDialogOpen, setRecommendationsDialogOpen] = useState(false);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [predictionsDialogOpen, setPredictionsDialogOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [feedbackForm, setFeedbackForm] = useState<any>({
    rating: 0,
    feedback: '',
    isHelpful: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-copilot/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI Co-Pilot dashboard');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    try {
      const response = await fetch('/api/ai-copilot/insights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get AI insights');
      }

      const result = await response.json();
      setSelectedInsight(result.data);
      setInsightsDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetRecommendations = async () => {
    try {
      const response = await fetch('/api/ai-copilot/recommendations', {
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
      const response = await fetch('/api/ai-copilot/alerts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get AI alerts');
      }

      const result = await response.json();
      setSelectedAlert(result.data);
      setAlertsDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetPredictions = async () => {
    try {
      const response = await fetch('/api/ai-copilot/predictions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get AI predictions');
      }

      const result = await response.json();
      setSelectedPrediction(result.data);
      setPredictionsDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const response = await fetch('/api/ai-copilot/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(feedbackForm)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      alert('Feedback submitted successfully');
      setFeedbackForm({ rating: 0, feedback: '', isHelpful: null });
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
        No AI Co-Pilot data available
      </Alert>
    );
  }

  const insightsData = dashboardData.insights || {};
  const recentAnalysesData = dashboardData.recentAnalyses?.map((analysis: any) => ({
    id: analysis.id,
    type: analysis.analysis_type,
    score: analysis.overall_score,
    confidence: analysis.confidence_score,
    analyzedAt: new Date(analysis.analyzed_at).toLocaleDateString(),
    data: analysis.analysis_data
  })) || [];

  const recommendationsData = dashboardData.recommendations?.map((rec: any) => ({
    id: rec.id,
    type: rec.recommendation_type,
    priority: rec.priority,
    title: rec.title,
    description: rec.description,
    action: rec.action_required,
    impact: rec.expected_impact,
    confidence: rec.confidence_score,
    isImplemented: rec.is_implemented
  })) || [];

  const trendAnalysisData = dashboardData.trendAnalysis?.map((trend: any) => ({
    week: new Date(trend.week).toLocaleDateString(),
    analyses: trend.analyses_count,
    avgScore: trend.avg_score,
    avgConfidence: trend.avg_confidence
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          AI Co-Pilot Dashboard
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
            onClick={handleGetInsights}
            sx={{ mr: 1 }}
          >
            Get Insights
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
            startIcon={<AutoAwesome />}
            onClick={handleGetPredictions}
          >
            Predictions
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Psychology color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Overall Score</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {insightsData.overallScore || 0}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={insightsData.overallScore || 0}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Lightbulb color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Recommendations</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {recommendationsData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recommendationsData.filter((r: any) => !r.isImplemented).length} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Notifications color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Alerts</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1 critical, 2 high
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AutoAwesome color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Confidence</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {Math.round(insightsData.financialInsights?.confidenceScore || 0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI confidence level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Insights" />
          <Tab label="Recommendations" />
          <Tab label="Alerts" />
          <Tab label="Predictions" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Score Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    { category: 'Financial', score: insightsData.financialInsights?.score || 0 },
                    { category: 'Operational', score: insightsData.operationalInsights?.score || 0 },
                    { category: 'Strategic', score: insightsData.strategicInsights?.score || 0 },
                    { category: 'Risk', score: insightsData.riskInsights?.score || 0 }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
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
                        secondary={`Score: ${analysis.score} - Confidence: ${analysis.confidence}% - ${analysis.analyzedAt}`}
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Insights
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Revenue</Typography>
                  <Typography variant="body2">${insightsData.financialInsights?.totalRevenue?.toLocaleString() || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Expenses</Typography>
                  <Typography variant="body2">${insightsData.financialInsights?.totalExpenses?.toLocaleString() || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Net Cash Flow</Typography>
                  <Typography variant="body2" color={insightsData.financialInsights?.netCashFlow >= 0 ? 'success.main' : 'error.main'}>
                    ${insightsData.financialInsights?.netCashFlow?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Profit Margin</Typography>
                  <Typography variant="body2">{insightsData.financialInsights?.profitMargin?.toFixed(1) || 0}%</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Cash Runway</Typography>
                  <Typography variant="body2">{insightsData.financialInsights?.cashRunway?.toFixed(1) || 0} days</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Operational Insights
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Total Employees</Typography>
                  <Typography variant="body2">{insightsData.operationalInsights?.totalEmployees || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Task Completion Rate</Typography>
                  <Typography variant="body2">{insightsData.operationalInsights?.taskCompletionRate?.toFixed(1) || 0}%</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Overdue Task Rate</Typography>
                  <Typography variant="body2">{insightsData.operationalInsights?.overdueTaskRate?.toFixed(1) || 0}%</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Time Efficiency</Typography>
                  <Typography variant="body2">{(insightsData.operationalInsights?.timeEfficiency * 100)?.toFixed(1) || 0}%</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Total Customers</Typography>
                  <Typography variant="body2">{insightsData.strategicInsights?.uniqueCustomers || 0}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Recommendations
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Impact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendationsData.map((rec: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          label={rec.type}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rec.priority}
                          size="small"
                          color={
                            rec.priority === 'critical' ? 'error' :
                            rec.priority === 'high' ? 'warning' :
                            rec.priority === 'medium' ? 'info' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {rec.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {rec.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {rec.action}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {rec.impact}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rec.isImplemented ? 'Implemented' : 'Pending'}
                          size="small"
                          color={rec.isImplemented ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Implement">
                          <IconButton size="small">
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Feedback">
                          <IconButton size="small">
                            <Feedback />
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

      {activeTab === 3 && (
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
                      primary="Negative Cash Flow"
                      secondary="Company is burning cash. Immediate action required."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="High Overdue Task Rate"
                      secondary="Overdue task rate is 25%. Address capacity issues."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Low Profit Margin"
                      secondary="Profit margin is 8%. Review pricing strategy."
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

      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Predictions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue Prediction
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={[
                        { month: 'Jan', current: 100000, predicted: 110000 },
                        { month: 'Feb', current: 120000, predicted: 132000 },
                        { month: 'Mar', current: 140000, predicted: 154000 },
                        { month: 'Apr', current: 160000, predicted: 176000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="current" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Growth Prediction
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={[
                        { month: 'Jan', customers: 50 },
                        { month: 'Feb', customers: 65 },
                        { month: 'Mar', customers: 80 },
                        { month: 'Apr', customers: 95 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="customers" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 5 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Trend Analysis
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trendAnalysisData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="avgScore" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="avgConfidence" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Analysis Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Financial', value: 25, color: '#8884d8' },
                            { name: 'Operational', value: 30, color: '#82ca9d' },
                            { name: 'Strategic', value: 20, color: '#ffc658' },
                            { name: 'Risk', value: 25, color: '#ff7300' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Financial', value: 25, color: '#8884d8' },
                            { name: 'Operational', value: 30, color: '#82ca9d' },
                            { name: 'Strategic', value: 20, color: '#ffc658' },
                            { name: 'Risk', value: 25, color: '#ff7300' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Insights Dialog */}
      <Dialog open={insightsDialogOpen} onClose={() => setInsightsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Insights</DialogTitle>
        <DialogContent>
          {selectedInsight && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Financial Insights
                    </Typography>
                    <Typography variant="body2">
                      {selectedInsight.financialInsights?.description || 'No financial insights available'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Operational Insights
                    </Typography>
                    <Typography variant="body2">
                      {selectedInsight.operationalInsights?.description || 'No operational insights available'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInsightsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recommendations Dialog */}
      <Dialog open={recommendationsDialogOpen} onClose={() => setRecommendationsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>AI Recommendations</DialogTitle>
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
        <DialogTitle>AI Alerts</DialogTitle>
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

      {/* Predictions Dialog */}
      <Dialog open={predictionsDialogOpen} onClose={() => setPredictionsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>AI Predictions</DialogTitle>
        <DialogContent>
          {selectedPrediction && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue Prediction
                    </Typography>
                    <Typography variant="h4" color="primary">
                      ${selectedPrediction.revenue?.predicted?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {Math.round((selectedPrediction.revenue?.confidence || 0) * 100)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Prediction
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {selectedPrediction.customers?.predicted || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {Math.round((selectedPrediction.customers?.confidence || 0) * 100)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPredictionsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AICoPilotDashboard;