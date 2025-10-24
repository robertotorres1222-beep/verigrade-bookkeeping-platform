import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  AttachMoney,
  Savings,
  Assessment,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  PlayArrow,
  Pause,
  Stop,
  ExpandMore
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';

interface VendorAnalysis {
  totalSpend: number;
  vendorCount: number;
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    spend: number;
    percentage: number;
  }>;
  optimizationOpportunities: VendorOptimization[];
  totalPotentialSavings: number;
  savingsByCategory: Array<{
    category: string;
    savings: number;
    percentage: number;
  }>;
  peerComparison: {
    industryAverage: number;
    topQuartile: number;
    yourSpend: number;
    percentile: number;
  };
}

interface VendorOptimization {
  vendorId: string;
  vendorName: string;
  currentSpend: number;
  potentialSavings: number;
  savingsPercentage: number;
  optimizationType: string;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  implementationEffort: 'low' | 'medium' | 'high';
  estimatedROI: number;
}

interface SavingsOpportunity {
  id: string;
  vendorId: string;
  opportunityType: string;
  title: string;
  description: string;
  currentCost: number;
  potentialSavings: number;
  savingsPercentage: number;
  implementationSteps: string[];
  timeline: string;
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
  estimatedROI: number;
  vendorName: string;
  category: string;
  status: 'identified' | 'in_progress' | 'completed' | 'cancelled';
}

const VendorOptimization: React.FC = () => {
  const [analysis, setAnalysis] = useState<VendorAnalysis | null>(null);
  const [opportunities, setOpportunities] = useState<SavingsOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<SavingsOpportunity | null>(null);

  useEffect(() => {
    fetchAnalysis();
    fetchOpportunities();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/vendor-optimization/company-123/analysis');
      setAnalysis(response.data.data);
    } catch (error) {
      console.error('Error fetching vendor analysis:', error);
      setError('Failed to load vendor analysis');
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await api.get('/api/vendor-optimization/company-123/opportunities');
      setOpportunities(response.data.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'identified': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchAnalysis}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!analysis) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          No vendor analysis data available.
        </Alert>
      </Container>
    );
  }

  const savingsData = analysis.savingsByCategory.map(cat => ({
    name: cat.category.replace('_', ' ').toUpperCase(),
    value: cat.savings,
    percentage: cat.percentage
  }));

  const topVendorsData = analysis.topVendors.slice(0, 5).map(vendor => ({
    name: vendor.vendorName,
    spend: vendor.spend,
    percentage: vendor.percentage
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Vendor Spend Optimization
        </Typography>
        <Box>
          <IconButton onClick={fetchAnalysis} color="primary">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Opportunity
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Spend</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(analysis.totalSpend)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Savings color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Potential Savings</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(analysis.totalPotentialSavings)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((analysis.totalPotentialSavings / analysis.totalSpend) * 100).toFixed(1)}% of total spend
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Assessment color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Vendors</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {analysis.vendorCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Peer Percentile</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {analysis.peerComparison.percentile}th
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs industry average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Savings by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={savingsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {savingsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Vendors by Spend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topVendorsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="spend" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Optimization Opportunities */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Optimization Opportunities
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="right">Current Spend</TableCell>
                  <TableCell align="right">Potential Savings</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Effort</TableCell>
                  <TableCell align="right">ROI</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analysis.optimizationOpportunities.map((opportunity) => (
                  <TableRow key={opportunity.vendorId}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {opportunity.vendorName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="primary">
                        {formatCurrency(opportunity.currentSpend)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="success.main">
                        {formatCurrency(opportunity.potentialSavings)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {opportunity.savingsPercentage.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={opportunity.optimizationType.replace('_', ' ').toUpperCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={opportunity.priority.toUpperCase()}
                        color={getPriorityColor(opportunity.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={opportunity.implementationEffort.toUpperCase()}
                        color={getRiskColor(opportunity.implementationEffort)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {(opportunity.estimatedROI * 100).toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Start Implementation">
                          <IconButton size="small" color="success">
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Savings Opportunities */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Savings Opportunities
          </Typography>
          {opportunities.map((opportunity) => (
            <Accordion key={opportunity.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {opportunity.title}
                  </Typography>
                  <Box display="flex" gap={1} mr={2}>
                    <Chip
                      label={opportunity.status.toUpperCase()}
                      color={getStatusColor(opportunity.status)}
                      size="small"
                    />
                    <Chip
                      label={opportunity.priority.toUpperCase()}
                      color={getPriorityColor(opportunity.priority)}
                      size="small"
                    />
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(opportunity.potentialSavings)}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {opportunity.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Implementation Steps
                    </Typography>
                    <List dense>
                      {opportunity.implementationSteps.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircle fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Financial Impact
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Current Cost:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(opportunity.currentCost)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Potential Savings:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(opportunity.potentialSavings)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Savings %:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {opportunity.savingsPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Estimated ROI:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {(opportunity.estimatedROI * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrow />}
                        disabled={opportunity.status === 'completed'}
                      >
                        Start
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VendorOptimization;






