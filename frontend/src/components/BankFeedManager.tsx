import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
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
  Snackbar,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Grid,
  Divider,
  LinearProgress,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  AccountBalance,
  Sync,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  Settings,
  FilterList,
  Download,
  Upload,
  Timeline,
  AttachMoney,
  Schedule,
  Rule,
  ExpandMore,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';

interface BankAccount {
  id: string;
  userId: string;
  accountId: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  bankName: string;
  lastFourDigits: string;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface BankTransaction {
  id: string;
  accountId: string;
  externalId: string;
  amount: number;
  description: string;
  date: Date;
  type: 'debit' | 'credit';
  category?: string;
  subcategory?: string;
  merchant?: string;
  location?: string;
  isPending: boolean;
  isReconciled: boolean;
  isDuplicate: boolean;
  confidence: number;
  rawData: any;
  createdAt: Date;
  updatedAt: Date;
}

interface BankFeedRule {
  id: string;
  userId: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
    value: string | number;
  }>;
  actions: Array<{
    type: 'categorize' | 'tag' | 'flag' | 'skip';
    value: string;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SyncResult {
  success: boolean;
  transactionsImported: number;
  transactionsUpdated: number;
  transactionsSkipped: number;
  errors: string[];
  lastSyncAt: Date;
  nextSyncAt: Date;
}

interface BankFeedManagerProps {
  accounts: BankAccount[];
  transactions: BankTransaction[];
  rules: BankFeedRule[];
  onAccountConnect: (bankName: string, credentials: any) => void;
  onAccountDisconnect: (accountId: string) => void;
  onSyncAccount: (accountId: string) => void;
  onRuleCreate: (rule: Omit<BankFeedRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onRuleUpdate: (id: string, updates: Partial<BankFeedRule>) => void;
  onRuleDelete: (id: string) => void;
  onTransactionUpdate: (id: string, updates: Partial<BankTransaction>) => void;
}

const BankFeedManager: React.FC<BankFeedManagerProps> = ({
  accounts,
  transactions,
  rules,
  onAccountConnect,
  onAccountDisconnect,
  onSyncAccount,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  onTransactionUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [editingRule, setEditingRule] = useState<BankFeedRule | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  // Form state
  const [connectData, setConnectData] = useState({
    bankName: '',
    username: '',
    password: '',
  });

  const [ruleData, setRuleData] = useState({
    name: '',
    description: '',
    conditions: [] as Array<{
      field: string;
      operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
      value: string | number;
    }>,
    actions: [] as Array<{
      type: 'categorize' | 'tag' | 'flag' | 'skip';
      value: string;
    }>,
    isActive: true,
    priority: 1,
  });

  // Handle account connection
  const handleAccountConnect = () => {
    if (!connectData.bankName || !connectData.username || !connectData.password) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'warning' });
      return;
    }

    onAccountConnect(connectData.bankName, {
      username: connectData.username,
      password: connectData.password,
    });

    setSnackbar({ open: true, message: 'Bank account connected successfully', severity: 'success' });
    setShowConnectDialog(false);
    setConnectData({ bankName: '', username: '', password: '' });
  };

  // Handle rule creation/update
  const handleRuleSubmit = () => {
    if (!ruleData.name || ruleData.conditions.length === 0 || ruleData.actions.length === 0) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'warning' });
      return;
    }

    if (editingRule) {
      onRuleUpdate(editingRule.id, ruleData);
      setSnackbar({ open: true, message: 'Rule updated successfully', severity: 'success' });
    } else {
      onRuleCreate(ruleData);
      setSnackbar({ open: true, message: 'Rule created successfully', severity: 'success' });
    }

    setShowRuleDialog(false);
    setEditingRule(null);
    setRuleData({
      name: '',
      description: '',
      conditions: [],
      actions: [],
      isActive: true,
      priority: 1,
    });
  };

  // Handle rule edit
  const handleRuleEdit = (rule: BankFeedRule) => {
    setEditingRule(rule);
    setRuleData({
      name: rule.name,
      description: rule.description,
      conditions: rule.conditions,
      actions: rule.actions,
      isActive: rule.isActive,
      priority: rule.priority,
    });
    setShowRuleDialog(true);
  };

  // Handle rule delete
  const handleRuleDelete = (rule: BankFeedRule) => {
    if (window.confirm(`Are you sure you want to delete "${rule.name}"?`)) {
      onRuleDelete(rule.id);
      setSnackbar({ open: true, message: 'Rule deleted successfully', severity: 'success' });
    }
  };

  // Handle account sync
  const handleAccountSync = (accountId: string) => {
    onSyncAccount(accountId);
    setSnackbar({ open: true, message: 'Sync started', severity: 'info' });
  };

  // Handle account disconnect
  const handleAccountDisconnect = (accountId: string) => {
    if (window.confirm('Are you sure you want to disconnect this account?')) {
      onAccountDisconnect(accountId);
      setSnackbar({ open: true, message: 'Account disconnected successfully', severity: 'success' });
    }
  };

  // Get account status color
  const getAccountStatusColor = (account: BankAccount): string => {
    if (!account.isActive) return '#f44336';
    if (!account.lastSyncAt) return '#ff9800';
    const daysSinceSync = differenceInDays(new Date(), account.lastSyncAt);
    if (daysSinceSync > 7) return '#ff9800';
    return '#4caf50';
  };

  // Get account status text
  const getAccountStatusText = (account: BankAccount): string => {
    if (!account.isActive) return 'Inactive';
    if (!account.lastSyncAt) return 'Never synced';
    const daysSinceSync = differenceInDays(new Date(), account.lastSyncAt);
    if (daysSinceSync > 7) return 'Sync overdue';
    return 'Up to date';
  };

  // Get transaction type color
  const getTransactionTypeColor = (type: 'debit' | 'credit'): string => {
    return type === 'debit' ? '#f44336' : '#4caf50';
  };

  // Get transaction type icon
  const getTransactionTypeIcon = (type: 'debit' | 'credit') => {
    return type === 'debit' ? '↓' : '↑';
  };

  // Filter transactions by account
  const getFilteredTransactions = (accountId?: string) => {
    if (!accountId) return transactions;
    return transactions.filter(tx => tx.accountId === accountId);
  };

  // Get account statistics
  const getAccountStats = (accountId: string) => {
    const accountTransactions = getFilteredTransactions(accountId);
    const totalAmount = accountTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const pendingCount = accountTransactions.filter(tx => tx.isPending).length;
    const reconciledCount = accountTransactions.filter(tx => tx.isReconciled).length;
    const duplicateCount = accountTransactions.filter(tx => tx.isDuplicate).length;

    return {
      totalTransactions: accountTransactions.length,
      totalAmount,
      pendingCount,
      reconciledCount,
      duplicateCount,
    };
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bank Feed Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' })}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowConnectDialog(true)}
          >
            Connect Account
          </Button>
        </Box>
      </Box>

      {/* Account Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {accounts.map((account) => {
          const stats = getAccountStats(account.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalance color="primary" />
                      <Typography variant="h6">
                        {account.accountName}
                      </Typography>
                    </Box>
                    <Chip
                      label={getAccountStatusText(account)}
                      size="small"
                      sx={{ bgcolor: getAccountStatusColor(account), color: 'white' }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {account.bankName} • {account.accountType} • ****{account.lastFourDigits}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Transactions: {stats.totalTransactions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Balance: ${stats.totalAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending: {stats.pendingCount}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Sync />}
                      onClick={() => handleAccountSync(account.id)}
                    >
                      Sync
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Settings />}
                      onClick={() => setSnackbar({ open: true, message: 'Account settings coming soon', severity: 'info' })}
                    >
                      Settings
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleAccountDisconnect(account.id)}
                    >
                      Disconnect
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Transactions" />
            <Tab label="Rules" />
            <Tab label="Sync Status" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Transactions Tab */}
          {activeTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction</TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {transaction.description}
                          </Typography>
                          {transaction.merchant && (
                            <Typography variant="caption" color="text.secondary">
                              {transaction.merchant}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {accounts.find(acc => acc.id === transaction.accountId)?.accountName || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {getTransactionTypeIcon(transaction.type)}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color={getTransactionTypeColor(transaction.type)}>
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {transaction.category && (
                            <Chip
                              label={transaction.category}
                              size="small"
                              color="primary"
                            />
                          )}
                          {transaction.subcategory && (
                            <Chip
                              label={transaction.subcategory}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {transaction.isPending && (
                            <Chip label="Pending" size="small" color="warning" />
                          )}
                          {transaction.isReconciled && (
                            <Chip label="Reconciled" size="small" color="success" />
                          )}
                          {transaction.isDuplicate && (
                            <Chip label="Duplicate" size="small" color="error" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(transaction.date, 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowTransactionDialog(true);
                            }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => setSnackbar({ open: true, message: 'Edit transaction coming soon', severity: 'info' })}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Rules Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Bank Feed Rules
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowRuleDialog(true)}
                >
                  Create Rule
                </Button>
              </Box>

              <Grid container spacing={2}>
                {rules.map((rule) => (
                  <Grid item xs={12} md={6} key={rule.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            {rule.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={() => handleRuleEdit(rule)}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleRuleDelete(rule)} color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {rule.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Chip
                            label={rule.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={rule.isActive ? 'success' : 'default'}
                          />
                          <Chip
                            label={`Priority: ${rule.priority}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="body2">Conditions</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {rule.conditions.map((condition, index) => (
                              <Typography key={index} variant="body2">
                                {condition.field} {condition.operator} {condition.value}
                              </Typography>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="body2">Actions</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {rule.actions.map((action, index) => (
                              <Typography key={index} variant="body2">
                                {action.type}: {action.value}
                              </Typography>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Sync Status Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sync Status
              </Typography>
              <Grid container spacing={2}>
                {accounts.map((account) => (
                  <Grid item xs={12} md={6} key={account.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {account.accountName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {account.bankName}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Last Sync: {account.lastSyncAt ? format(account.lastSyncAt, 'MMM dd, yyyy HH:mm') : 'Never'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status: {getAccountStatusText(account)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<Sync />}
                            onClick={() => handleAccountSync(account.id)}
                            fullWidth
                          >
                            Sync Now
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Card>

      {/* Connect Account Dialog */}
      <Dialog
        open={showConnectDialog}
        onClose={() => setShowConnectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Connect Bank Account
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Bank</InputLabel>
              <Select
                value={connectData.bankName}
                onChange={(e) => setConnectData({ ...connectData, bankName: e.target.value })}
              >
                <MenuItem value="chase">Chase Bank</MenuItem>
                <MenuItem value="bankofamerica">Bank of America</MenuItem>
                <MenuItem value="wells_fargo">Wells Fargo</MenuItem>
                <MenuItem value="citibank">Citibank</MenuItem>
                <MenuItem value="us_bank">U.S. Bank</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Username"
              value={connectData.username}
              onChange={(e) => setConnectData({ ...connectData, username: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={connectData.password}
              onChange={(e) => setConnectData({ ...connectData, password: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConnectDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAccountConnect} variant="contained">
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rule Dialog */}
      <Dialog
        open={showRuleDialog}
        onClose={() => setShowRuleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRule ? 'Edit Rule' : 'Create Rule'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Rule Name"
              value={ruleData.name}
              onChange={(e) => setRuleData({ ...ruleData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={ruleData.description}
              onChange={(e) => setRuleData({ ...ruleData, description: e.target.value })}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={ruleData.priority}
                  onChange={(e) => setRuleData({ ...ruleData, priority: Number(e.target.value) })}
                >
                  <MenuItem value={1}>High</MenuItem>
                  <MenuItem value={2}>Medium</MenuItem>
                  <MenuItem value={3}>Low</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={ruleData.isActive}
                    onChange={(e) => setRuleData({ ...ruleData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Conditions
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setSnackbar({ open: true, message: 'Add condition coming soon', severity: 'info' })}
              sx={{ mb: 2 }}
            >
              Add Condition
            </Button>
            
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setSnackbar({ open: true, message: 'Add action coming soon', severity: 'info' })}
            >
              Add Action
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRuleDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleRuleSubmit} variant="contained">
            {editingRule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog
        open={showTransactionDialog}
        onClose={() => setShowTransactionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Transaction Details
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="body1">
                    ${Math.abs(selectedTransaction.amount).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {format(selectedTransaction.date, 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.category || 'Uncategorized'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedTransaction.isPending && (
                      <Chip label="Pending" size="small" color="warning" />
                    )}
                    {selectedTransaction.isReconciled && (
                      <Chip label="Reconciled" size="small" color="success" />
                    )}
                    {selectedTransaction.isDuplicate && (
                      <Chip label="Duplicate" size="small" color="error" />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransactionDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BankFeedManager;







