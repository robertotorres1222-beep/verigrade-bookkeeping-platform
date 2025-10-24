import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  description?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  brand?: string;
  isDefault: boolean;
}

const ClientInvoices: React.FC = () => {
  const router = useRouter();
  const { clientId } = router.query;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    if (clientId) {
      fetchInvoices();
      fetchPaymentMethods();
    }
  }, [clientId]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/client-portal/${clientId}/invoices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`/api/payments/${clientId}/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.total);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.total);
    setPaymentDialogOpen(true);
  };

  const processPayment = async () => {
    if (!selectedInvoice || !selectedPaymentMethod) return;

    try {
      const response = await fetch(`/api/client-portal/${clientId}/invoices/${selectedInvoice.id}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethodId: selectedPaymentMethod,
          amount: paymentAmount
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setPaymentDialogOpen(false);
        fetchInvoices(); // Refresh invoices
        alert('Payment processed successfully!');
      } else {
        alert(`Payment failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment processing failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'sent': return 'warning';
      case 'viewed': return 'info';
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
        <Typography>Loading invoices...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Invoices
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>{formatCurrency(invoice.total)}</TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.status} 
                    color={getStatusColor(invoice.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Invoice">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {invoice.status !== 'paid' && (
                    <Tooltip title="Pay Invoice">
                      <IconButton 
                        size="small" 
                        onClick={() => handlePayInvoice(invoice)}
                      >
                        <PaymentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Download PDF">
                    <IconButton size="small">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Invoice Details Dialog */}
      <Dialog 
        open={!!selectedInvoice && !paymentDialogOpen} 
        onClose={() => setSelectedInvoice(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Invoice {selectedInvoice?.invoiceNumber}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Issue Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedInvoice.issueDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedInvoice.dueDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip 
                    label={selectedInvoice.status} 
                    color={getStatusColor(selectedInvoice.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(selectedInvoice.total)}
                  </Typography>
                </Grid>
              </Grid>

              {selectedInvoice.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedInvoice.description}
                  </Typography>
                </Box>
              )}

              <Typography variant="h6" gutterBottom>
                Line Items
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  Subtotal: {formatCurrency(selectedInvoice.amount)}
                </Typography>
                <Typography variant="body1">
                  Tax: {formatCurrency(selectedInvoice.tax)}
                </Typography>
                <Typography variant="h6">
                  Total: {formatCurrency(selectedInvoice.total)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedInvoice(null)}>
            Close
          </Button>
          {selectedInvoice?.status !== 'paid' && (
            <Button 
              variant="contained" 
              onClick={() => handlePayInvoice(selectedInvoice!)}
            >
              Pay Invoice
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Pay Invoice {selectedInvoice?.invoiceNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Amount: {formatCurrency(selectedInvoice?.total || 0)}
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.brand} •••• {method.lastFour}
                    {method.isDefault && ' (Default)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
              inputProps={{ min: 0, max: selectedInvoice?.total || 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={processPayment}
            disabled={!selectedPaymentMethod || paymentAmount <= 0}
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientInvoices;







