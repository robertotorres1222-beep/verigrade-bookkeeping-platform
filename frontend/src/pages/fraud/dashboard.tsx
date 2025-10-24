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
  Gavel,
  AccountBalance,
  Receipt,
  AttachMoney,
  Store,
  Psychology,
  Calculate,
  Assessment
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface FraudDashboardProps {}

const FraudDashboard: React.FC<FraudDashboardProps> = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [fraudDialogOpen, setFraudDialogOpen] = useState(false);
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [selectedFraud, setSelectedFraud] = useState<any>(null);
  const [resolutionForm, setResolutionForm] = useState<any>({
    notes: '',
    type: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fraud/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fraud dashboard');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunComprehensiveFraudDetection = async () => {
    try {
      const response = await fetch('/api/fraud/comprehensive', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to run comprehensive fraud detection');
      }

      const result = await response.json();
      alert(`Fraud detection completed. Found ${Object.keys(result.data).length} types of fraud.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDetectGhostEmployees = async () => {
    try {
      const response = await fetch('/api/fraud/ghost-employees', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to detect ghost employees');
      }

      const result = await response.json();
      alert(`Ghost employee detection completed. Found ${result.data.length} ghost employees.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDetectSplitTransactions = async () => {
    try {
      const response = await fetch('/api/fraud/split-transactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to detect split transactions');
      }

      const result = await response.json();
      alert(`Split transaction detection completed. Found ${result.data.length} split transactions.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDetectDuplicateInvoices = async () => {
    try {
      const response = await fetch('/api/fraud/duplicate-invoices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to detect duplicate invoices');
      }

      const result = await response.json();
      alert(`Duplicate invoice detection completed. Found ${result.data.length} duplicate invoices.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDetectRoundNumberTransactions = async () => {
    try {
      const response = await fetch('/api/fraud/round-number-transactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to detect round number transactions');
      }

      const result = await response.json();
      alert(`Round number transaction detection completed. Found ${result.data.length} round number transactions.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyVendorExistence = async () => {
    try {
      const response = await fetch('/api/fraud/suspicious-vendors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify vendor existence');
      }

      const result = await response.json();
      alert(`Vendor verification completed. Found ${result.data.length} suspicious vendors.`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResolveFraudDetection = async () => {
    try {
      const response = await fetch(`/api/fraud/${selectedFraud.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(resolutionForm)
      });

      if (!response.ok) {
        throw new Error('Failed to resolve fraud detection');
      }

      alert('Fraud detection resolved successfully');
      setResolutionDialogOpen(false);
      setResolutionForm({ notes: '', type: '' });
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
        No fraud detection data available
      </Alert>
    );
  }

  const fraudStatsData = [
    { name: 'Total Detections', value: dashboardData.fraudStats?.total_detections || 0, color: '#f44336' },
    { name: 'High Risk', value: dashboardData.fraudStats?.high_risk || 0, color: '#ff9800' },
    { name: 'Medium Risk', value: dashboardData.fraudStats?.medium_risk || 0, color: '#2196f3' },
    { name: 'Low Risk', value: dashboardData.fraudStats?.low_risk || 0, color: '#4caf50' }
  ];

  const recentDetectionsData = dashboardData.recentDetections?.map((detection: any) => ({
    id: detection.id,
    fraudType: detection.fraud_type,
    entityType: detection.entity_type,
    severity: detection.severity,
    description: detection.description,
    detectedAt: new Date(detection.detected_at).toLocaleDateString(),
    isResolved: detection.is_resolved
  })) || [];

  const fraudSummaryData = dashboardData.fraudSummary?.map((summary: any) => ({
    fraudType: summary.fraud_type,
    severity: summary.severity,
    count: summary.count,
    avgRiskScore: summary.avg_risk_score
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Advanced Fraud Detection
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
            variant="contained"
            startIcon={<Security />}
            onClick={handleRunComprehensiveFraudDetection}
          >
            Run Comprehensive Detection
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Security color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Detections</Typography>
              </Box>
              <Typography variant="h4" color="error">
                {dashboardData.fraudStats?.total_detections || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">High Risk</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {dashboardData.fraudStats?.high_risk || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Resolved</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {dashboardData.fraudStats?.resolved || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Error color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Unresolved</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {dashboardData.fraudStats?.unresolved || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detection Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<Person />}
            onClick={handleDetectGhostEmployees}
            fullWidth
          >
            Detect Ghost Employees
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<AttachMoney />}
            onClick={handleDetectSplitTransactions}
            fullWidth
          >
            Detect Split Transactions
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={handleDetectDuplicateInvoices}
            fullWidth
          >
            Detect Duplicate Invoices
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<Calculate />}
            onClick={handleDetectRoundNumberTransactions}
            fullWidth
          >
            Detect Round Numbers
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<Store />}
            onClick={handleVerifyVendorExistence}
            fullWidth
          >
            Verify Vendors
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<Psychology />}
            onClick={() => setFraudDialogOpen(true)}
            fullWidth
          >
            Benford Analysis
          </Button>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Fraud Detections" />
          <Tab label="Ghost Employees" />
          <Tab label="Benford Analysis" />
          <Tab label="Risk Analysis" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fraud Detection Statistics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fraudStatsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fraudStatsData.map((entry, index) => (
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
                  Recent Detections
                </Typography>
                <List>
                  {recentDetectionsData.slice(0, 5).map((detection: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Security color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={detection.description}
                        secondary={`${detection.fraudType} - ${detection.detectedAt}`}
                      />
                      <Chip
                        label={detection.severity}
                        size="small"
                        color={detection.severity === 'high' ? 'error' : 
                               detection.severity === 'medium' ? 'warning' : 'default'}
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
              Fraud Detections
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Detected At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentDetectionsData.map((detection: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          label={detection.fraudType}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {detection.entityType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={detection.severity}
                          size="small"
                          color={detection.severity === 'high' ? 'error' : 
                                 detection.severity === 'medium' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {detection.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={detection.isResolved ? 'Resolved' : 'Open'}
                          size="small"
                          color={detection.isResolved ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{detection.detectedAt}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Resolve">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedFraud(detection);
                              setResolutionDialogOpen(true);
                            }}
                          >
                            <CheckCircle />
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
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ghost Employee Detection
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Ghost Employee Statistics
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Ghost Employees</Typography>
                      <Typography variant="body2">12</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">High Risk</Typography>
                      <Typography variant="body2">5</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Medium Risk</Typography>
                      <Typography variant="body2">4</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Low Risk</Typography>
                      <Typography variant="body2">3</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Risk Analysis
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Average Risk Score</Typography>
                      <Typography variant="body2">75.2</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Salary at Risk</Typography>
                      <Typography variant="body2">$450,000</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Last Detection</Typography>
                      <Typography variant="body2">2 hours ago</Typography>
                    </Box>
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
              Benford's Law Analysis
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Analysis Results
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Analyses</Typography>
                      <Typography variant="body2">24</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Significant Deviations</Typography>
                      <Typography variant="body2">3</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Average Chi-Square</Typography>
                      <Typography variant="body2">12.45</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Average P-Value</Typography>
                      <Typography variant="body2">0.023</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Data Type Analysis
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <AttachMoney color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Transactions: 8 analyses" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Receipt color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Expenses: 6 analyses" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AccountBalance color="info" />
                        </ListItemIcon>
                        <ListItemText primary="Invoices: 5 analyses" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Gavel color="warning" />
                        </ListItemIcon>
                        <ListItemText primary="Payments: 5 analyses" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Risk Analysis
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Risk Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={[
                        { date: '2024-01-01', high: 5, medium: 8, low: 12 },
                        { date: '2024-01-02', high: 3, medium: 10, low: 15 },
                        { date: '2024-01-03', high: 7, medium: 6, low: 18 },
                        { date: '2024-01-04', high: 4, medium: 9, low: 14 },
                        { date: '2024-01-05', high: 6, medium: 7, low: 16 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="high" stroke="#f44336" strokeWidth={2} />
                        <Line type="monotone" dataKey="medium" stroke="#ff9800" strokeWidth={2} />
                        <Line type="monotone" dataKey="low" stroke="#4caf50" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Risk Summary
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Overall Risk Score</Typography>
                      <Typography variant="body2" fontWeight="bold">65/100</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">High Risk Items</Typography>
                      <Typography variant="body2">12</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Medium Risk Items</Typography>
                      <Typography variant="body2">18</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Low Risk Items</Typography>
                      <Typography variant="body2">25</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Resolution Dialog */}
      <Dialog open={resolutionDialogOpen} onClose={() => setResolutionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Resolve Fraud Detection</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Resolution Notes"
            multiline
            rows={3}
            value={resolutionForm.notes}
            onChange={(e) => setResolutionForm({ ...resolutionForm, notes: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Resolution Type</InputLabel>
            <Select
              value={resolutionForm.type}
              onChange={(e) => setResolutionForm({ ...resolutionForm, type: e.target.value })}
            >
              <MenuItem value="false_positive">False Positive</MenuItem>
              <MenuItem value="confirmed_fraud">Confirmed Fraud</MenuItem>
              <MenuItem value="investigation_complete">Investigation Complete</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolutionDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolveFraudDetection} variant="contained">
            Resolve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Benford Analysis Dialog */}
      <Dialog open={fraudDialogOpen} onClose={() => setFraudDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Benford's Law Analysis</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Benford's Law analysis helps detect potential data manipulation by analyzing the distribution of first digits in financial data.
          </Typography>
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="outlined"
              startIcon={<AttachMoney />}
              onClick={() => {/* Perform analysis */}}
            >
              Analyze Transactions
            </Button>
            <Button
              variant="outlined"
              startIcon={<Receipt />}
              onClick={() => {/* Perform analysis */}}
            >
              Analyze Expenses
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccountBalance />}
              onClick={() => {/* Perform analysis */}}
            >
              Analyze Invoices
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFraudDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FraudDashboard;