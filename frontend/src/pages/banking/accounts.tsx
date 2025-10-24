import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Sync as SyncIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logger from '../../utils/logger';

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'loan' | 'investment' | 'other';
  currency: string;
  isActive: boolean;
  lastSyncAt?: string;
  balance: number;
  availableBalance?: number;
  creditLimit?: number;
  interestRate?: number;
  createdAt: string;
  updatedAt: string;
}

const BankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    accountType: 'checking',
    currency: 'USD',
    routingNumber: '',
    metadata: {}
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/banking/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data.accounts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bank accounts');
      logger.error('Error fetching bank accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (account?: BankAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        accountType: account.accountType,
        currency: account.currency,
        routingNumber: '',
        metadata: {}
      });
    } else {
      setEditingAccount(null);
      setFormData({
        accountName: '',
        accountNumber: '',
        bankName: '',
        accountType: 'checking',
        currency: 'USD',
        routingNumber: '',
        metadata: {}
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingAccount) {
        await axios.put(`/api/banking/accounts/${editingAccount.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/banking/accounts', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      handleCloseDialog();
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save bank account');
      logger.error('Error saving bank account:', err);
    }
  };

  const handleSyncAccount = async (accountId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/banking/accounts/${accountId}/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync account');
      logger.error('Error syncing account:', err);
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking': return 'primary';
      case 'savings': return 'success';
      case 'credit': return 'warning';
      case 'loan': return 'error';
      case 'investment': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Bank Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Account
        </Button>
      </Box>

      {accounts.length > 0 ? (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Last Sync</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {account.accountName}
                    </Typography>
                  </TableCell>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell>
                    <Chip
                      label={account.accountType}
                      color={getAccountTypeColor(account.accountType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    ****{account.accountNumber.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(account.balance, account.currency)}
                    </Typography>
                    {account.availableBalance && account.availableBalance !== account.balance && (
                      <Typography variant="body2" color="textSecondary">
                        Available: {formatCurrency(account.availableBalance, account.currency)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.lastSyncAt ? (
                      new Date(account.lastSyncAt).toLocaleDateString()
                    ) : (
                      'Never'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.isActive ? 'Active' : 'Inactive'}
                      color={account.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleSyncAccount(account.id)}
                      color="primary"
                      title="Sync Account"
                    >
                      <SyncIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenDialog(account)}
                      color="primary"
                      title="Edit Account"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      title="Delete Account"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Bank Accounts
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Get started by adding your first bank account to begin tracking your finances.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Account
          </Button>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Account Name"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Account Number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Bank Name"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Account Type"
            value={formData.accountType}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            margin="normal"
            required
          >
            <MenuItem value="checking">Checking</MenuItem>
            <MenuItem value="savings">Savings</MenuItem>
            <MenuItem value="credit">Credit Card</MenuItem>
            <MenuItem value="loan">Loan</MenuItem>
            <MenuItem value="investment">Investment</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Routing Number"
            value={formData.routingNumber}
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAccount ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BankAccounts;







