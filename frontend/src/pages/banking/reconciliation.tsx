import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import { PlayArrow as PlayIcon, CheckCircle as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logger from '../../utils/logger';

interface ReconciliationSession {
  id: string;
  accountId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  reconciliationScore: number;
  createdAt: string;
  completedAt?: string;
}

interface ReconciliationMatch {
  id: string;
  bankTransactionId: string;
  bookTransactionId: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'manual';
  difference?: number;
  notes?: string;
  createdAt: string;
}

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountType: string;
}

const Reconciliation: React.FC = () => {
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = useState({
    accountId: '',
    startDate: '',
    endDate: ''
  });
  const [currentSession, setCurrentSession] = useState<ReconciliationSession | null>(null);
  const [matches, setMatches] = useState<ReconciliationMatch[]>([]);

  useEffect(() => {
    fetchSessions();
    fetchAccounts();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/banking/reconciliation/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(response.data.sessions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reconciliation sessions');
      logger.error('Error fetching reconciliation sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/banking/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data.accounts);
    } catch (err: any) {
      logger.error('Error fetching accounts:', err);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setActiveStep(0);
    setFormData({
      accountId: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveStep(0);
    setCurrentSession(null);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreateSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/banking/reconciliation', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCurrentSession(response.data.session);
      handleNext();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reconciliation session');
      logger.error('Error creating reconciliation session:', err);
    }
  };

  const handleStartReconciliation = async () => {
    if (!currentSession) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/banking/reconciliation/${currentSession.id}/automated`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMatches(response.data.result.matches);
      handleNext();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start reconciliation');
      logger.error('Error starting reconciliation:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon color="success" />;
      case 'in_progress': return <PlayIcon color="warning" />;
      case 'failed': return <WarningIcon color="error" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
          Bank Reconciliation
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={handleOpenDialog}
        >
          Start Reconciliation
        </Button>
      </Box>

      {sessions.length > 0 ? (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Matches</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => {
                const account = accounts.find(acc => acc.id === session.accountId);
                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      {account ? `${account.accountName} (${account.bankName})` : 'Unknown Account'}
                    </TableCell>
                    <TableCell>
                      {formatDate(session.startDate)} - {formatDate(session.endDate)}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(session.status)}
                        <Chip
                          label={session.status}
                          color={getStatusColor(session.status)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {session.reconciliationScore}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {session.matchedTransactions} / {session.totalTransactions}
                    </TableCell>
                    <TableCell>
                      {formatDate(session.createdAt)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/banking/reconciliation/${session.id}`}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Reconciliation Sessions
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Start your first reconciliation to match bank transactions with your books.
          </Typography>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={handleOpenDialog}
          >
            Start First Reconciliation
          </Button>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Bank Reconciliation</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Select Account and Period</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    select
                    label="Bank Account"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    margin="normal"
                    required
                  >
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.accountName} ({account.bankName})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleCreateSession}
                    disabled={!formData.accountId || !formData.startDate || !formData.endDate}
                  >
                    Create Session
                  </Button>
                </Box>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Review Session</StepLabel>
              <StepContent>
                {currentSession && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Reconciliation Session Created
                    </Typography>
                    <Typography variant="body1">
                      Account: {accounts.find(acc => acc.id === currentSession.accountId)?.accountName}
                    </Typography>
                    <Typography variant="body1">
                      Period: {formatDate(currentSession.startDate)} - {formatDate(currentSession.endDate)}
                    </Typography>
                    <Typography variant="body1">
                      Status: {currentSession.status}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleStartReconciliation}
                    disabled={!currentSession}
                  >
                    Start Automated Reconciliation
                  </Button>
                </Box>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Results</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Reconciliation Results
                  </Typography>
                  {matches.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Match Type</TableCell>
                            <TableCell>Confidence</TableCell>
                            <TableCell>Difference</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {matches.slice(0, 5).map((match) => (
                            <TableRow key={match.id}>
                              <TableCell>
                                <Chip
                                  label={match.matchType}
                                  color={match.matchType === 'exact' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {(match.confidence * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell>
                                {match.difference ? formatCurrency(match.difference) : '-'}
                              </TableCell>
                              <TableCell>
                                {match.notes || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body1" color="textSecondary">
                      No matches found.
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleCloseDialog}
                  >
                    Complete
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reconciliation;






