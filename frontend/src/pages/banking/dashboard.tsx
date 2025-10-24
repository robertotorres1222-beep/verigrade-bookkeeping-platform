import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Alert, Card, CardContent, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import { styled } from '@mui/system';
import { AccountBalance, TrendingUp, TrendingDown, Warning, CheckCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logger from '../../utils/logger';

const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const AccountHealthCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderLeft: '4px solid',
}));

interface BankingDashboard {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  totalAvailable: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
    type: 'debit' | 'credit';
  }>;
  unreconciledTransactions: number;
  pendingTransactions: number;
  accountHealth: Array<{
    accountId: string;
    accountName: string;
    healthScore: number;
    issues: string[];
  }>;
  cashFlow: {
    inflow: number;
    outflow: number;
    netFlow: number;
    period: string;
  };
}

const BankingDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<BankingDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/banking/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboard(response.data.dashboard);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch banking dashboard');
        logger.error('Error fetching banking dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">No banking data available.</Alert>
      </Container>
    );
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle color="success" />;
    if (score >= 60) return <Warning color="warning" />;
    return <Warning color="error" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Banking Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard elevation={3}>
            <Box>
              <Typography variant="h6" color="textSecondary">Total Accounts</Typography>
              <Typography variant="h3">{dashboard.totalAccounts}</Typography>
              <Typography variant="body2" color="textSecondary">
                {dashboard.activeAccounts} active
              </Typography>
            </Box>
            <Button component={Link} to="/banking/accounts" variant="outlined" sx={{ mt: 2 }}>
              Manage Accounts
            </Button>
          </StatCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard elevation={3}>
            <Box>
              <Typography variant="h6" color="textSecondary">Total Balance</Typography>
              <Typography variant="h3" color="primary">
                ${dashboard.totalBalance.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Available: ${dashboard.totalAvailable.toLocaleString()}
              </Typography>
            </Box>
            <Button component={Link} to="/banking/transactions" variant="outlined" sx={{ mt: 2 }}>
              View Transactions
            </Button>
          </StatCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard elevation={3}>
            <Box>
              <Typography variant="h6" color="textSecondary">Cash Flow</Typography>
              <Typography variant="h4" color={dashboard.cashFlow.netFlow >= 0 ? 'success.main' : 'error.main'}>
                {dashboard.cashFlow.netFlow >= 0 ? '+' : ''}${dashboard.cashFlow.netFlow.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {dashboard.cashFlow.period}
              </Typography>
            </Box>
            <Button component={Link} to="/banking/reconciliation" variant="outlined" sx={{ mt: 2 }}>
              Reconcile
            </Button>
          </StatCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard elevation={3}>
            <Box>
              <Typography variant="h6" color="textSecondary">Reconciliation</Typography>
              <Typography variant="h4" color="warning.main">
                {dashboard.unreconciledTransactions}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {dashboard.pendingTransactions} pending
              </Typography>
            </Box>
            <Button component={Link} to="/banking/reconciliation" variant="contained" color="primary" sx={{ mt: 2 }}>
              Start Reconciliation
            </Button>
          </StatCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Health
            </Typography>
            {dashboard.accountHealth.length > 0 ? (
              <List>
                {dashboard.accountHealth.map((account) => (
                  <AccountHealthCard
                    key={account.accountId}
                    sx={{
                      borderLeftColor: getHealthColor(account.healthScore) === 'success' ? 'success.main' :
                                      getHealthColor(account.healthScore) === 'warning' ? 'warning.main' : 'error.main'
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1">{account.accountName}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Health Score: {account.healthScore}%
                        </Typography>
                        {account.issues.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {account.issues.map((issue, index) => (
                              <Chip key={index} label={issue} size="small" color="error" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Box>
                        )}
                      </Box>
                      {getHealthIcon(account.healthScore)}
                    </Box>
                  </AccountHealthCard>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No account health data available.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            {dashboard.recentTransactions.length > 0 ? (
              <List>
                {dashboard.recentTransactions.map((transaction) => (
                  <ListItem key={transaction.id} divider>
                    <ListItemText
                      primary={transaction.description}
                      secondary={new Date(transaction.date).toLocaleDateString()}
                    />
                    <Box textAlign="right">
                      <Typography
                        variant="body1"
                        color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No recent transactions.
              </Typography>
            )}
            <Button component={Link} to="/banking/transactions" sx={{ mt: 2 }}>
              View All Transactions
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button component={Link} to="/banking/accounts" variant="contained" color="primary">
          Manage Accounts
        </Button>
        <Button component={Link} to="/banking/reconciliation" variant="outlined">
          Start Reconciliation
        </Button>
        <Button component={Link} to="/banking/import" variant="outlined">
          Import Statement
        </Button>
      </Box>
    </Container>
  );
};

export default BankingDashboard;







