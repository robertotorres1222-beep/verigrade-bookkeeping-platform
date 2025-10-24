import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Psychology,
  AccountBalance,
  AccountTree,
  TrendingUp,
  Add,
  Settings,
  Refresh,
  Download,
  FilterList,
  ViewList,
  ViewModule,
  Schedule,
  AttachMoney,
  Group,
  Business,
  Timeline,
  CheckCircle,
  Warning,
  Pause,
  PlayArrow,
  Stop,
  Rule,
  Automation,
  SmartToy,
} from '@mui/icons-material';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

// Import components
import MLCategorizationDashboard from '../components/MLCategorizationDashboard';
import BankFeedManager from '../components/BankFeedManager';
import WorkflowManager from '../components/WorkflowManager';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  vendor?: string;
  date: Date;
  category?: string;
  subcategory?: string;
  tags?: string[];
  confidence?: number;
  isManual?: boolean;
  userId: string;
}

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

interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'approval' | 'notification' | 'automation' | 'escalation';
  isActive: boolean;
  steps: any[];
  triggers: any[];
  conditions: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  entityId: string;
  entityType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled' | 'escalated';
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  assignedTo?: string;
  comments: any[];
  history: any[];
  createdAt: Date;
  updatedAt: Date;
}

const AdvancedAutomationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [bankRules, setBankRules] = useState<BankFeedRule[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowInstances, setWorkflowInstances] = useState<WorkflowInstance[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  // Initialize with sample data
  useEffect(() => {
    const sampleTransactions: Transaction[] = [
      {
        id: 'tx1',
        amount: -25.99,
        description: 'STARBUCKS COFFEE #1234',
        vendor: 'Starbucks',
        date: new Date(),
        category: 'Meals',
        subcategory: 'Coffee & Snacks',
        confidence: 0.95,
        isManual: false,
        userId: 'user1',
      },
      {
        id: 'tx2',
        amount: -150.00,
        description: 'OFFICE DEPOT #5678',
        vendor: 'Office Depot',
        date: new Date(),
        category: 'Office Supplies',
        subcategory: 'Paper & Stationery',
        confidence: 0.87,
        isManual: false,
        userId: 'user1',
      },
      {
        id: 'tx3',
        amount: 5000.00,
        description: 'CLIENT PAYMENT - ABC CORP',
        vendor: 'ABC Corp',
        date: new Date(),
        category: 'Revenue',
        confidence: 0.92,
        isManual: false,
        userId: 'user1',
      },
    ];

    const sampleBankAccounts: BankAccount[] = [
      {
        id: 'acc1',
        userId: 'user1',
        accountId: 'chase_123',
        accountName: 'Chase Business Checking',
        accountType: 'checking',
        bankName: 'Chase Bank',
        lastFourDigits: '1234',
        isActive: true,
        lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'acc2',
        userId: 'user1',
        accountId: 'bofa_456',
        accountName: 'Bank of America Savings',
        accountType: 'savings',
        bankName: 'Bank of America',
        lastFourDigits: '5678',
        isActive: true,
        lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleBankTransactions: BankTransaction[] = [
      {
        id: 'btx1',
        accountId: 'acc1',
        externalId: 'ext_123',
        amount: -25.99,
        description: 'STARBUCKS COFFEE #1234',
        date: new Date(),
        type: 'debit',
        category: 'Meals',
        subcategory: 'Coffee & Snacks',
        merchant: 'Starbucks',
        location: 'New York, NY',
        isPending: false,
        isReconciled: true,
        isDuplicate: false,
        confidence: 0.95,
        rawData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'btx2',
        accountId: 'acc1',
        externalId: 'ext_456',
        amount: -150.00,
        description: 'OFFICE DEPOT #5678',
        date: new Date(),
        type: 'debit',
        category: 'Office Supplies',
        subcategory: 'Paper & Stationery',
        merchant: 'Office Depot',
        location: 'New York, NY',
        isPending: false,
        isReconciled: true,
        isDuplicate: false,
        confidence: 0.87,
        rawData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleBankRules: BankFeedRule[] = [
      {
        id: 'rule1',
        userId: 'user1',
        name: 'Starbucks Categorization',
        description: 'Automatically categorize Starbucks transactions as Meals',
        conditions: [
          { field: 'description', operator: 'contains', value: 'starbucks' },
        ],
        actions: [
          { type: 'categorize', value: 'Meals' },
        ],
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule2',
        userId: 'user1',
        name: 'Office Supplies Rule',
        description: 'Categorize office supply purchases',
        conditions: [
          { field: 'description', operator: 'contains', value: 'office' },
        ],
        actions: [
          { type: 'categorize', value: 'Office Supplies' },
        ],
        isActive: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleWorkflows: Workflow[] = [
      {
        id: 'wf1',
        userId: 'user1',
        name: 'Invoice Approval',
        description: 'Standard invoice approval workflow',
        type: 'approval',
        isActive: true,
        steps: [],
        triggers: [],
        conditions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wf2',
        userId: 'user1',
        name: 'Expense Notification',
        description: 'Notify team of large expenses',
        type: 'notification',
        isActive: true,
        steps: [],
        triggers: [],
        conditions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleWorkflowInstances: WorkflowInstance[] = [
      {
        id: 'inst1',
        workflowId: 'wf1',
        entityId: 'inv_123',
        entityType: 'invoice',
        status: 'in_progress',
        currentStep: 1,
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        assignedTo: 'user2',
        comments: [],
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'inst2',
        workflowId: 'wf2',
        entityId: 'exp_456',
        entityType: 'expense',
        status: 'completed',
        currentStep: 2,
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        assignedTo: 'user3',
        comments: [],
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setTransactions(sampleTransactions);
    setBankAccounts(sampleBankAccounts);
    setBankTransactions(sampleBankTransactions);
    setBankRules(sampleBankRules);
    setWorkflows(sampleWorkflows);
    setWorkflowInstances(sampleWorkflowInstances);
  }, []);

  // Handle transaction update
  const handleTransactionUpdate = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
    setSnackbar({ open: true, message: 'Transaction updated successfully', severity: 'success' });
  };

  // Handle model retrain
  const handleModelRetrain = () => {
    setSnackbar({ open: true, message: 'Model retraining started', severity: 'info' });
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (transactionId: string, correctCategory: string, correctSubcategory?: string) => {
    setSnackbar({ open: true, message: 'Feedback submitted successfully', severity: 'success' });
  };

  // Handle bank account connection
  const handleAccountConnect = (bankName: string, credentials: any) => {
    const newAccount: BankAccount = {
      id: `acc_${Date.now()}`,
      userId: 'user1',
      accountId: `${bankName}_${Date.now()}`,
      accountName: `${bankName} Account`,
      accountType: 'checking',
      bankName,
      lastFourDigits: '1234',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setBankAccounts(prev => [...prev, newAccount]);
    setSnackbar({ open: true, message: 'Bank account connected successfully', severity: 'success' });
  };

  // Handle bank account disconnect
  const handleAccountDisconnect = (accountId: string) => {
    setBankAccounts(prev => prev.filter(acc => acc.id !== accountId));
    setSnackbar({ open: true, message: 'Bank account disconnected successfully', severity: 'success' });
  };

  // Handle account sync
  const handleSyncAccount = (accountId: string) => {
    setSnackbar({ open: true, message: 'Sync started', severity: 'info' });
  };

  // Handle rule creation
  const handleRuleCreate = (rule: Omit<BankFeedRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: BankFeedRule = {
      id: `rule_${Date.now()}`,
      ...rule,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setBankRules(prev => [...prev, newRule]);
    setSnackbar({ open: true, message: 'Rule created successfully', severity: 'success' });
  };

  // Handle rule update
  const handleRuleUpdate = (id: string, updates: Partial<BankFeedRule>) => {
    setBankRules(prev => prev.map(rule => rule.id === id ? { ...rule, ...updates } : rule));
    setSnackbar({ open: true, message: 'Rule updated successfully', severity: 'success' });
  };

  // Handle rule deletion
  const handleRuleDelete = (id: string) => {
    setBankRules(prev => prev.filter(rule => rule.id !== id));
    setSnackbar({ open: true, message: 'Rule deleted successfully', severity: 'success' });
  };

  // Handle transaction update
  const handleTransactionUpdate = (id: string, updates: Partial<BankTransaction>) => {
    setBankTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
    setSnackbar({ open: true, message: 'Transaction updated successfully', severity: 'success' });
  };

  // Handle workflow creation
  const handleWorkflowCreate = (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}`,
      ...workflow,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setSnackbar({ open: true, message: 'Workflow created successfully', severity: 'success' });
  };

  // Handle workflow update
  const handleWorkflowUpdate = (id: string, updates: Partial<Workflow>) => {
    setWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, ...updates } : wf));
    setSnackbar({ open: true, message: 'Workflow updated successfully', severity: 'success' });
  };

  // Handle workflow deletion
  const handleWorkflowDelete = (id: string) => {
    setWorkflows(prev => prev.filter(wf => wf.id !== id));
    setSnackbar({ open: true, message: 'Workflow deleted successfully', severity: 'success' });
  };

  // Handle workflow start
  const handleWorkflowStart = (workflowId: string, entityId: string, entityType: string, assignedTo?: string) => {
    const newInstance: WorkflowInstance = {
      id: `inst_${Date.now()}`,
      workflowId,
      entityId,
      entityType,
      status: 'pending',
      currentStep: 0,
      startedAt: new Date(),
      assignedTo,
      comments: [],
      history: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWorkflowInstances(prev => [...prev, newInstance]);
    setSnackbar({ open: true, message: 'Workflow started successfully', severity: 'success' });
  };

  // Handle workflow action
  const handleWorkflowAction = (instanceId: string, action: any) => {
    setWorkflowInstances(prev => prev.map(inst => 
      inst.id === instanceId 
        ? { ...inst, status: action.type === 'approve' ? 'completed' : 'rejected', updatedAt: new Date() }
        : inst
    ));
    setSnackbar({ open: true, message: 'Workflow action processed successfully', severity: 'success' });
  };

  // Handle workflow cancellation
  const handleWorkflowCancel = (instanceId: string, userId: string, reason?: string) => {
    setWorkflowInstances(prev => prev.map(inst => 
      inst.id === instanceId 
        ? { ...inst, status: 'cancelled', updatedAt: new Date() }
        : inst
    ));
    setSnackbar({ open: true, message: 'Workflow cancelled successfully', severity: 'success' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Advanced Automation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ML categorization, bank feeds, recurring invoices, and workflow automation
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setSnackbar({ open: true, message: 'Data refreshed', severity: 'info' })}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setSnackbar({ open: true, message: 'Export coming soon', severity: 'info' })}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    ML Accuracy
                  </Typography>
                  <Typography variant="h4">
                    87.3%
                  </Typography>
                </Box>
                <Psychology color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Bank Accounts
                  </Typography>
                  <Typography variant="h4">
                    {bankAccounts.length}
                  </Typography>
                </Box>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Workflows
                  </Typography>
                  <Typography variant="h4">
                    {workflows.filter(w => w.isActive).length}
                  </Typography>
                </Box>
                <AccountTree color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Automation Rules
                  </Typography>
                  <Typography variant="h4">
                    {bankRules.length}
                  </Typography>
                </Box>
                <Rule color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="ML Categorization" icon={<Psychology />} />
            <Tab label="Bank Feeds" icon={<AccountBalance />} />
            <Tab label="Workflows" icon={<AccountTree />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <MLCategorizationDashboard
              transactions={transactions}
              onTransactionUpdate={handleTransactionUpdate}
              onModelRetrain={handleModelRetrain}
              onFeedbackSubmit={handleFeedbackSubmit}
            />
          )}

          {activeTab === 1 && (
            <BankFeedManager
              accounts={bankAccounts}
              transactions={bankTransactions}
              rules={bankRules}
              onAccountConnect={handleAccountConnect}
              onAccountDisconnect={handleAccountDisconnect}
              onSyncAccount={handleSyncAccount}
              onRuleCreate={handleRuleCreate}
              onRuleUpdate={handleRuleUpdate}
              onRuleDelete={handleRuleDelete}
              onTransactionUpdate={handleTransactionUpdate}
            />
          )}

          {activeTab === 2 && (
            <WorkflowManager
              workflows={workflows}
              instances={workflowInstances}
              onWorkflowCreate={handleWorkflowCreate}
              onWorkflowUpdate={handleWorkflowUpdate}
              onWorkflowDelete={handleWorkflowDelete}
              onWorkflowStart={handleWorkflowStart}
              onWorkflowAction={handleWorkflowAction}
              onWorkflowCancel={handleWorkflowCancel}
            />
          )}
        </Box>
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setSnackbar({ open: true, message: 'Quick action menu', severity: 'info' })}
      >
        <Add />
      </Fab>

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
    </Container>
  );
};

export default AdvancedAutomationPage;







