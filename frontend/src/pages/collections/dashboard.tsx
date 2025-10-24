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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Email,
  Phone,
  Schedule,
  AttachMoney,
  People,
  Assessment,
  Refresh,
  Download,
  Send
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';

interface CollectionsDashboard {
  agingBuckets: {
    current: number;
    days31to60: number;
    days61to90: number;
    over90: number;
    total: number;
  };
  dso: number;
  collectionRate: number;
  badDebtRate: number;
  totalOutstanding: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  recentActivity: any[];
  successMetrics: {
    collectionRate: number;
    dsoImprovement: number;
    badDebtReduction: number;
  };
}

interface CustomerPriority {
  customerId: string;
  customerName: string;
  outstandingAmount: number;
  daysOverdue: number;
  priority: 'high' | 'medium' | 'low';
  riskFactors: string[];
  lastPaymentDate: Date | null;
  recommendedActions: string[];
}

const CollectionsDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<CollectionsDashboard | null>(null);
  const [priorities, setPriorities] = useState<CustomerPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
    fetchPriorities();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/collections/company-123/dashboard');
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Error fetching collections dashboard:', error);
      setError('Failed to load collections dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await api.get('/api/collections/company-123/priorities');
      setPriorities(response.data.data);
    } catch (error) {
      console.error('Error fetching priorities:', error);
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Warning />;
      case 'medium': return <Schedule />;
      case 'low': return <CheckCircle />;
      default: return <Assessment />;
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
          <Button color="inherit" size="small" onClick={fetchDashboard}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          No collections data available.
        </Alert>
      </Container>
    );
  }

  const agingData = [
    { name: 'Current (0-30)', amount: dashboard.agingBuckets.current, color: '#4caf50' },
    { name: '31-60 Days', amount: dashboard.agingBuckets.days31to60, color: '#ff9800' },
    { name: '61-90 Days', amount: dashboard.agingBuckets.days61to90, color: '#ff5722' },
    { name: '90+ Days', amount: dashboard.agingBuckets.over90, color: '#f44336' }
  ];

  const priorityData = [
    { name: 'High Priority', value: dashboard.highPriority, color: '#f44336' },
    { name: 'Medium Priority', value: dashboard.mediumPriority, color: '#ff9800' },
    { name: 'Low Priority', value: dashboard.lowPriority, color: '#4caf50' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Collections Dashboard
        </Typography>
        <Box>
          <IconButton onClick={fetchDashboard} color="primary">
            <Refresh />
          </IconButton>
          <IconButton color="primary">
            <Download />
          </IconButton>
          <Button variant="contained" startIcon={<Send />}>
            Process Dunning
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
                <Typography variant="h6">Total Outstanding</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(dashboard.totalOutstanding)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">DSO</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {dashboard.dso} days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard.successMetrics.dsoImprovement > 0 ? '+' : ''}{dashboard.successMetrics.dsoImprovement} vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Collection Rate</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {dashboard.collectionRate}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboard.collectionRate} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Bad Debt Rate</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {dashboard.badDebtRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard.successMetrics.badDebtReduction > 0 ? '+' : ''}{dashboard.successMetrics.badDebtReduction}% improvement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AR Aging Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AR Aging Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Priority Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
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

      {/* Customer Priorities */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            High Priority Customers
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Outstanding</TableCell>
                  <TableCell align="right">Days Overdue</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Risk Factors</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {priorities.slice(0, 10).map((customer) => (
                  <TableRow key={customer.customerId}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {customer.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="primary">
                        {formatCurrency(customer.outstandingAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {customer.daysOverdue} days
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.priority.toUpperCase()}
                        color={getPriorityColor(customer.priority)}
                        size="small"
                        icon={getPriorityIcon(customer.priority)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        {customer.riskFactors.slice(0, 2).map((factor, index) => (
                          <Chip
                            key={index}
                            label={factor}
                            size="small"
                            color="warning"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {customer.riskFactors.length > 2 && (
                          <Chip
                            label={`+${customer.riskFactors.length - 2} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Tooltip title="Send Email">
                          <IconButton size="small" color="primary">
                            <Email />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Call Customer">
                          <IconButton size="small" color="primary">
                            <Phone />
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

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Collections Activity
          </Typography>
          <List>
            {dashboard.recentActivity.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    {activity.activityType === 'email_sent' ? <Email /> : <Phone />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={`${activity.customer?.name} - ${new Date(activity.createdAt).toLocaleDateString()}`}
                  />
                  <Chip
                    label={activity.priority}
                    size="small"
                    color={activity.priority === 'high' ? 'error' : activity.priority === 'medium' ? 'warning' : 'success'}
                  />
                </ListItem>
                {index < dashboard.recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CollectionsDashboard;





