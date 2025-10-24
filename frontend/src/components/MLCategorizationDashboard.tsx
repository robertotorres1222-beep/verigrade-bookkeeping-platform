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
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  CheckCircle,
  Warning,
  Refresh,
  Settings,
  Visibility,
  Edit,
  Delete,
  Add,
  FilterList,
  Download,
  Upload,
  Assessment,
  Timeline,
  Speed,
  Accuracy,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';

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

interface CategoryPrediction {
  category: string;
  subcategory?: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    category: string;
    confidence: number;
  }>;
}

interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: Record<string, Record<string, number>>;
  lastTrained: Date;
  trainingDataSize: number;
}

interface MLCategorizationDashboardProps {
  transactions: Transaction[];
  onTransactionUpdate: (id: string, updates: Partial<Transaction>) => void;
  onModelRetrain: () => void;
  onFeedbackSubmit: (transactionId: string, correctCategory: string, correctSubcategory?: string) => void;
}

const MLCategorizationDashboard: React.FC<MLCategorizationDashboardProps> = ({
  transactions,
  onTransactionUpdate,
  onModelRetrain,
  onFeedbackSubmit,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showPredictionDialog, setShowPredictionDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  // Form state
  const [feedbackData, setFeedbackData] = useState({
    correctCategory: '',
    correctSubcategory: '',
    comment: '',
  });

  // Load model performance on mount
  useEffect(() => {
    // Simulate loading model performance
    setModelPerformance({
      accuracy: 0.87,
      precision: 0.85,
      recall: 0.83,
      f1Score: 0.84,
      confusionMatrix: {
        'Office Supplies': { 'Office Supplies': 45, 'Travel': 2, 'Meals': 1 },
        'Travel': { 'Office Supplies': 3, 'Travel': 38, 'Meals': 2 },
        'Meals': { 'Office Supplies': 1, 'Travel': 1, 'Meals': 42 },
      },
      lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      trainingDataSize: 1250,
    });
  }, []);

  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (!selectedTransaction || !feedbackData.correctCategory) {
      setSnackbar({ open: true, message: 'Please select a correct category', severity: 'warning' });
      return;
    }

    onFeedbackSubmit(
      selectedTransaction.id,
      feedbackData.correctCategory,
      feedbackData.correctSubcategory || undefined
    );

    setSnackbar({ open: true, message: 'Feedback submitted successfully', severity: 'success' });
    setShowFeedbackDialog(false);
    setFeedbackData({ correctCategory: '', correctSubcategory: '', comment: '' });
  };

  // Handle model retraining
  const handleModelRetrain = () => {
    onModelRetrain();
    setSnackbar({ open: true, message: 'Model retraining started', severity: 'info' });
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#4caf50'; // Green
    if (confidence >= 0.6) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  // Get confidence label
  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  // Filter transactions by confidence
  const getFilteredTransactions = (confidenceFilter?: 'high' | 'medium' | 'low') => {
    if (!confidenceFilter) return transactions;
    
    return transactions.filter(tx => {
      const confidence = tx.confidence || 0;
      switch (confidenceFilter) {
        case 'high':
          return confidence >= 0.8;
        case 'medium':
          return confidence >= 0.6 && confidence < 0.8;
        case 'low':
          return confidence < 0.6;
        default:
          return true;
      }
    });
  };

  // Get category statistics
  const getCategoryStats = () => {
    const stats: Record<string, { count: number; totalAmount: number; avgConfidence: number }> = {};
    
    transactions.forEach(tx => {
      const category = tx.category || 'Uncategorized';
      if (!stats[category]) {
        stats[category] = { count: 0, totalAmount: 0, avgConfidence: 0 };
      }
      stats[category].count++;
      stats[category].totalAmount += Math.abs(tx.amount);
      stats[category].avgConfidence += tx.confidence || 0;
    });

    // Calculate average confidence
    Object.keys(stats).forEach(category => {
      stats[category].avgConfidence /= stats[category].count;
    });

    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          ML Categorization Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleModelRetrain}
          >
            Retrain Model
          </Button>
          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={() => setSnackbar({ open: true, message: 'Settings coming soon', severity: 'info' })}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* Model Performance Cards */}
      {modelPerformance && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Model Accuracy
                    </Typography>
                    <Typography variant="h4">
                      {(modelPerformance.accuracy * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Accuracy color="primary" sx={{ fontSize: 40 }} />
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
                      Training Data
                    </Typography>
                    <Typography variant="h4">
                      {modelPerformance.trainingDataSize.toLocaleString()}
                    </Typography>
                  </Box>
                  <Assessment color="primary" sx={{ fontSize: 40 }} />
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
                      Last Trained
                    </Typography>
                    <Typography variant="h6">
                      {format(modelPerformance.lastTrained, 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Timeline color="primary" sx={{ fontSize: 40 }} />
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
                      F1 Score
                    </Typography>
                    <Typography variant="h4">
                      {(modelPerformance.f1Score * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <TrendingUp color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Transactions" />
            <Tab label="High Confidence" />
            <Tab label="Medium Confidence" />
            <Tab label="Low Confidence" />
            <Tab label="Category Stats" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Transactions Tab */}
          {activeTab < 4 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredTransactions(
                    activeTab === 0 ? undefined : 
                    activeTab === 1 ? 'high' : 
                    activeTab === 2 ? 'medium' : 'low'
                  ).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {transaction.description}
                          </Typography>
                          {transaction.vendor && (
                            <Typography variant="caption" color="text.secondary">
                              {transaction.vendor}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={transaction.category || 'Uncategorized'}
                            size="small"
                            color={transaction.category ? 'primary' : 'default'}
                          />
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
                          <LinearProgress
                            variant="determinate"
                            value={(transaction.confidence || 0) * 100}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getConfidenceColor(transaction.confidence || 0),
                              },
                            }}
                          />
                          <Typography variant="caption">
                            {getConfidenceLabel(transaction.confidence || 0)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </Typography>
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
                              setShowPredictionDialog(true);
                            }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Provide Feedback">
                            <IconButton size="small" onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowFeedbackDialog(true);
                            }}>
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

          {/* Category Stats Tab */}
          {activeTab === 4 && (
            <Grid container spacing={2}>
              {Object.entries(categoryStats).map(([category, stats]) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {category}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Transactions: {stats.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount: ${stats.totalAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Confidence: {(stats.avgConfidence * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stats.avgConfidence * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getConfidenceColor(stats.avgConfidence),
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Card>

      {/* Prediction Dialog */}
      <Dialog
        open={showPredictionDialog}
        onClose={() => setShowPredictionDialog(false)}
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
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.category || 'Uncategorized'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Confidence
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(selectedTransaction.confidence || 0) * 100}
                      sx={{ width: 100, height: 6 }}
                    />
                    <Typography variant="body2">
                      {((selectedTransaction.confidence || 0) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPredictionDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Provide Feedback
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Correct Category</InputLabel>
              <Select
                value={feedbackData.correctCategory}
                onChange={(e) => setFeedbackData({ ...feedbackData, correctCategory: e.target.value })}
              >
                <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                <MenuItem value="Travel">Travel</MenuItem>
                <MenuItem value="Meals">Meals</MenuItem>
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Equipment">Equipment</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Correct Subcategory</InputLabel>
              <Select
                value={feedbackData.correctSubcategory}
                onChange={(e) => setFeedbackData({ ...feedbackData, correctSubcategory: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Paper & Stationery">Paper & Stationery</MenuItem>
                <MenuItem value="Writing Supplies">Writing Supplies</MenuItem>
                <MenuItem value="Computer Supplies">Computer Supplies</MenuItem>
                <MenuItem value="Office Furniture">Office Furniture</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Additional Comments"
              value={feedbackData.comment}
              onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedbackDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleFeedbackSubmit} variant="contained">
            Submit Feedback
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

export default MLCategorizationDashboard;






