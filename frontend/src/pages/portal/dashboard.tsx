import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Paper,
  Divider
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  AttachFile as DocumentIcon,
  Message as MessageIcon,
  Notifications as NotificationIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface DashboardData {
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
  }>;
  recentDocuments: Array<{
    id: string;
    name: string;
    type: string;
    createdAt: string;
  }>;
  recentMessages: Array<{
    id: string;
    subject: string;
    isRead: boolean;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
  unreadNotifications: number;
  totalOutstanding: number;
  totalPaid: number;
}

const ClientDashboard: React.FC = () => {
  const router = useRouter();
  const { clientId } = router.query;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      fetchDashboardData();
    }
  }, [clientId]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/client-portal/${clientId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'sent': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Failed to load dashboard data</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Client Portal Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Outstanding</Typography>
              </Box>
              <Typography variant="h4" color="error">
                {formatCurrency(dashboardData.totalOutstanding)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PaymentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Paid</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(dashboardData.totalPaid)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {dashboardData.unreadNotifications}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ReceiptIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Invoices</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {dashboardData.recentInvoices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Invoices</Typography>
                <Button 
                  size="small" 
                  onClick={() => router.push(`/portal/${clientId}/invoices`)}
                >
                  View All
                </Button>
              </Box>
              <List>
                {dashboardData.recentInvoices.map((invoice) => (
                  <ListItem key={invoice.id} divider>
                    <ListItemIcon>
                      <ReceiptIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={invoice.invoiceNumber}
                      secondary={`Due: ${formatDate(invoice.dueDate)}`}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {formatCurrency(invoice.amount)}
                      </Typography>
                      <Chip 
                        label={invoice.status} 
                        color={getStatusColor(invoice.status) as any}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Documents</Typography>
                <Button 
                  size="small" 
                  onClick={() => router.push(`/portal/${clientId}/documents`)}
                >
                  View All
                </Button>
              </Box>
              <List>
                {dashboardData.recentDocuments.map((document) => (
                  <ListItem key={document.id} divider>
                    <ListItemIcon>
                      <DocumentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={document.name}
                      secondary={`Type: ${document.type} • ${formatDate(document.createdAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Messages */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Messages</Typography>
                <Button 
                  size="small" 
                  onClick={() => router.push(`/portal/${clientId}/messages`)}
                >
                  View All
                </Button>
              </Box>
              <List>
                {dashboardData.recentMessages.map((message) => (
                  <ListItem key={message.id} divider>
                    <ListItemIcon>
                      <Badge 
                        color="primary" 
                        variant="dot" 
                        invisible={message.isRead}
                      >
                        <MessageIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={message.subject}
                      secondary={formatDate(message.createdAt)}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Activity</Typography>
                <Button 
                  size="small" 
                  onClick={() => router.push(`/portal/${clientId}/activity`)}
                >
                  View All
                </Button>
              </Box>
              <List>
                {dashboardData.recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemIcon>
                      <ScheduleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={formatDate(activity.createdAt)}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;










