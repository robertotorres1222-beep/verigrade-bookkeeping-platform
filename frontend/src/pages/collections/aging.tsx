import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
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
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Email,
  Phone,
  Schedule,
  AttachMoney,
  Refresh,
  Print
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

interface ARAgingBucket {
  current: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
}

interface AgingInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: string;
  priority: 'high' | 'medium' | 'low';
}

const ARAgingReport: React.FC = () => {
  const [agingBuckets, setAgingBuckets] = useState<ARAgingBucket | null>(null);
  const [invoices, setInvoices] = useState<AgingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchAgingData();
  }, []);

  const fetchAgingData = async () => {
    try {
      setLoading(true);
      const [agingResponse, invoicesResponse] = await Promise.all([
        api.get('/api/collections/company-123/aging'),
        api.get('/api/collections/company-123/invoices')
      ]);
      
      setAgingBuckets(agingResponse.data.data);
      setInvoices(invoicesResponse.data.data);
    } catch (error) {
      console.error('Error fetching aging data:', error);
      setError('Failed to load AR aging data');
    } finally {
      setLoading(false);
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
      case 'overdue': return 'error';
      case 'sent': return 'warning';
      case 'paid': return 'success';
      default: return 'default';
    }
  };

  const getDaysOverdueColor = (days: number) => {
    if (days > 90) return '#f44336';
    if (days > 60) return '#ff5722';
    if (days > 30) return '#ff9800';
    return '#4caf50';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || invoice.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const agingData = agingBuckets ? [
    { name: 'Current (0-30)', amount: agingBuckets.current, color: '#4caf50' },
    { name: '31-60 Days', amount: agingBuckets.days31to60, color: '#ff9800' },
    { name: '61-90 Days', amount: agingBuckets.days61to90, color: '#ff5722' },
    { name: '90+ Days', amount: agingBuckets.over90, color: '#f44336' }
  ] : [];

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
          <Button color="inherit" size="small" onClick={fetchAgingData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          AR Aging Report
        </Typography>
        <Box>
          <IconButton onClick={fetchAgingData} color="primary">
            <Refresh />
          </IconButton>
          <IconButton color="primary">
            <Download />
          </IconButton>
          <IconButton color="primary">
            <Print />
          </IconButton>
        </Box>
      </Box>

      {/* Aging Summary */}
      {agingBuckets && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AR Aging Summary
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
                  Aging Buckets
                </Typography>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Current (0-30 days)</Typography>
                    <Typography variant="body2" color="success.main">
                      {formatCurrency(agingBuckets.current)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">31-60 days</Typography>
                    <Typography variant="body2" color="warning.main">
                      {formatCurrency(agingBuckets.days31to60)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">61-90 days</Typography>
                    <Typography variant="body2" color="error.main">
                      {formatCurrency(agingBuckets.days61to90)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">90+ days</Typography>
                    <Typography variant="body2" color="error.main">
                      {formatCurrency(agingBuckets.over90)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      {formatCurrency(agingBuckets.total)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search customers or invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <Button variant="outlined" startIcon={<FilterList />}>
              More Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Outstanding Invoices ({filteredInvoices.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Days Overdue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Typography variant="subtitle2" color="primary">
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="primary">
                        {formatCurrency(invoice.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${invoice.daysOverdue} days`}
                        size="small"
                        sx={{
                          backgroundColor: getDaysOverdueColor(invoice.daysOverdue),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status.toUpperCase()}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.priority.toUpperCase()}
                        color={getPriorityColor(invoice.priority)}
                        size="small"
                      />
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
                        <Tooltip title="Schedule Follow-up">
                          <IconButton size="small" color="primary">
                            <Schedule />
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
    </Container>
  );
};

export default ARAgingReport;









